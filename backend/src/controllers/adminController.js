const User = require('../models/User');
const KycAudit = require('../models/KycAudit');

const getPendingDoctors = async (req, res, next) => {
  try {
    const { status = 'pending' } = req.query;

    const doctors = await User.find({
      role: 'doctor',
      kycStatus: status,
    }).select('-passwordHash');

    res.json({ doctors });
  } catch (error) {
    next(error);
  }
};

const reviewDoctor = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { action, reviewNotes } = req.body; // action: 'approve' or 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).json({ error: 'Invalid action. Use "approve" or "reject"' });
    }

    const doctor = await User.findById(id);
    if (!doctor || doctor.role !== 'doctor') {
      return res.status(404).json({ error: 'Doctor not found' });
    }

    doctor.kycStatus = action === 'approve' ? 'approved' : 'rejected';
    await doctor.save();

    // Update or create audit record
    const audit = await KycAudit.findOne({ userId: id }).sort({ createdAt: -1 });
    if (audit) {
      audit.adminReviewer = req.user._id;
      audit.reviewNotes = reviewNotes;
      audit.reviewedAt = new Date();
      await audit.save();
    } else {
      await KycAudit.create({
        userId: id,
        adminReviewer: req.user._id,
        reviewNotes,
        reviewedAt: new Date(),
      });
    }

    res.json({
      message: `Doctor ${action}d successfully`,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        kycStatus: doctor.kycStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getPendingDoctors, reviewDoctor };

