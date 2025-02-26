import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal'; // Import nové komponenty
import '../css/landing_page.css';
import logo from '../img/logo.png';

export default function LandingPage({ isLoggedIn }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="landing-page">
      <header className="landing-header">
        <h1>Vítejte v aplikaci,<br/>Hodnocení školních obědů</h1>
        <p>Vyberte si <strong>oběd</strong> a <strong>ohodnoťte</strong> jej!</p>
      </header>

      <div className="logo-container">
        <img src={logo} alt="logo" className="logo" />
      </div>

      {!isLoggedIn && (
        <section className="login-prompt">
          <h2><strong>Přihlaste se</strong> pro hodnocení!</h2>
          <button className="login-button" onClick={() => navigate('/login')}>
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
        <button onClick={() => setShowLogoutModal(true)}>
          <span role="img" aria-label="profile">👤</span>
        </button>
      </nav>

      {/* Modální okno pro odhlášení */}
      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
    </div>
  );
}
