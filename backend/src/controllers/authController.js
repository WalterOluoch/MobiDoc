const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateTokens, verifyToken } = require('../utils/jwt');
const config = require('../config');

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, specialties, licenseNumber } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['patient', 'doctor'].includes(role)) {
      return res.status(400).json({ error: 'Invalid role for registration' });
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);

    const userData = {
      name,
      email,
      passwordHash,
      role,
      phone,
    };

    if (role === 'doctor') {
      userData.specialties = specialties || [];
      userData.licenseNumber = licenseNumber;
      userData.kycStatus = 'pending';
    }

    const user = await User.create(userData);

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const { accessToken, refreshToken } = generateTokens(user._id, user.role);

    res.json({
      message: 'Login successful',
      user: {
        _id: user._id,
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        kycStatus: user.kycStatus,
      },
      accessToken,
      refreshToken,
    });
  } catch (error) {
    next(error);
  }
};

const refresh = async (req, res, next) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }

    const decoded = verifyToken(refreshToken);
    if (!decoded || decoded.type !== 'refresh') {
      return res.status(401).json({ error: 'Invalid refresh token' });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    const { accessToken } = generateTokens(user._id, user.role);

    res.json({
      accessToken,
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-passwordHash');
    res.json({ user });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, refresh, getMe };

