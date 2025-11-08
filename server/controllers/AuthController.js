// controllers/authController.js
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { 
  generateAccessToken, 
  generateRefreshToken, 
  JWT_REFRESH_SECRET 
} = require('../middleware/auth');

exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email or username' 
      });
    }

    // Create new user
    const user = new User({
      username,
      email,
      password,
      role: role || 'player'
    });

    await user.save();

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Save refresh token to user
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days from now
    user.addRefreshToken(refreshToken, refreshTokenExpires);
    await user.save();

    res.status(201).json({
      message: 'User created successfully',
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpires: '15m',
        refreshTokenExpires: '7d'
      },
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ 
      message: 'Error creating user', 
      error: error.message 
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Check password
    const isMatch = await user.correctPassword(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);
    
    // Save refresh token to user
    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 7); // 7 days from now
    user.addRefreshToken(refreshToken, refreshTokenExpires);
    await user.save();

    res.json({
      message: 'Login successful',
      tokens: {
        accessToken,
        refreshToken,
        accessTokenExpires: '15m',
        refreshTokenExpires: '7d'
      },
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ 
      message: 'Error during login', 
      error: error.message 
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }

    // Verify refresh token
    const decoded = jwt.verify(refreshToken, JWT_REFRESH_SECRET);
    
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token type' });
    }

    // Find user and validate refresh token
    const user = await User.findById(decoded.id);
    if (!user || !user.isValidRefreshToken(refreshToken)) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user);

    res.json({
      message: 'Token refreshed successfully',
      accessToken: newAccessToken,
      accessTokenExpires: '15m'
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
    
    console.error('Refresh token error:', error);
    res.status(500).json({ 
      message: 'Error refreshing token', 
      error: error.message 
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    const user = await User.findById(req.user.id);

    if (refreshToken && user) {
      user.removeRefreshToken(refreshToken);
      await user.save();
    }

    res.json({ message: 'Logout successful' });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({ 
      message: 'Error during logout', 
      error: error.message 
    });
  }
};

exports.logoutAll = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    user.refreshTokens = [];
    await user.save();

    res.json({ message: 'Logged out from all devices' });
  } catch (error) {
    console.error('Logout all error:', error);
    res.status(500).json({ 
      message: 'Error during logout', 
      error: error.message 
    });
  }
};

