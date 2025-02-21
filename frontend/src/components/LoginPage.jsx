import React from 'react';
import '../css/login_page.css';
import logo from '../img/logo.png';

export default function LoginPage() {
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
