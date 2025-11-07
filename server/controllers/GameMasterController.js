// controllers/gameMasterController.js
const WorldCard = require('../models/WorldCard');
const Dungeon = require('../models/Dungeon');
const GameEnvironment = require('../models/GameEnvironment');

// World Card Management
exports.createWorldCard = async (req, res) => {
  try {
    const { name, damage, health, type, isLeader, originalCard, boostType } = req.body;

    // Validate card type
    const validTypes = ['föld', 'levegő', 'víz', 'tűz'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ 
        message: 'Invalid card type. Must be one of: föld, levegő, víz, tűz' 
      });
    }

    const card = new WorldCard({
      name,
      damage,
      health,
      type,
      isLeader: isLeader || false,
      originalCard: originalCard || null,
      boostType: boostType || null,
      createdBy: req.user.id
    });

    await card.save();
    res.status(201).json({ message: 'World card created successfully', card });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Card name already exists' });
    }
    res.status(500).json({ 
      message: 'Error creating world card', 
      error: error.message 
    });
  }
};

exports.createLeaderCard = async (req, res) => {
  try {
    const { originalCardId, newName, boostType } = req.body;

    if (!['damage', 'health'].includes(boostType)) {
      return res.status(400).json({ 
        message: 'Boost type must be either "damage" or "health"' 
      });
    }

    const originalCard = await WorldCard.findOne({ 
      _id: originalCardId, 
      createdBy: req.user.id 
    });

    if (!originalCard) {
      return res.status(404).json({ message: 'Original card not found' });
    }

    // Calculate boosted stats
    const boostedDamage = boostType === 'damage' ? originalCard.damage * 2 : originalCard.damage;
    const boostedHealth = boostType === 'health' ? originalCard.health * 2 : originalCard.health;

    const leaderCard = new WorldCard({
      name: newName,
      damage: boostedDamage,
      health: boostedHealth,
      type: originalCard.type,
      isLeader: true,
      originalCard: originalCard._id,
      boostType,
      createdBy: req.user.id
    });

    await leaderCard.save();
    res.status(201).json({ message: 'Leader card created successfully', card: leaderCard });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Leader card name already exists' });
    }
    res.status(500).json({ 
      message: 'Error creating leader card', 
      error: error.message 
    });
  }
};

exports.getWorldCards = async (req, res) => {
  try {
    const cards = await WorldCard.find({ createdBy: req.user.id });
    res.json({ cards });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching world cards', 
      error: error.message 
    });
  }
};

// Dungeon Management
exports.createDungeon = async (req, res) => {
  try {
    const { name, type, cardIds } = req.body;

    // Verify all cards belong to the user
    const cards = await WorldCard.find({ 
      _id: { $in: cardIds },
      createdBy: req.user.id 
    });

    if (cards.length !== cardIds.length) {
      return res.status(400).json({ 
        message: 'Some cards not found or do not belong to you' 
      });
    }

    const dungeon = new Dungeon({
      name,
      type,
      cards: cardIds,
      createdBy: req.user.id
    });

    await dungeon.save();
    res.status(201).json({ message: 'Dungeon created successfully', dungeon });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Dungeon name already exists' });
    }
    res.status(500).json({ 
      message: 'Error creating dungeon', 
      error: error.message 
      
    });
    console.error(error);
  }
};

exports.getDungeons = async (req, res) => {
  try {
    const dungeons = await Dungeon.find({ createdBy: req.user.id })
      .populate('cards');
    res.json({ dungeons });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching dungeons', 
      error: error.message 
    });
  }
};

// Game Environment Management
exports.createGameEnvironment = async (req, res) => {
  try {
    const { name, worldCardIds, dungeonIds, starterCollectionIds } = req.body;

    // Verify all resources belong to the user
    const [worldCards, dungeons, starterCards] = await Promise.all([
      WorldCard.find({ 
        _id: { $in: worldCardIds },
        createdBy: req.user.id 
      }),
      Dungeon.find({ 
        _id: { $in: dungeonIds },
        createdBy: req.user.id 
      }),
      WorldCard.find({ 
        _id: { $in: starterCollectionIds },
        createdBy: req.user.id 
      })
    ]);

    if (worldCards.length !== worldCardIds.length) {
      return res.status(400).json({ 
        message: 'Some world cards not found or do not belong to you' 
      });
    }

    if (dungeons.length !== dungeonIds.length) {
      return res.status(400).json({ 
        message: 'Some dungeons not found or do not belong to you' 
      });
    }

    if (starterCards.length !== starterCollectionIds.length) {
      return res.status(400).json({ 
        message: 'Some starter collection cards not found or do not belong to you' 
      });
    }

    const gameEnvironment = new GameEnvironment({
      name,
      worldCards: worldCardIds,
      dungeons: dungeonIds,
      starterCollection: starterCollectionIds,
      createdBy: req.user.id
    });

    await gameEnvironment.save();
    res.status(201).json({ 
      message: 'Game environment created successfully', 
      gameEnvironment 
    });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error creating game environment', 
      error: error.message 
    });
    console.error(error);
  }
};

exports.getGameEnvironments = async (req, res) => {
  try {
    const environments = await GameEnvironment.find({ createdBy: req.user.id })
      .populate('worldCards')
      .populate('dungeons')
      .populate('starterCollection');
    res.json({ environments });
  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching game environments', 
      error: error.message 
    });
  }
};