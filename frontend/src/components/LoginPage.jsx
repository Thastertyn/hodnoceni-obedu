import React from 'react';
import '../css/login_page.css';
import logo from '../img/logo.png';

export default function LoginPage() {
  return (
    <div className="login-container">
      {/* Levá část */}
      <div className="left-section">
        <img src={logo} alt="logo" className="logo" />
        <h2>Vítejte v aplikaci pro<br />Hodnocení školních obědů</h2>
      </div>

      {/* Pravá část */}
      <div className="right-section">
        <div className="login-form">
          <h2>Přihlášení</h2>
          <p>Zadejte Vaše přihlašovací údaje iCanteen!</p>

          <div className="input-container">
            <span className="icon">👤</span>
            <input type="text" placeholder="Uživatelské jméno" />
          </div>

          <div className="input-container">
            <span className="icon">🔒</span>
            <input type="password" placeholder="Heslo" />
          </div>

          <button className="login-button">Přihlásit se</button>
        </div>
      </div>
    </div>
  );
}
