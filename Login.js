import React, { useState } from 'react';

function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.password) {
      setError('Заполните все поля');
      return;
    }

    if (isRegister && !formData.username) {
      setError('Введите имя пользователя');
      return;
    }

    const user = {
      id: Date.now(),
      username: formData.username || formData.email.split('@')[0],
      email: formData.email,
      rating: 1200
    };
    
    const token = 'token_' + Date.now();

    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    onLogin(user, token);
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
            />
          )}
          
          <input
            type="email"
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
          
          <input
            type="password"
            placeholder="Пароль"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
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