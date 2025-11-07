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

// FIXED validation - check after population
dungeonSchema.pre('save', async function(next) {
  try {
    // Populate cards to check their properties
    const populatedCards = await mongoose.model('WorldCard').find({
      _id: { $in: this.cards }
    });
    
    const cardCount = populatedCards.length;
    const hasLeader = populatedCards.some(card => card.isLeader);
    const lastCardIsLeader = populatedCards[populatedCards.length - 1]?.isLeader;

    switch(this.type) {
      case 'Egyszerű találkozás':
        if (cardCount !== 1) {
          return next(new Error('Simple encounter must have exactly 1 card'));
        }
        break;
      case 'Kis kazamata':
        if (cardCount !== 4) {
          return next(new Error('Small dungeon must have exactly 4 cards'));
        }
        if (!hasLeader) {
          return next(new Error('Small dungeon must include at least 1 leader card'));
        }
        if (!lastCardIsLeader) {
          return next(new Error('Small dungeon must end with a leader card'));
        }
        break;
      case 'Nagy kazamata':
        if (cardCount !== 6) {
          return next(new Error('Large dungeon must have exactly 6 cards'));
        }
        if (!hasLeader) {
          return next(new Error('Large dungeon must include at least 1 leader card'));
        }
        if (!lastCardIsLeader) {
          return next(new Error('Large dungeon must end with a leader card'));
        }
        break;
    }
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Dungeon', dungeonSchema);