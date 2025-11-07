// routes/gameMaster.js
const express = require('express');
const { auth, requireGameMaster } = require('../middleware/auth');
const {
  createWorldCard,
  createLeaderCard,
  getWorldCards,
  createDungeon,
  getDungeons,
  createGameEnvironment,
  getGameEnvironments
} = require('../controllers/GameMasterController');

const router = express.Router();

// Apply auth middleware to all routes
router.use(auth);
router.use(requireGameMaster);

// World Card routes
router.post('/world-cards', createWorldCard);
router.post('/world-cards/leader', createLeaderCard);
router.get('/world-cards', getWorldCards);

// Dungeon routes
router.post('/dungeons', createDungeon);
router.get('/dungeons', getDungeons);

// Game Environment routes
router.post('/game-environments', createGameEnvironment);
router.get('/game-environments', getGameEnvironments);

module.exports = router;