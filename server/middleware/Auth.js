// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

// Generate access token (short-lived)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    JWT_SECRET,
    { expiresIn: '15m' } // 15 minutes
  );
};

// Generate refresh token (long-lived)
const generateRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, type: 'refresh' },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' } // 7 days
  );
};

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password -refreshTokens');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired' });
    }
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const requireGameMaster = (req, res, next) => {
  if (req.user.role !== 'gameMaster') {
    return res.status(403).json({ message: 'Access denied. GameMaster role required.' });
  }
  next();
};

module.exports = { 
  auth, 
  requireGameMaster, 
  JWT_SECRET, 
  JWT_REFRESH_SECRET,
  generateAccessToken,
  generateRefreshToken
};