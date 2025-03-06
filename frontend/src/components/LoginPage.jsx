import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login_page.css';
import logo from '../img/logo.png';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      setError('Zadejte prosím uživatelské jméno a heslo.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // Call the lunch/all endpoint to verify credentials
      const response = await fetch('http://127.0.0.1:8000/lunch/all', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-USERNAME': username,
          'X-PASSWORD': password,
        },
      });

      if (!response.ok) {
        // Not 200 OK means wrong credentials or some other error
        setError('Přihlášení se nezdařilo. Zkontrolujte své údaje.');
        return;
      }

      // If successful, store credentials in App.js and set logged in
      onLogin(username, password);

      // Redirect to landing page
      navigate('/');
    } catch (err) {
      setError('Přihlášení se nezdařilo. Zkontrolujte své údaje.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Levá část */}
      <div className="left-section">
        <img src={logo} alt="logo" className="logo" />
        <p>
          Vítejte v aplikaci pro
          <br />
          <span>Hodnocení školních obědů</span>
        </p>
      </div>

      {/* Pravá část */}
      <div className="right-section">
        <div className="login-form">
          <h2>Přihlášení</h2>
          <p>Zadejte Vaše přihlašovací údaje k iCanteen!</p>

          {error && <div className="error-message">{error}</div>}

          <div className="input-container">
            <span className="icon">👤</span>
            <input
              type="text"
              placeholder="Uživatelské jméno"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <div className="input-container">
            <span className="icon">🔒</span>
            <input
              type="password"
              placeholder="Heslo"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
            />
          </div>

          <button
            className="login-button"
            onClick={handleLogin}
            disabled={isLoading}
          >
            {isLoading ? 'Přihlašování...' : 'Přihlásit se'}
          </button>
        </div>
      </div>
    </div>
  );
}
