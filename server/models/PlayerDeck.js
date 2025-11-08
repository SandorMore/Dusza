// models/PlayerDeck.js
const mongoose = require('mongoose')

const playerDeckSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: 50
  },
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorldCard',
    required: true
  }],
  cardIds: [{
    type: String,
    required: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
})

module.exports = mongoose.model('PlayerDeck', playerDeckSchema)