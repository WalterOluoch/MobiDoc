const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const { connectDB } = require('./db');
const config = require('./config');
const setupSocketIO = require('./sockets/index');

// Connect to database
connectDB();

// Create HTTP server
const server = http.createServer(app);

// Setup Socket.IO
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

setupSocketIO(io);

// Start server
const PORT = config.port;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.IO server ready`);
  console.log(`🌍 Environment: ${config.nodeEnv}`);
});

module.exports = { server, io };

