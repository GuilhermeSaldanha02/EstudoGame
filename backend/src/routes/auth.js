const express = require('express');
const { 
  register, 
  login, 
  verifyToken, 
  registerValidation, 
  loginValidation 
} = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Rotas públicas
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);

// Rotas protegidas
router.get('/verify', authMiddleware, verifyToken);

module.exports = router;

