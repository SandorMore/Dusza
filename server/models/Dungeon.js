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
    enum: ['Egyszerű', 'Kis kazamata', 'Nagy kazamata']
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

dungeonSchema.pre('save', async function(next) {
  try {
    const populatedCards = await mongoose.model('WorldCard').find({
      _id: { $in: this.cards }
    });
    
    const cardCount = populatedCards.length;
    const requiredCount = this.type === 'Egyszerű' ? 1 : 
                         this.type === 'Kis kazamata' ? 4 : 6;
    
    if (cardCount !== requiredCount) {
      return next(new Error(`${this.type} must have exactly ${requiredCount} cards`));
    }
    
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model('Dungeon', dungeonSchema);