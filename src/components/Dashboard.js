import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function Dashboard({ user, onLogout }) {
  const [stats, setStats] = useState({
    lessonsCompleted: 0,
    gamesPlayed: 0,
    rating: 1200
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:5000/api/stats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
    }
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <h1>♟️ ChessMaster</h1>
        <div className="nav-links">
          <Link to="/dashboard">Главная</Link>
          <Link to="/lessons">Уроки</Link>
          <Link to="/play">Игра с ботом</Link>
          <Link to="/playtwo">Игра вдвоём</Link>
          <button onClick={onLogout} className="btn-logout">Выйти</button>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="welcome-section">
          <h2>Добро пожаловать, {user?.username}!</h2>
          <p>Продолжайте обучение и совершенствуйте свои навыки</p>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📚</div>
            <div className="stat-value">{stats.lessonsCompleted}</div>
            <div className="stat-label">Уроков пройдено</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎮</div>
            <div className="stat-value">{stats.gamesPlayed}</div>
            <div className="stat-label">Игр сыграно</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-value">{stats.rating}</div>
            <div className="stat-label">Рейтинг</div>
          </div>
        </div>

        <div className="quick-actions">
          <h3>Быстрые действия</h3>
          <div className="action-buttons">
            <Link to="/lessons" className="action-card">
              <div className="action-icon">📖</div>
              <h4>Учиться</h4>
              <p>Пройти урок</p>
            </Link>

            <Link to="/play" className="action-card">
              <div className="action-icon">🤖</div>
              <h4>Игра с ботом</h4>
              <p>Против компьютера</p>
            </Link>

            <Link to="/playtwo" className="action-card">
              <div className="action-icon">👥</div>
              <h4>Игра вдвоём</h4>
              <p>С другом на одном экране</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;