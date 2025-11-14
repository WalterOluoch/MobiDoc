const Consultation = require('../models/Consultation');
const User = require('../models/User');
const Message = require('../models/Message');

const createConsultation = async (req, res, next) => {
  try {
    const { specialization } = req.body;
    const patientId = req.user._id;

    if (!specialization) {
      return res.status(400).json({ error: 'Specialization is required' });
    }

    if (req.user.role !== 'patient') {
      return res.status(403).json({ error: 'Only patients can create consultations' });
    }

    // Find first available approved doctor with the specialization
    const doctor = await User.findOne({
      role: 'doctor',
      kycStatus: 'approved',
      available: true,
      specialties: { $in: [specialization] },
    });

    if (!doctor) {
      return res.status(404).json({
        error: 'No available doctor found for this specialization',
      });
    }

    const consultation = await Consultation.create({
      patientId,
      doctorId: doctor._id,
      specialization,
      status: 'pending',
    });

    res.status(201).json({
      message: 'Consultation created successfully',
      consultation: {
        id: consultation._id,
        patientId: consultation.patientId,
        doctorId: consultation.doctorId,
        specialization: consultation.specialization,
        status: consultation.status,
        createdAt: consultation.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name email specialties');

    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Check if user has access to this consultation
    if (
      req.user.role !== 'admin' &&
      consultation.patientId._id.toString() !== req.user._id.toString() &&
      consultation.doctorId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ consultation });
  } catch (error) {
    next(error);
  }
};

const getMyConsultations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const role = req.user.role;

    let query = {};
    if (role === 'patient') {
      query.patientId = userId;
    } else if (role === 'doctor') {
      query.doctorId = userId;
    } else {
      return res.status(403).json({ error: 'Invalid role' });
    }

    const consultations = await Consultation.find(query)
      .populate(role === 'patient' ? 'doctorId' : 'patientId', 'name email')
      .sort({ createdAt: -1 });

    res.json({ consultations });
  } catch (error) {
    next(error);
  }
};

const updateConsultationStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['pending', 'active', 'completed', 'cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Check access
    if (
      req.user.role !== 'admin' &&
      consultation.patientId.toString() !== req.user._id.toString() &&
      consultation.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    consultation.status = status;
    await consultation.save();

    res.json({
      message: 'Consultation status updated',
      consultation,
    });
  } catch (error) {
    next(error);
  }
};

const getConsultationMessages = async (req, res, next) => {
  try {
    const { id } = req.params;

    const consultation = await Consultation.findById(id);
    if (!consultation) {
      return res.status(404).json({ error: 'Consultation not found' });
    }

    // Check access
    if (
      req.user.role !== 'admin' &&
      consultation.patientId.toString() !== req.user._id.toString() &&
      consultation.doctorId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const messages = await Message.find({ consultationId: id })
      .populate('fromUserId', 'name role')
      .populate('toUserId', 'name role')
      .sort({ createdAt: 1 });

    res.json({ messages });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createConsultation,
  getConsultation,
  getMyConsultations,
  updateConsultationStatus,
  getConsultationMessages,
};

