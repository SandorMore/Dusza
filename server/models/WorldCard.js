const mongoose = require('mongoose');

const worldCardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 16,
    unique: true
  },
  damage: {
    type: Number,
    required: true,
    min: 2,
    max: 100
  },
  health: {
    type: Number,
    required: true,
    min: 1,
    max: 100
  },
  type: {
    type: String,
    required: true,
    enum: ['föld', 'levegő', 'víz', 'tűz']
  },
  isLeader: {
    type: Boolean,
    default: false
  },
  originalCard: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorldCard'
  },
  boostType: {
    type: String,
    enum: ['damage', 'health', null],
    default: null
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('WorldCard', worldCardSchema);