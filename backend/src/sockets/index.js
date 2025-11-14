const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');
const Message = require('../models/Message');
const Consultation = require('../models/Consultation');

const setupSocketIO = (io) => {
  // Authentication middleware for socket connections
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication error: No token provided'));
      }

      const decoded = verifyToken(token);
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }

      const user = await User.findById(decoded.userId).select('-passwordHash');
      if (!user) {
        return next(new Error('Authentication error: User not found'));
      }

      socket.user = user;
      next();
    } catch (error) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`✅ User connected: ${socket.user.name} (${socket.user.role})`);

    // Join consultation room
    socket.on('joinConsultation', async ({ consultationId }) => {
      try {
        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
          socket.emit('error', { message: 'Consultation not found' });
          return;
        }

        // Verify user has access to this consultation
        if (
          socket.user.role !== 'admin' &&
          consultation.patientId.toString() !== socket.user._id.toString() &&
          consultation.doctorId.toString() !== socket.user._id.toString()
        ) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        const roomName = `consultation_${consultationId}`;
        socket.join(roomName);
        console.log(`User ${socket.user.name} joined room: ${roomName}`);

        socket.emit('joined', { consultationId, room: roomName });
      } catch (error) {
        socket.emit('error', { message: 'Failed to join consultation' });
      }
    });

    // Handle messages
    socket.on('message', async ({ consultationId, text }) => {
      try {
        if (!text || !text.trim()) {
          socket.emit('error', { message: 'Message text is required' });
          return;
        }

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
          socket.emit('error', { message: 'Consultation not found' });
          return;
        }

        // Verify user has access
        if (
          socket.user.role !== 'admin' &&
          consultation.patientId.toString() !== socket.user._id.toString() &&
          consultation.doctorId.toString() !== socket.user._id.toString()
        ) {
          socket.emit('error', { message: 'Access denied' });
          return;
        }

        // Determine recipient
        const toUserId =
          consultation.patientId.toString() === socket.user._id.toString()
            ? consultation.doctorId
            : consultation.patientId;

        // Save message to database
        const message = await Message.create({
          consultationId,
          fromUserId: socket.user._id,
          toUserId,
          text: text.trim(),
        });

        // Populate message with user details
        await message.populate('fromUserId', 'name role');
        await message.populate('toUserId', 'name role');

        // Emit to all clients in the consultation room
        const roomName = `consultation_${consultationId}`;
        io.to(roomName).emit('message', {
          id: message._id,
          consultationId: message.consultationId,
          fromUserId: message.fromUserId,
          toUserId: message.toUserId,
          text: message.text,
          createdAt: message.createdAt,
        });

        console.log(`Message sent in consultation ${consultationId} by ${socket.user.name}`);
      } catch (error) {
        console.error('Error handling message:', error);
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`❌ User disconnected: ${socket.user.name}`);
    });
  });
};

module.exports = setupSocketIO;

