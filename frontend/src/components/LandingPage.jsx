import React from 'react';
import '../css/landing_page.css';
import logo from '../img/logo.png';

export default function LandingPage({ isLoggedIn, onLoginClick }) {
  return (
    <div className="landing-page">
      {/* Horní uvítací text */}
      <header className="landing-header">
        <h1>Vítejte v aplikaci,<br/>Hodnocení školních obědů</h1>
        <p>Vyberte si <strong>oběd</strong> a <strong>ohodnoťte</strong> jej!</p>
      </header>

      {/* Logo */}
      <div className="logo-container">
        <img src={logo} alt="logo" className="logo" />
      </div>

      {/* Podmíněné zobrazení podle přihlášení */}
      {isLoggedIn ? (
        <section className="today-meal">
          <h2>Dnešní oběd</h2>
          <div className="meal-card">
            <div className="card-header">
              <span className="status">Neohodnoceno</span>
              <span className="date">27.1.2025</span>
            </div>
            <p><strong>Oběd 1:</strong> Pizza se šunkou a sýrem, ...</p>
          </div>
        </section>
      ) : (
        <section className="login-prompt">
          <h2><strong>Přihlaste se</strong> pro hodnocení!</h2>
          <button className="login-button" onClick={onLoginClick}>Přihlásit se</button>
        </section>
      )}

      {/* Spodní navigační lišta */}
      <nav className="bottom-nav">
        <button>
          <span role="img" aria-label="home">🏠</span>
        </button>
        <button>
          <span role="img" aria-label="ratings">📊</span>
        </button>
        <button>
          <span role="img" aria-label="profile">👤</span>
        </button>
      </nav>
    </div>
  );
}
