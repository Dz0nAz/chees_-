import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Lessons() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/progress', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLessons(response.data);
    } catch (error) {
      console.error('Ошибка загрузки уроков:', error);
    }
  };

  const getDifficultyBadge = (difficulty) => {
    const badges = {
      beginner: { text: 'Начальный', color: '#4caf50' },
      intermediate: { text: 'Средний', color: '#ff9800' },
      advanced: { text: 'Продвинутый', color: '#f44336' }
    };
    return badges[difficulty] || badges.beginner;
  };

  return (
    <div className="lessons-page">
      <nav className="navbar">
        <h1>♟️ ChessMaster</h1>
        <div className="nav-links">
          <Link to="/dashboard">Главная</Link>
          <Link to="/lessons">Уроки</Link>
          <Link to="/play">Игра с ботом</Link>
          <Link to="/playtwo">Игра вдвоём</Link>
        </div>
      </nav>

      <div className="lessons-container">
        <h2>Обучающие уроки</h2>
        
        <div className="lessons-grid">
          {lessons.map((lesson) => {
            const badge = getDifficultyBadge(lesson.difficulty);
            return (
              <div key={lesson.id} className="lesson-card">
                <div className="lesson-header">
                  <h3>{lesson.title}</h3>
                  {lesson.completed && <span className="completed-badge">✓ Пройден</span>}
                </div>
                <span className="difficulty-badge" style={{ backgroundColor: badge.color }}>
                  {badge.text}
                </span>
                <Link to={`/lessons/${lesson.id}`} className="btn-start-lesson">
                  {lesson.completed ? 'Повторить' : 'Начать урок'}
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default Lessons;