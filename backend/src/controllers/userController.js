const { pool } = require('../config/database');
const { body, validationResult } = require('express-validator');

// Obter perfil do usuário
const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await pool.query(
      'SELECT id, email, name, total_points, avatar_url, created_at FROM users WHERE id = $1',
      [userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];

    // Buscar estatísticas do usuário
    const statsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_sessions,
        COALESCE(SUM(duration_seconds), 0) as total_study_time,
        COALESCE(SUM(points_earned), 0) as total_points_earned
      FROM study_sessions 
      WHERE user_id = $1
    `, [userId]);

    const challengesResult = await pool.query(`
      SELECT COUNT(*) as total_challenges
      FROM challenge_participants 
      WHERE user_id = $1
    `, [userId]);

    const stats = statsResult.rows[0];
    const challenges = challengesResult.rows[0];

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        totalPoints: user.total_points,
        avatarUrl: user.avatar_url,
        createdAt: user.created_at
      },
      stats: {
        totalSessions: parseInt(stats.total_sessions),
        totalStudyTimeSeconds: parseInt(stats.total_study_time),
        totalStudyTimeHours: Math.floor(parseInt(stats.total_study_time) / 3600),
        totalPointsEarned: parseInt(stats.total_points_earned),
        totalChallenges: parseInt(challenges.total_challenges)
      }
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Atualizar perfil do usuário
const updateProfile = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.userId;
    const { name, avatarUrl } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, avatar_url = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING id, email, name, total_points, avatar_url',
      [name, avatarUrl, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    const user = result.rows[0];
    res.json({
      message: 'Perfil atualizado com sucesso',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        totalPoints: user.total_points,
        avatarUrl: user.avatar_url
      }
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// Validações
const updateProfileValidation = [
  body('name').notEmpty().withMessage('Nome é obrigatório'),
  body('avatarUrl').optional().isURL().withMessage('URL do avatar inválida')
];

module.exports = {
  getProfile,
  updateProfile,
  updateProfileValidation
};

