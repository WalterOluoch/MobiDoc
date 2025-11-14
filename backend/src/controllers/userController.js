const User = require('../models/User');
const KycAudit = require('../models/KycAudit');

const uploadKyc = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files uploaded' });
    }

    if (req.user.role !== 'doctor') {
      return res.status(403).json({ error: 'Only doctors can upload KYC documents' });
    }

    const fileUrls = req.files.map((file) => `/uploads/${file.filename}`);

    const user = await User.findById(req.user._id);
    user.kycDocs = [...(user.kycDocs || []), ...fileUrls];
    user.kycStatus = 'pending';
    await user.save();

    // Create audit record
    await KycAudit.create({
      userId: user._id,
      submittedDocs: fileUrls,
    });

    res.json({
      message: 'KYC documents uploaded successfully',
      kycDocs: user.kycDocs,
      kycStatus: user.kycStatus,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { uploadKyc };

