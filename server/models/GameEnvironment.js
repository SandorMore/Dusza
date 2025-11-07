// models/GameEnvironment.js
const mongoose = require('mongoose');

const gameEnvironmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  worldCards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorldCard'
  }],
  dungeons: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Dungeon'
  }],
  starterCollection: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorldCard'
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('GameEnvironment', gameEnvironmentSchema);