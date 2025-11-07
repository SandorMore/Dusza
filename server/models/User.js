// models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  role: {
    type: String,
    enum: ['gameMaster', 'player'],
    default: 'player'
  },
  refreshTokens: [{
    token: String,
    expiresAt: Date
  }]
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.addRefreshToken = function(token, expiresAt) {
  this.refreshTokens = this.refreshTokens.slice(-4);
  this.refreshTokens.push({ token, expiresAt });
};

userSchema.methods.isValidRefreshToken = function(token) {
  const tokenData = this.refreshTokens.find(t => t.token === token);
  return tokenData && tokenData.expiresAt > new Date();
};

userSchema.methods.removeRefreshToken = function(token) {
  this.refreshTokens = this.refreshTokens.filter(t => t.token !== token);
};

module.exports = mongoose.model('User', userSchema);