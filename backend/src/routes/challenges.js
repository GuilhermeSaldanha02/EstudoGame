const express = require('express');
const { 
  getChallenges,
  createChallenge,
  getChallengeById,
  joinChallenge,
  getChallengeRanking,
  createChallengeValidation
} = require('../controllers/challengeController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas de desafio são protegidas
router.use(authMiddleware);

router.get('/', getChallenges);
router.post('/', createChallengeValidation, createChallenge);
router.get('/:id', getChallengeById);
router.post('/:id/join', joinChallenge);
router.get('/:id/ranking', getChallengeRanking);

module.exports = router;

