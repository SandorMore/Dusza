const express = require('express')
const router = express.Router()
const PlayerDeck = require('../models/PlayerDeck')
const PlayerCollection = require('../models/PlayerCollection')
const Dungeon = require('../models/Dungeon')
const WorldCard = require('../models/WorldCard')
const { auth } = require('../middleware/auth')

router.get('/test', auth, (req, res) => {
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
    const cards = await WorldCard.find().sort({ createdAt: -1 });
    res.json({ 
      cards: cards || [],
      total: cards.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all-dungeons', auth, async (req, res) => {
  try {
    const dungeons = await Dungeon.find().populate('cards').sort({ createdAt: -1 });
    res.json({ 
      dungeons: dungeons || [],
      total: dungeons.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/all-game-environments', auth, async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
});
router.post('/initialize-starter', auth, async (req, res) => {
  try {
    const existingCollection = await PlayerCollection.findOne({ createdBy: req.user._id });
    
    if (existingCollection) {
      return res.json({ 
        message: 'Collection already exists',
        collection: existingCollection 
      });
    }
    
    const baseCards = await WorldCard.find({ 
      isLeader: false, 
      originalCard: null 
    }).limit(6);
    
    if (baseCards.length === 0) {
      return res.status(400).json({ 
        message: 'No world cards found. Please create some cards first as Game Master.' 
      });
    }
    
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
    
    const collection = new PlayerCollection({
      name: 'Starter Collection',
      cards: playerCardCopies,
      createdBy: req.user._id
    });
    
    await collection.save();
    await collection.populate('cards');
    
    res.json({
      message: 'Starter collection created successfully!',
      collection: collection,
      cardsCount: playerCardCopies.length
    });
    
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/dungeons', auth, async (req, res) => {
  try {
    const dungeons = await Dungeon.find().populate('cards');
    res.json({ dungeons: dungeons || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/world-cards', auth, async (req, res) => {
  try {
    const cards = await WorldCard.find();
    res.json({ cards: cards || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/test-dungeons', auth, async (req, res) => {
  try {
    const dungeons = await Dungeon.find().limit(3).populate('cards');
    res.json({ 
      message: 'Test dungeons for player',
      dungeons: dungeons || [] 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/decks', auth, async (req, res) => {
  try {
    const decks = await PlayerDeck.find({ createdBy: req.user._id }).populate('cards');
    res.json({ decks: decks || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/decks', auth, async (req, res) => {
  try {
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
    res.status(500).json({ message: error.message });
  }
});

router.post('/battle', auth, async (req, res) => {
  try {
    const { deckId, dungeonId, cardOrder } = req.body;
    
    const deck = await PlayerDeck.findById(deckId).populate('cards');
    const dungeon = await Dungeon.findById(dungeonId).populate('cards');
    
    if (!deck || !dungeon) {
      return res.status(404).json({ message: 'Deck or dungeon not found' });
    }
    
    if (deck.cards.length !== dungeon.cards.length) {
      return res.status(400).json({ message: 'Deck size must match dungeon size' });
    }
    
    let orderedPlayerCards = deck.cards;
    if (cardOrder && Array.isArray(cardOrder) && cardOrder.length === deck.cards.length) {
      const cardMap = new Map();
      deck.cards.forEach(card => {
        cardMap.set(card._id.toString(), card);
      });
      
      orderedPlayerCards = cardOrder.map(cardId => {
        const card = cardMap.get(cardId);
        if (!card) {
          throw new Error(`Card with ID ${cardId} not found in deck`);
        }
        return card;
      });
    }
    
    const battleResult = simulateBattle(orderedPlayerCards, dungeon.cards, dungeon.type);
    
    res.json({ result: battleResult });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/collections', auth, async (req, res) => {
  try {
    const collections = await PlayerCollection.find({ createdBy: req.user._id }).populate('cards');
    res.json({ collections: collections || [] });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put('/collections/:collectionId/cards/:cardId', auth, async (req, res) => {
  try {
    const { collectionId, cardId } = req.params;
    const { bonusType, bonusAmount } = req.body;
    
    const collection = await PlayerCollection.findOne({ 
      _id: collectionId, 
      createdBy: req.user._id
    }).populate('cards');
    
    if (!collection) {
      return res.status(404).json({ message: 'Collection not found' });
    }
    
    let card = collection.cards.find(c => c._id.toString() === cardId);
    if (!card) {
      return res.status(404).json({ message: 'Card not found in collection' });
    }
    
    if (card.createdBy.toString() !== req.user._id.toString()) {
      const baseCard = await WorldCard.findById(card.originalCard || card._id);
      if (!baseCard) {
        return res.status(404).json({ message: 'Base card not found' });
      }
      
      const userIdSuffix = req.user._id.toString().slice(-4);
      const baseName = baseCard.name.length > 12 ? baseCard.name.substring(0, 12) : baseCard.name;
      const playerCardCopy = new WorldCard({
        name: `${baseName}-${userIdSuffix}`,
        damage: baseCard.damage,
        health: baseCard.health,
        type: baseCard.type,
        isLeader: baseCard.isLeader,
        originalCard: baseCard._id,
        boostType: baseCard.boostType,
        createdBy: req.user._id
      });
      await playerCardCopy.save();
      
      const cardIndex = collection.cards.findIndex(c => c._id.toString() === cardId);
      collection.cards[cardIndex] = playerCardCopy._id;
      await collection.save();
      
      card = playerCardCopy;
    }
    
    if (bonusType === 'damage') {
      card.damage += bonusAmount;
    } else if (bonusType === 'health') {
      card.health += bonusAmount;
    }
    
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
    res.status(500).json({ message: error.message });
  }
});

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
  
  let playerReward = null;
  if (playerWins) {
    if (dungeonType === 'Egyszerű találkozás') {
      playerReward = {
        cardId: null,
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
  
  if (playerCard.damage > dungeonCard.health) {
    playerWins = true;
    reason = `Player damage (${playerCard.damage}) > Dungeon health (${dungeonCard.health})`;
  } else if (dungeonCard.damage > playerCard.health) {
    playerWins = false;
    reason = `Dungeon damage (${dungeonCard.damage}) > Player health (${playerCard.health})`;
  } else {
    const advantage = getTypeAdvantage(playerCard.type, dungeonCard.type);
    if (advantage > 0) {
      playerWins = true;
      reason = `Type advantage: ${playerCard.type} beats ${dungeonCard.type}`;
    } else if (advantage < 0) {
      playerWins = false;
      reason = `Type disadvantage: ${dungeonCard.type} beats ${playerCard.type}`;
    } else {
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
    const { cardId, bonusType, bonusAmount } = req.body;
    
    if (!cardId || !bonusType || !bonusAmount) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    const collections = await PlayerCollection.find({ createdBy: req.user._id }).populate('cards');
    
    let cardUpdated = false;
    let updatedCard = null;
    
    for (const collection of collections) {
      let card = collection.cards.find(c => c._id.toString() === cardId);
      
      if (card) {
        if (card.createdBy.toString() !== req.user._id.toString()) {
          const baseCard = await WorldCard.findById(card.originalCard || card._id);
          if (!baseCard) {
            continue;
          }
          
          const playerCardCopy = new WorldCard({
            name: `${baseCard.name}-${req.user._id.toString().slice(-6)}`,
            damage: baseCard.damage,
            health: baseCard.health,
            type: baseCard.type,
            isLeader: baseCard.isLeader,
            originalCard: baseCard._id,
            boostType: baseCard.boostType,
            createdBy: req.user._id
          });
          await playerCardCopy.save();
          
          const cardIndex = collection.cards.findIndex(c => c._id.toString() === cardId);
          collection.cards[cardIndex] = playerCardCopy._id;
          await collection.save();
          
          card = playerCardCopy;
        }
        
        if (bonusType === 'damage') {
          card.damage += bonusAmount;
        } else if (bonusType === 'health') {
          card.health += bonusAmount;
        }
        
        await card.save();
        
        cardUpdated = true;
        updatedCard = {
          id: card._id,
          name: card.name,
          damage: card.damage,
          health: card.health,
          type: card.type
        };
        break;
      }
    }
    
    if (!cardUpdated) {
      return res.status(404).json({ message: 'Card not found in your collections' });
    }
    
    res.json({
      message: 'Reward applied successfully!',
      card: updatedCard
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Error applying reward: ' + error.message
    });
  }
});
module.exports = router;