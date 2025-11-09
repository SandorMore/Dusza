// routes/player.js - COMPLETE UPDATED VERSION
const express = require('express')
const router = express.Router()
const PlayerDeck = require('../models/PlayerDeck')
const PlayerCollection = require('../models/PlayerCollection')
const Dungeon = require('../models/Dungeon')
const WorldCard = require('../models/WorldCard')

// FIX: Import 'auth' directly instead of renaming
const { auth } = require('../middleware/auth')

// Test route
router.get('/test', auth, (req, res) => {
  console.log('✅ Player route test - User:', req.user.username);
  res.json({ 
    message: 'Player routes are working!',
    user: {
      id: req.user._id,
      username: req.user.username,
      role: req.user.role
    },
    timestamp: new Date().toISOString()
  });
});
router.get('/all-cards', auth, async (req, res) => {
  try {
    console.log('🔍 Player fetching ALL world cards');
    const cards = await WorldCard.find().sort({ createdAt: -1 });
    res.json({ 
      cards: cards || [],
      total: cards.length
    });
  } catch (error) {
    console.error('Error fetching all world cards:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/all-dungeons', auth, async (req, res) => {
  try {
    console.log('🔍 Player fetching ALL dungeons');
    const dungeons = await Dungeon.find().populate('cards').sort({ createdAt: -1 });
    res.json({ 
      dungeons: dungeons || [],
      total: dungeons.length
    });
  } catch (error) {
    console.error('Error fetching all dungeons:', error);
    res.status(500).json({ message: error.message });
  }
});

router.get('/all-game-environments', auth, async (req, res) => {
  try {
    console.log('🔍 Player fetching ALL game environments');
    const environments = await GameEnvironment.find()
      .populate('worldCards')
      .populate('dungeons')
      .populate('starterCollection')
      .sort({ createdAt: -1 });
    
    res.json({ 
      environments: environments || [],
      total: environments.length
    });
  } catch (error) {
    console.error('Error fetching all game environments:', error);
    res.status(500).json({ message: error.message });
  }
});
// Initialize starter data
router.post('/initialize-starter', auth, async (req, res) => {
  try {
    console.log('🔄 Initializing starter data for user:', req.user.username);
    
    // Check if player already has a collection
    const existingCollection = await PlayerCollection.findOne({ createdBy: req.user._id });
    
    if (existingCollection) {
      return res.json({ 
        message: 'Collection already exists',
        collection: existingCollection 
      });
    }
    
    // Get base world cards (non-leader, original cards created by game masters)
    const baseCards = await WorldCard.find({ 
      isLeader: false, 
      originalCard: null 
    }).limit(6);
    
    if (baseCards.length === 0) {
      return res.status(400).json({ 
        message: 'No world cards found. Please create some cards first as Game Master.' 
      });
    }
    
    // Create player-specific copies of base cards
    const playerCardCopies = [];
    for (const baseCard of baseCards) {
      const userIdSuffix = req.user._id.toString().slice(-4);
      const baseName = baseCard.name.length > 12 ? baseCard.name.substring(0, 12) : baseCard.name;
      const playerCardCopy = new WorldCard({
        name: `${baseName}-${userIdSuffix}`,
        damage: baseCard.damage,
        health: baseCard.health,
        type: baseCard.type,
        isLeader: false,
        originalCard: baseCard._id,
        boostType: null,
        createdBy: req.user._id
      });
      await playerCardCopy.save();
      playerCardCopies.push(playerCardCopy._id);
    }
    
    // Create starter collection with player-specific card copies
    const collection = new PlayerCollection({
      name: 'Starter Collection',
      cards: playerCardCopies,
      createdBy: req.user._id
    });
    
    await collection.save();
    await collection.populate('cards');
    
    console.log('✅ Starter collection created with', playerCardCopies.length, 'player-specific card copies');
    
    res.json({
      message: 'Starter collection created successfully!',
      collection: collection,
      cardsCount: playerCardCopies.length
    });
    
  } catch (error) {
    console.error('❌ Error initializing starter data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get player dungeons (NEW)
router.get('/dungeons', auth, async (req, res) => {
  try {
    console.log('🔍 Player fetching dungeons for:', req.user.username);
    const dungeons = await Dungeon.find().populate('cards');
    res.json({ dungeons: dungeons || [] });
  } catch (error) {
    console.error('Error fetching dungeons for player:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get player world cards (NEW)
router.get('/world-cards', auth, async (req, res) => {
  try {
    console.log('🔍 Player fetching world cards for:', req.user.username);
    const cards = await WorldCard.find();
    res.json({ cards: cards || [] });
  } catch (error) {
    console.error('Error fetching world cards for player:', error);
    res.status(500).json({ message: error.message });
  }
});

// Test dungeons route (NEW)
router.get('/test-dungeons', auth, async (req, res) => {
  try {
    console.log('🔍 Player test dungeons for:', req.user.username);
    const dungeons = await Dungeon.find().limit(3).populate('cards');
    res.json({ 
      message: 'Test dungeons for player',
      dungeons: dungeons || [] 
    });
  } catch (error) {
    console.error('Error in test dungeons:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get player decks
router.get('/decks', auth, async (req, res) => {
  try {
    console.log('🔍 GET /decks - User:', req.user.username);
    const decks = await PlayerDeck.find({ createdBy: req.user._id }).populate('cards');
    res.json({ decks: decks || [] });
  } catch (error) {
    console.error('Error fetching decks:', error);
    res.status(500).json({ message: error.message });
  }
});

// Create player deck
router.post('/decks', auth, async (req, res) => {
  try {
    console.log('🔍 POST /decks - User:', req.user.username);
    const { name, cardIds } = req.body;
    
    const cards = await WorldCard.find({ _id: { $in: cardIds } });
    
    const deck = new PlayerDeck({
      name,
      cards,
      cardIds,
      createdBy: req.user._id
    });
    
    await deck.save();
    await deck.populate('cards');
    res.json({ message: 'Deck created successfully', deck });
  } catch (error) {
    console.error('Error creating deck:', error);
    res.status(500).json({ message: error.message });
  }
});

// Start battle
router.post('/battle', auth, async (req, res) => {
  try {
    console.log('🔍 POST /battle - User:', req.user.username);
    const { deckId, dungeonId, cardOrder } = req.body;
    
    const deck = await PlayerDeck.findById(deckId).populate('cards');
    const dungeon = await Dungeon.findById(dungeonId).populate('cards');
    
    if (!deck || !dungeon) {
      return res.status(404).json({ message: 'Deck or dungeon not found' });
    }
    
    if (deck.cards.length !== dungeon.cards.length) {
      return res.status(400).json({ message: 'Deck size must match dungeon size' });
    }
    
    // Reorder deck cards if cardOrder is provided
    let orderedPlayerCards = deck.cards;
    if (cardOrder && Array.isArray(cardOrder) && cardOrder.length === deck.cards.length) {
      // Create a map of card IDs to cards for quick lookup
      const cardMap = new Map();
      deck.cards.forEach(card => {
        cardMap.set(card._id.toString(), card);
      });
      
      // Reorder cards according to cardOrder
      orderedPlayerCards = cardOrder.map(cardId => {
        const card = cardMap.get(cardId);
        if (!card) {
          throw new Error(`Card with ID ${cardId} not found in deck`);
        }
        return card;
      });
      
      console.log('🔄 Cards reordered according to drag-and-drop sequence');
    }
    
    const battleResult = simulateBattle(orderedPlayerCards, dungeon.cards, dungeon.type);
    
    res.json({ result: battleResult });
  } catch (error) {
    console.error('Error starting battle:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get player collections
router.get('/collections', auth, async (req, res) => {
  try {
    console.log('🔍 GET /collections - User:', req.user.username);
    const collections = await PlayerCollection.find({ createdBy: req.user._id }).populate('cards');
    
    // Also get all player-owned cards (in case they're not in collections)
    const playerCards = await WorldCard.find({ createdBy: req.user._id });
    
    res.json({ 
      collections: collections || [],
      playerCards: playerCards || []
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    res.status(500).json({ message: error.message });
  }
});

// Update collection card (apply rewards)
router.put('/collections/:collectionId/cards/:cardId', auth, async (req, res) => {
  try {
    console.log('🔍 PUT /collections - User:', req.user.username);
    const { collectionId, cardId } = req.params;
    const { bonusType, bonusAmount } = req.body;
    
    const collection = await PlayerCollection.findOne({ 
      _id: collectionId, 
      createdBy: req.user._id
    }).populate('cards');
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    const card = collection.cards.find(c => c._id.toString() === cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found in collection' });
    }
    
    console.log('🔍 Card before update:', 
      card.name, 
      'DMG:', card.damage, 
      'HP:', card.health
    );
    
    // Update the card
    if (bonusType === 'damage') {
      card.damage += bonusAmount;
    } else if (bonusType === 'health') {
      card.health += bonusAmount;
    }
    
    console.log('🔍 Card after update:', 
      card.name, 
      'DMG:', card.damage, 
      'HP:', card.health
    );
    
    // ✅ FIX: Save the WorldCard document directly, not just the collection
    // Since PlayerCollection stores cards as references, we need to save the WorldCard document
    await card.save();
    
    res.json({ 
      message: 'Card updated successfully',
      card: {
        _id: card._id,
        name: card.name,
        damage: card.damage,
        health: card.health,
        type: card.type
      }
    });
  } catch (error) {
    console.error('Error updating collection card:', error);
    res.status(500).json({ message: error.message });
  }
});

// Battle simulation function
function simulateBattle(playerCards, dungeonCards, dungeonType) {
  const rounds = [];
  let playerWinsCount = 0;
  
  for (let i = 0; i < playerCards.length; i++) {
    const playerCard = playerCards[i];
    const dungeonCard = dungeonCards[i];
    const roundResult = simulateRound(playerCard, dungeonCard);
    rounds.push(roundResult);
    
    if (roundResult.playerWins) {
      playerWinsCount++;
    }
  }
  
  const playerWins = playerWinsCount >= Math.ceil(playerCards.length / 2);
  
  // Determine reward based on dungeon type
  let playerReward = null;
  if (playerWins) {
    if (dungeonType === 'Egyszerű') {
      playerReward = {
        cardId: null, // To be chosen by player
        bonusType: 'damage',
        bonusAmount: 1
      };
    } else if (dungeonType === 'Kis kazamata') {
      playerReward = {
        cardId: null,
        bonusType: 'health',
        bonusAmount: 2
      };
    } else if (dungeonType === 'Nagy kazamata') {
      playerReward = {
        cardId: null,
        bonusType: 'damage',
        bonusAmount: 3
      };
    }
  }
  
  return {
    playerWins,
    rounds,
    playerReward
  };
}

function simulateRound(playerCard, dungeonCard) {
  let playerWins = false;
  let reason = '';
  
  // Rule 1: Damage comparison
  if (playerCard.damage > dungeonCard.health) {
    playerWins = true;
    reason = `Player damage (${playerCard.damage}) > Dungeon health (${dungeonCard.health})`;
  } else if (dungeonCard.damage > playerCard.health) {
    playerWins = false;
    reason = `Dungeon damage (${dungeonCard.damage}) > Player health (${playerCard.health})`;
  } else {
    // Rule 2: Type advantages
    const advantage = getTypeAdvantage(playerCard.type, dungeonCard.type);
    if (advantage > 0) {
      playerWins = true;
      reason = `Type advantage: ${playerCard.type} beats ${dungeonCard.type}`;
    } else if (advantage < 0) {
      playerWins = false;
      reason = `Type disadvantage: ${dungeonCard.type} beats ${playerCard.type}`;
    } else {
      // Rule 3: Default to dungeon wins
      playerWins = false;
      reason = 'No clear winner - dungeon card wins by default';
    }
  }
  
  return {
    playerCard,
    dungeonCard,
    playerWins,
    reason,
    playerCardDamage: playerCard.damage,
    dungeonCardDamage: dungeonCard.damage
  };
}

function getTypeAdvantage(type1, type2) {
  const advantages = {
    'tűz': ['föld'],
    'föld': ['víz'],
    'víz': ['levegő'],
    'levegő': ['tűz']
  };
  
  if (advantages[type1]?.includes(type2)) return 1;
  if (advantages[type2]?.includes(type1)) return -1;
  return 0;
}
router.post('/apply-reward', auth, async (req, res) => {
  try {
    console.log('🔍 POST /apply-reward - User:', req.user.username);
    const { cardId, bonusType, bonusAmount } = req.body;
    
    if (!cardId || !bonusType || !bonusAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Find the card - it should be owned by this user
    let card = await WorldCard.findOne({ 
      _id: cardId, 
      createdBy: req.user._id 
    });
    
    // If card not found or not owned by user, check if it's a base card
    // In that case, create a player-specific copy
    if (!card) {
      const baseCard = await WorldCard.findById(cardId);
      if (!baseCard) {
        return res.status(404).json({ message: 'Card not found' });
      }
      
      // Check if user already has a copy of this base card
      const existingCopy = await WorldCard.findOne({
        originalCard: baseCard._id,
        createdBy: req.user._id
      });
      
      if (existingCopy) {
        card = existingCopy;
      } else {
        // Create a new player-specific copy
        const userIdSuffix = req.user._id.toString().slice(-4);
        const baseName = baseCard.name.length > 12 ? baseCard.name.substring(0, 12) : baseCard.name;
        card = new WorldCard({
          name: `${baseName}-${userIdSuffix}`,
          damage: baseCard.damage,
          health: baseCard.health,
          type: baseCard.type,
          isLeader: baseCard.isLeader,
          originalCard: baseCard._id,
          boostType: baseCard.boostType,
          createdBy: req.user._id
        });
        await card.save();
        
        // Add to player's collection if they have one
        const collection = await PlayerCollection.findOne({ createdBy: req.user._id });
        if (collection) {
          collection.cards.push(card._id);
          await collection.save();
        }
      }
    }
    
    console.log('🔍 Card before update:', card.name, 'DMG:', card.damage, 'HP:', card.health);
    
    // Update the card
    if (bonusType === 'damage') {
      card.damage += bonusAmount;
    } else if (bonusType === 'health') {
      card.health += bonusAmount;
    }
    
    console.log('🔍 Card after update:', card.name, 'DMG:', card.damage, 'HP:', card.health);
    
    // Save the card
    await card.save();
    
    console.log('✅ Reward applied successfully');
    res.json({
      message: 'Reward applied successfully!',
      card: {
        id: card._id,
        name: card.name,
        damage: card.damage,
        health: card.health,
        type: card.type
      }
    });
    
  } catch (error) {
    console.error('❌ Error applying reward:', error);
    res.status(500).json({ 
      message: 'Error applying reward: ' + error.message
    });
  }
});
module.exports = router;