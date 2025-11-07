// routes/auth.js
const express = require('express');
const { 
  register, 
  login, 
  refreshToken, 
  logout, 
  logoutAll 
} = require('../controllers/authController');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh-token', refreshToken);
router.post('/logout', auth, logout);
router.post('/logout-all', auth, logoutAll);

module.exports = router;