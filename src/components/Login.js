import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const endpoint = isRegister ? '/api/register' : '/api/login';
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      
      if (response.data.success) {
        onLogin(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Произошла ошибка');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>♟️ ChessMaster</h1>
        <h2>{isRegister ? 'Регистрация' : 'Вход'}</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          {isRegister && (
            <input
              type="text"
              placeholder="Имя пользователя"
              value={formData.username}
              onChange={(e) => setFormData({...formData, username: e.target.value})}
              required
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
          
          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
          
          <button type="submit" className="btn-primary">
            {isRegister ? 'Зарегистрироваться' : 'Войти'}
          </button>
        </form>
        
        <p className="toggle-form">
          {isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}
          <span onClick={() => setIsRegister(!isRegister)}>
            {isRegister ? ' Войти' : ' Зарегистрироваться'}
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;