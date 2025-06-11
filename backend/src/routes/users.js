const express = require('express');
const { 
  getProfile, 
  updateProfile, 
  updateProfileValidation 
} = require('../controllers/userController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas de usuário são protegidas
router.use(authMiddleware);

router.get('/profile', getProfile);
router.put('/profile', updateProfileValidation, updateProfile);

module.exports = router;

