import React from 'react';
import { useNavigate } from 'react-router-dom'; // Přidej tento import
import '../css/landing_page.css';
import logo from '../img/logo.png';

export default function LandingPage({ isLoggedIn }) {
  const navigate = useNavigate(); // Použití hooku pro navigaci

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

      {/* Pokud není uživatel přihlášen, zobrazí se přihlašovací výzva */}
      {!isLoggedIn && (
        <section className="login-prompt">
          <h2><strong>Přihlaste se</strong> pro hodnocení!</h2>
          <button className="login-button-redir" onClick={() => navigate('/login')}>
            Přihlásit se
          </button>
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
