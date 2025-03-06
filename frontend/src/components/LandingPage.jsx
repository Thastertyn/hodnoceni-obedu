import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal'; 
import '../css/landing_page.css';
import logo from '../img/logo.png';

export default function LandingPage({ isLoggedIn, userCredentials }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [todayMeal, setTodayMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch today's meal from the new /lunch?date= endpoint
  useEffect(() => {
    if (isLoggedIn && userCredentials) {
      fetchTodayMeal();
    }
  }, [isLoggedIn, userCredentials]);

  const fetchTodayMeal = async () => {
    setLoading(true);
    setError(null);

    try {
      // Today's date in YYYY-MM-DD
      const today = new Date();
      const dateString = today.toISOString().split('T')[0];

      const response = await fetch(`http://127.0.0.1:8000/lunch?date=${dateString}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-USERNAME': userCredentials.username,
          'X-PASSWORD': userCredentials.password,
        },
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API response:', data);
      setTodayMeal(data);
    } catch (err) {
      console.error('Error fetching today\'s meal:', err);
      setError(`Nepodařilo se načíst dnešní oběd: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Format date nicely (optional)
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(new Date(date));
  };

  return (
    <div className="landing-page">
      {/* If user is NOT logged in, show original layout */}
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

      {/* If user IS logged in, show the new layout with data from API */}
      {isLoggedIn && (
        <>
          <h2 className="rating-title">Vyberte si oběd a ohodnoťte jej!</h2>

          <section className="today-meal">
            <h3>Dnešní oběd</h3>
            {loading && <p className="loading-message">Načítání dnešního oběda...</p>}
            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchTodayMeal} className="retry-button">Zkusit znovu</button>
              </div>
            )}

            {!loading && !error && todayMeal && (
              <div className="meal-options">
                {/* 
                  Example: The API returns an object with 
                  first_option, second_option, soup, drink, lunch_date, etc.
                */}
                <div className="meal-card">
                  <p><strong>Polévka:</strong> {todayMeal.soup}</p>
                  <p><strong>Hlavní jídlo 1:</strong> {todayMeal.first_option}</p>
                  <p><strong>Hlavní jídlo 2:</strong> {todayMeal.second_option}</p>
                  <p><strong>Nápoj:</strong> {todayMeal.drink}</p>
                  <small>{formatDate(todayMeal.lunch_date)}</small>
                  {/* Example: a Rate button */}
                  <button
                    className="rate-button"
                    onClick={() =>
                      navigate('/rating', {
                        state: {
                          mealId: todayMeal.lunch_id,
                          date: todayMeal.lunch_date,
                        },
                      })
                    }
                  >
                    Hodnotit
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Mock of older lunches or any other content */}
          <section className="past-meals">
            <h3>Obědy v posledním týdnu</h3>
            {/* You can keep or remove your older mock data here */}
            {/* ... */}
          </section>
        </>
      )}

      {/* Bottom navigation bar */}
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
