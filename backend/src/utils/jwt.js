const jwt = require('jsonwebtoken');
const config = require('../config');

const generateTokens = (userId, role) => {
  const accessToken = jwt.sign(
    { userId, role },
    config.jwtSecret,
    { expiresIn: config.jwtExpiresIn }
  );

  const refreshToken = jwt.sign(
    { userId, role, type: 'refresh' },
    config.jwtSecret,
    { expiresIn: config.refreshExpiresIn }
  );

  return { accessToken, refreshToken };
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.jwtSecret);
  } catch (error) {
    return null;
  }
};

module.exports = { generateTokens, verifyToken };

