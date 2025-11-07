// models/Dungeon.js
const mongoose = require('mongoose');

const dungeonSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Egyszerű találkozás', 'Kis kazamata', 'Nagy kazamata']
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
});

dungeonSchema.pre('save', function(next) {
  // Validate card count based on dungeon type
  const cardCount = this.cards.length;
  const hasLeader = this.cards.some(card => card.isLeader);
  
  switch(this.type) {
    case 'Egyszerű találkozás':
      if (cardCount !== 1) {
        return next(new Error('Simple encounter must have exactly 1 card'));
      }
      break;
    case 'Kis kazamata':
      if (cardCount !== 4 || !hasLeader) {
        return next(new Error('Small dungeon must have 4 cards including 1 leader'));
      }
      break;
    case 'Nagy kazamata':
      if (cardCount !== 6 || !hasLeader) {
        return next(new Error('Large dungeon must have 6 cards including 1 leader'));
      }
      break;
  }
  next();
});

module.exports = mongoose.model('Dungeon', dungeonSchema);