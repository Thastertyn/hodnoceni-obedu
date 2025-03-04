import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal'; 
import '../css/landing_page.css';
import logo from '../img/logo.png';

export default function LandingPage({ isLoggedIn }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  return (
    <div className="landing-page">
      {/* If user is NOT logged in, show the original layout */}
      {!isLoggedIn && (
        <>
          <header className="landing-header">
            <h1>Vítejte v aplikaci,<br/>Hodnocení školních obědů</h1>
            <p>Vyberte si <strong>oběd</strong> a <strong>ohodnoťte</strong> jej!</p>
          </header>

          <div className="logo-container">
            <img src={logo} alt="logo" className="logo" />
          </div>

          <section className="login-prompt">
            <h2><strong>Přihlaste se</strong> pro hodnocení!</h2>
            <button className="login-button-redir" onClick={() => navigate('/login')}>
              Přihlásit se
            </button>
          </section>
        </>
      )}

      {/* If user IS logged in, show the new layout (from the screenshot) */}
      {isLoggedIn && (
        <>
          <h2 className="rating-title">Vyberte si oběd a ohodnoťte jej!</h2>
          
          {/* Dnešní oběd */}
          <section className="today-meal">
            <h3>Dnešní oběd</h3>
            <div className="meal-card">
              <span className="status">Neohodnoceno</span>
              <p>Oběd 1: Pizza se šunkou a sýrem, ...</p>
              <small>27.1.2025</small>
            </div>
          </section>

          {/* Obědy v posledním týdnu */}
          <section className="past-meals">
            <h3>Obědy v posledním týdnu</h3>
            <div className="meal-card">
              <span className="status">Ohodnoceno</span>
              <p>Oběd 1: Pizza se šunkou a sýrem, ...</p>
              <small>24.1.2025</small>
            </div>
            <div className="meal-card">
              <span className="status">Ohodnoceno</span>
              <p>Oběd 1: Pizza se šunkou a sýrem, ...</p>
              <small>25.1.2025</small>
            </div>
            <div className="meal-card">
              <span className="status">Neohodnoceno</span>
              <p>Oběd 1: Pizza se šunkou a sýrem, ...</p>
              <small>26.1.2025</small>
            </div>
          </section>
        </>
      )}

      {/* Bottom navigation bar (same for both states) */}
      <nav className="bottom-nav">
        <button>
          <span role="img" aria-label="home">🏠</span>
        </button>
        <button onClick={() => (isLoggedIn ? navigate('/rating') : navigate('/login'))}>
          <span role="img" aria-label="ratings">📊</span>
        </button>
        <button onClick={() => setShowLogoutModal(true)}>
          <span role="img" aria-label="profile">👤</span>
        </button>
      </nav>

      {/* Modal for logout confirmation */}
      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
    </div>
  );
}
