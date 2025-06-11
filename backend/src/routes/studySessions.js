const express = require('express');
const { 
  createStudySession,
  getStudySessions,
  updateStudySession,
  deleteStudySession,
  createStudySessionValidation,
  updateStudySessionValidation
} = require('../controllers/studySessionController');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Todas as rotas de sessões de estudo são protegidas
router.use(authMiddleware);

router.get('/', getStudySessions);
router.post('/', createStudySessionValidation, createStudySession);
router.put('/:id', updateStudySessionValidation, updateStudySession);
router.delete('/:id', deleteStudySession);

module.exports = router;

