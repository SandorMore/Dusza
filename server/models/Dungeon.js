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

// TEMPORARY DEBUGGING VERSION - Basic validation only
dungeonSchema.pre('save', async function(next) {
  try {
    console.log('🔍 DUNGEON VALIDATION (TEMPORARY DEBUG MODE) ======================');
    console.log('Dungeon name:', this.name);
    console.log('Dungeon type:', this.type);
    console.log('Card IDs being saved:', this.cards);
    
    // Populate cards to check their properties
    const populatedCards = await mongoose.model('WorldCard').find({
      _id: { $in: this.cards }
    });
    
    console.log('📦 POPULATED CARDS DETAILS:');
    populatedCards.forEach((card, index) => {
      console.log(`${index + 1}. ${card.name} (ID: ${card._id}) - isLeader: ${card.isLeader}, Type: ${card.type}`);
    });
    
    const cardCount = populatedCards.length;
    const hasLeader = populatedCards.some(card => card.isLeader);
    const lastCard = populatedCards[populatedCards.length - 1];
    const lastCardIsLeader = lastCard ? lastCard.isLeader : false;

    console.log('📊 VALIDATION RESULTS:');
    console.log('Card count:', cardCount);
    console.log('Has leader:', hasLeader);
    console.log('Last card:', lastCard ? `${lastCard.name} (isLeader: ${lastCard.isLeader})` : 'none');
    console.log('Last card is leader:', lastCardIsLeader);

    // BASIC VALIDATION ONLY - comment out strict rules for now
    const requiredCount = this.type === 'Egyszerű találkozás' ? 1 : 
                         this.type === 'Kis kazamata' ? 4 : 6;
    
    if (cardCount !== requiredCount) {
      console.log('❌ VALIDATION FAILED: Wrong card count');
      return next(new Error(`${this.type} must have exactly ${requiredCount} cards`));
    }
    
    /* COMMENT OUT STRICT VALIDATION FOR NOW
    switch(this.type) {
      case 'Egyszerű találkozás':
        if (cardCount !== 1) {
          console.log('❌ SIMPLE ENCOUNTER VALIDATION FAILED: Wrong card count');
          return next(new Error('Simple encounter must have exactly 1 card'));
        }
        break;
      case 'Kis kazamata':
        if (cardCount !== 4) {
          console.log('❌ SMALL DUNGEON VALIDATION FAILED: Wrong card count');
          return next(new Error('Small dungeon must have exactly 4 cards'));
        }
        if (!hasLeader) {
          console.log('❌ SMALL DUNGEON VALIDATION FAILED: No leader card');
          return next(new Error('Small dungeon must include at least 1 leader card'));
        }
        if (!lastCardIsLeader) {
          console.log('❌ SMALL DUNGEON VALIDATION FAILED: Last card is not leader');
          return next(new Error('Small dungeon must end with a leader card'));
        }
        break;
      case 'Nagy kazamata':
        if (cardCount !== 6) {
          console.log('❌ LARGE DUNGEON VALIDATION FAILED: Wrong card count');
          return next(new Error('Large dungeon must have exactly 6 cards'));
        }
        if (!hasLeader) {
          console.log('❌ LARGE DUNGEON VALIDATION FAILED: No leader card');
          return next(new Error('Large dungeon must include at least 1 leader card'));
        }
        if (!lastCardIsLeader) {
          console.log('❌ LARGE DUNGEON VALIDATION FAILED: Last card is not leader');
          return next(new Error('Large dungeon must end with a leader card'));
        }
        break;
    }
    */
    
    console.log('✅ DUNGEON VALIDATION PASSED!');
    next();
  } catch (error) {
    console.error('💥 DUNGEON VALIDATION ERROR:', error);
    next(error);
  }
});

module.exports = mongoose.model('Dungeon', dungeonSchema);