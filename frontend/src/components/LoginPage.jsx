import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/login_page.css';
import logo from '../img/logo.png';

export default function LoginPage({ onLogin }) {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    // Here you would typically validate the credentials with your backend
    // For now, we'll simulate a successful login
    if (username && password) {
      // Call the onLogin function passed from App.js
      onLogin();
      // Redirect to the landing page
      navigate('/');
    } else {
      alert('Zadejte prosím uživatelské jméno a heslo.');
    }
  };

  return (
    <div className="login-container">
      {/* Levá část */}
      <div className="left-section">
        <img src={logo} alt="logo" className="logo" />
        <p>Vítejte v aplikaci pro<br /><span>Hodnocení školních obědů</span></p>
      </div>

      {/* Pravá část */}
      <div className="right-section">
        <div className="login-form">
          <h2>Přihlášení</h2>
          <p>Zadejte Vaše přihlašovací údaje k iCanteen!</p>

          <div className="input-container">
            <span className="icon">👤</span>
            <input 
              type="text" 
              placeholder="Uživatelské jméno" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-container">
            <span className="icon">🔒</span>
            <input 
              type="password" 
              placeholder="Heslo" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button className="login-button" onClick={handleLogin}>Přihlásit se</button>
        </div>
      </div>
    </div>
  );
}