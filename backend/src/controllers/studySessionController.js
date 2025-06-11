const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Registrar sessão de estudo
const createStudySession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { durationSeconds, subject, notes } = req.body;

    // Calcular pontos (10 pontos por hora de estudo)
    const pointsEarned = Math.floor((durationSeconds / 3600) * 10);

    // Iniciar transação
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Inserir sessão de estudo
      const sessionResult = await client.query(
        'INSERT INTO study_sessions (user_id, duration_seconds, subject, notes, points_earned) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [userId, durationSeconds, subject, notes, pointsEarned]
      );

      // Atualizar pontos totais do usuário
      await client.query(
        'UPDATE users SET total_points = total_points + $1 WHERE id = $2',
        [pointsEarned, userId]
      );

      // Atualizar pontos em desafios ativos que o usuário participa
      await client.query(`
        UPDATE challenge_participants 
        SET total_points = total_points + $1 
        WHERE user_id = $2 
        AND challenge_id IN (
          SELECT id FROM challenges 
          WHERE is_active = true 
          AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP)
        )
      `, [pointsEarned, userId]);

      await client.query('COMMIT');

      const session = sessionResult.rows[0];
      res.status(201).json({
        message: 'Sessão de estudo registrada com sucesso',
        session: {
          id: session.id,
          durationSeconds: session.duration_seconds,
          subject: session.subject,
          notes: session.notes,
          pointsEarned: session.points_earned,
          createdAt: session.created_at
        }
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao registrar sessão de estudo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Listar sessões de estudo do usuário
const getStudySessions = async (req, res) => {
  try {
    const userId = req.user.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const result = await pool.query(
      'SELECT * FROM study_sessions WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset]
    );

    const countResult = await pool.query(
      'SELECT COUNT(*) FROM study_sessions WHERE user_id = $1',
      [userId]
    );

    const totalSessions = parseInt(countResult.rows[0].count);
    const totalPages = Math.ceil(totalSessions / limit);

    res.json({
      sessions: result.rows.map(session => ({
        id: session.id,
        durationSeconds: session.duration_seconds,
        subject: session.subject,
        notes: session.notes,
        pointsEarned: session.points_earned,
        createdAt: session.created_at
      })),
      pagination: {
        currentPage: page,
        totalPages,
        totalSessions,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Erro ao listar sessões de estudo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar sessão de estudo
const updateStudySession = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const sessionId = req.params.id;
    const userId = req.user.userId;
    const { subject, notes } = req.body;

    const result = await pool.query(
      'UPDATE study_sessions SET subject = $1, notes = $2 WHERE id = $3 AND user_id = $4 RETURNING *',
      [subject, notes, sessionId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sessão de estudo não encontrada' });
    }

    const session = result.rows[0];
    res.json({
      message: 'Sessão de estudo atualizada com sucesso',
      session: {
        id: session.id,
        durationSeconds: session.duration_seconds,
        subject: session.subject,
        notes: session.notes,
        pointsEarned: session.points_earned,
        createdAt: session.created_at
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar sessão de estudo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Deletar sessão de estudo
const deleteStudySession = async (req, res) => {
  try {
    const sessionId = req.params.id;
    const userId = req.user.userId;

    // Buscar a sessão para obter os pontos
    const sessionResult = await pool.query(
      'SELECT points_earned FROM study_sessions WHERE id = $1 AND user_id = $2',
      [sessionId, userId]
    );

    if (sessionResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sessão de estudo não encontrada' });
    }

    const pointsToRemove = sessionResult.rows[0].points_earned;

    // Iniciar transação
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Deletar sessão
      await client.query(
        'DELETE FROM study_sessions WHERE id = $1 AND user_id = $2',
        [sessionId, userId]
      );

      // Remover pontos do usuário
      await client.query(
        'UPDATE users SET total_points = total_points - $1 WHERE id = $2',
        [pointsToRemove, userId]
      );

      // Remover pontos dos desafios
      await client.query(`
        UPDATE challenge_participants 
        SET total_points = total_points - $1 
        WHERE user_id = $2 
        AND challenge_id IN (
          SELECT id FROM challenges 
          WHERE is_active = true 
          AND (end_date IS NULL OR end_date > CURRENT_TIMESTAMP)
        )
      `, [pointsToRemove, userId]);

      await client.query('COMMIT');

      res.json({ message: 'Sessão de estudo deletada com sucesso' });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Erro ao deletar sessão de estudo:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Validações
const createStudySessionValidation = [
  body('durationSeconds').isInt({ min: 1 }).withMessage('Duração deve ser um número positivo'),
  body('subject').optional().isLength({ max: 255 }).withMessage('Matéria muito longa'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notas muito longas')
];

const updateStudySessionValidation = [
  body('subject').optional().isLength({ max: 255 }).withMessage('Matéria muito longa'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notas muito longas')
];

module.exports = {
  createStudySession,
  getStudySessions,
  updateStudySession,
  deleteStudySession,
  createStudySessionValidation,
  updateStudySessionValidation
};

