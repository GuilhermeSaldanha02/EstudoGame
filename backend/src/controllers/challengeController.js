const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Listar desafios ativos
const getChallenges = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        c.id,
        c.name,
        c.description,
        c.subject,
        c.start_date,
        c.end_date,
        c.is_active,
        c.created_at,
        u.name as creator_name,
        COUNT(cp.user_id) as participants_count
      FROM challenges c
      LEFT JOIN users u ON c.creator_id = u.id
      LEFT JOIN challenge_participants cp ON c.id = cp.challenge_id
      WHERE c.is_active = true
      GROUP BY c.id, u.name
      ORDER BY c.created_at DESC
    `);

    res.json({
      challenges: result.rows.map(challenge => ({
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        subject: challenge.subject,
        startDate: challenge.start_date,
        endDate: challenge.end_date,
        isActive: challenge.is_active,
        createdAt: challenge.created_at,
        creatorName: challenge.creator_name,
        participantsCount: parseInt(challenge.participants_count)
      }))
    });
  } catch (error) {
    console.error('Erro ao listar desafios:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Criar novo desafio
const createChallenge = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { name, description, subject, endDate } = req.body;

    const result = await pool.query(
      'INSERT INTO challenges (name, description, subject, creator_id, end_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [name, description, subject, userId, endDate]
    );

    const challenge = result.rows[0];

    // Automaticamente adicionar o criador como participante
    await pool.query(
      'INSERT INTO challenge_participants (challenge_id, user_id) VALUES ($1, $2)',
      [challenge.id, userId]
    );

    res.status(201).json({
      message: 'Desafio criado com sucesso',
      challenge: {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        subject: challenge.subject,
        startDate: challenge.start_date,
        endDate: challenge.end_date,
        isActive: challenge.is_active,
        createdAt: challenge.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao criar desafio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter detalhes de um desafio
const getChallengeById = async (req, res) => {
  try {
    const challengeId = req.params.id;

    const result = await pool.query(`
      SELECT 
        c.*,
        u.name as creator_name
      FROM challenges c
      LEFT JOIN users u ON c.creator_id = u.id
      WHERE c.id = $1
    `, [challengeId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    const challenge = result.rows[0];

    res.json({
      challenge: {
        id: challenge.id,
        name: challenge.name,
        description: challenge.description,
        subject: challenge.subject,
        startDate: challenge.start_date,
        endDate: challenge.end_date,
        isActive: challenge.is_active,
        createdAt: challenge.created_at,
        creatorName: challenge.creator_name
      }
    });
  } catch (error) {
    console.error('Erro ao obter desafio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Participar de um desafio
const joinChallenge = async (req, res) => {
  try {
    const challengeId = req.params.id;
    const userId = req.user.userId;

    // Verificar se o desafio existe e está ativo
    const challengeResult = await pool.query(
      'SELECT id, is_active FROM challenges WHERE id = $1',
      [challengeId]
    );

    if (challengeResult.rows.length === 0) {
      return res.status(404).json({ error: 'Desafio não encontrado' });
    }

    if (!challengeResult.rows[0].is_active) {
      return res.status(400).json({ error: 'Desafio não está ativo' });
    }

    // Verificar se o usuário já está participando
    const participantResult = await pool.query(
      'SELECT id FROM challenge_participants WHERE challenge_id = $1 AND user_id = $2',
      [challengeId, userId]
    );

    if (participantResult.rows.length > 0) {
      return res.status(400).json({ error: 'Usuário já está participando deste desafio' });
    }

    // Adicionar participante
    await pool.query(
      'INSERT INTO challenge_participants (challenge_id, user_id) VALUES ($1, $2)',
      [challengeId, userId]
    );

    res.json({ message: 'Participação no desafio realizada com sucesso' });
  } catch (error) {
    console.error('Erro ao participar do desafio:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Obter ranking de um desafio
const getChallengeRanking = async (req, res) => {
  try {
    const challengeId = req.params.id;

    const result = await pool.query(`
      SELECT 
        cp.user_id,
        cp.total_points,
        u.name,
        u.avatar_url,
        ROW_NUMBER() OVER (ORDER BY cp.total_points DESC) as position
      FROM challenge_participants cp
      JOIN users u ON cp.user_id = u.id
      WHERE cp.challenge_id = $1
      ORDER BY cp.total_points DESC
    `, [challengeId]);

    res.json({
      ranking: result.rows.map(participant => ({
        position: parseInt(participant.position),
        userId: participant.user_id,
        name: participant.name,
        avatarUrl: participant.avatar_url,
        totalPoints: participant.total_points
      }))
    });
  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Validações
const createChallengeValidation = [
  body('name').notEmpty().withMessage('Nome do desafio é obrigatório'),
  body('subject').notEmpty().withMessage('Matéria é obrigatória'),
  body('description').optional().isLength({ max: 1000 }).withMessage('Descrição muito longa'),
  body('endDate').optional().isISO8601().withMessage('Data de fim inválida')
];

module.exports = {
  getChallenges,
  createChallenge,
  getChallengeById,
  joinChallenge,
  getChallengeRanking,
  createChallengeValidation
};

