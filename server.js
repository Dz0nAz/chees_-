const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Chess } = require('chess.js');
const pool = require('./config/db');

const app = express();
const PORT = 5000;
const SECRET_KEY = 'your-secret-key-change-in-production';

app.use(cors());
app.use(express.json());

// РЕГИСТРАЦИЯ
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id, username, email, rating',
      [username, email, hashedPassword]
    );
    
    const token = jwt.sign({ userId: result.rows[0].id }, SECRET_KEY);
    res.json({ success: true, user: result.rows[0], token });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ВХОД
app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: 'Неверные учетные данные' });
    }
    
    const token = jwt.sign({ userId: user.id }, SECRET_KEY);
    res.json({ 
      success: true,
      user: { id: user.id, username: user.username, email: user.email, rating: user.rating },
      token 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ПРОВЕРКА ТОКЕНА
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Требуется авторизация' });
  
  jwt.verify(token, SECRET_KEY, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Недействительный токен' });
    req.userId = decoded.userId;
    next();
  });
};

// ПОЛУЧИТЬ ВСЕ УРОКИ
app.get('/api/lessons', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lessons ORDER BY order_num');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ПОЛУЧИТЬ КОНКРЕТНЫЙ УРОК
app.get('/api/lessons/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM lessons WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Урок не найден' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ПРОВЕРИТЬ РЕШЕНИЕ
app.post('/api/lessons/:id/check', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { moves } = req.body;
    const lessonResult = await pool.query('SELECT correct_moves FROM lessons WHERE id = $1', [id]);
    const correctMoves = lessonResult.rows[0].correct_moves;
    const isCorrect = JSON.stringify(moves) === JSON.stringify(correctMoves);
    
    if (isCorrect) {
      await pool.query(
        `INSERT INTO user_progress (user_id, lesson_id, completed, completed_at) 
         VALUES ($1, $2, true, NOW())
         ON CONFLICT (user_id, lesson_id) 
         DO UPDATE SET completed = true, completed_at = NOW()`,
        [req.userId, id]
      );
    }
    
    res.json({ correct: isCorrect, message: isCorrect ? 'Отлично! Урок пройден!' : 'Попробуйте еще раз' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ПРОГРЕСС ПОЛЬЗОВАТЕЛЯ
app.get('/api/progress', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT l.id, l.title, l.difficulty, up.completed, up.completed_at
       FROM lessons l
       LEFT JOIN user_progress up ON l.id = up.lesson_id AND up.user_id = $1
       ORDER BY l.order_num`,
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// СОХРАНИТЬ ИГРУ
app.post('/api/games', authenticateToken, async (req, res) => {
  try {
    const { pgn, result, movesCount } = req.body;
    const gameResult = await pool.query(
      'INSERT INTO games (white_player, pgn, result, moves_count) VALUES ($1, $2, $3, $4) RETURNING *',
      [req.userId, pgn, result, movesCount]
    );
    res.json({ success: true, game: gameResult.rows[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ИСТОРИЯ ИГР
app.get('/api/games', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM games WHERE white_player = $1 ORDER BY played_at DESC LIMIT 20',
      [req.userId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// СТАТИСТИКА
app.get('/api/stats', authenticateToken, async (req, res) => {
  try {
    const lessonsCompleted = await pool.query(
      'SELECT COUNT(*) FROM user_progress WHERE user_id = $1 AND completed = true',
      [req.userId]
    );
    const gamesPlayed = await pool.query(
      'SELECT COUNT(*) FROM games WHERE white_player = $1',
      [req.userId]
    );
    const user = await pool.query('SELECT rating FROM users WHERE id = $1', [req.userId]);
    
    res.json({
      lessonsCompleted: parseInt(lessonsCompleted.rows[0].count),
      gamesPlayed: parseInt(gamesPlayed.rows[0].count),
      rating: user.rows[0].rating
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});