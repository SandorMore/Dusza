// models/PlayerCollection.js
const mongoose = require('mongoose')

const playerCollectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    default: 'My Collection'
  },
  cards: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'WorldCard',
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

module.exports = mongoose.model('PlayerCollection', playerCollectionSchema)