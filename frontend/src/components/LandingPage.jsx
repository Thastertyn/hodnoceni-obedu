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

  // NEW state for past lunches
  const [pastLunches, setPastLunches] = useState([]);

  // Fetch today's lunch and past lunches on mount (if logged in)
  useEffect(() => {
    if (isLoggedIn && userCredentials) {
      fetchTodayMeal();
      fetchPastLunches();
    }
  }, [isLoggedIn, userCredentials]);

  // 1) Fetch today's lunch (unchanged from your existing code)
  const fetchTodayMeal = async () => {
    setLoading(true);
    setError(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`http://127.0.0.1:8000/lunch?date=${today}`, {
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
      setTodayMeal(data);
    } catch (err) {
      console.error('Error fetching today\'s meal:', err);
      setError(`Nepodařilo se načíst dnešní oběd: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // 2) Fetch older lunches from /lunch/rating
  const fetchPastLunches = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/lunch/rating", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "X-USERNAME": userCredentials.username,
          "X-PASSWORD": userCredentials.password,
        },
      });
  
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
  
      const data = await response.json();
      
      console.log("🔍 Fetched data:", data);
      
      // Log each object's keys to see the structure
      data.forEach((item, index) => {
        console.log(`Lunch ${index} keys:`, Object.keys(item));
        console.log(`Lunch ${index} object:`, item);
      });
  
      // Simulate today's date for testing (2025-03-10)
      const today = new Date("2025-03-10");
      today.setHours(0, 0, 0, 0);
      console.log("📅 Today's date (test):", today);
  
      const olderLunches = data.filter((item, index) => {
        // Access the nested lunch_date
        const rawDate = item.lunch?.lunch_date;
        console.log(`Lunch ${index} raw lunch_date:`, rawDate);
        
        if (!rawDate) {
          console.warn(`Lunch ${index} does not have a valid "lunch_date" property.`);
          return false;
        }
        
        const lunchDate = new Date(rawDate);
        lunchDate.setHours(0, 0, 0, 0);
        
        const isPast = lunchDate < today;
        console.log(`Lunch ${index} (${rawDate}) parsed as:`, lunchDate, "isPast:", isPast);
        
        return isPast;
      });
  
      olderLunches.sort((a, b) => new Date(b.lunch.lunch_date) - new Date(a.lunch.lunch_date));
  
      console.log("✅ Filtered past lunches:", olderLunches);
  
      setPastLunches(olderLunches.slice(0, 5));
    } catch (err) {
      console.error("❌ Error fetching past lunches:", err);
      setError(`Nepodařilo se načíst starší obědy: ${err.message}`);
    }
  };
  
  

  // Optional helper for displaying dates in "DD.MM.YYYY" (Czech format)
  const formatDate = (dateString) => {
    if (!dateString) {
      return "Neznámé datum";
    }
    const date = new Date(dateString);
    if (isNaN(date)) {
      return "Neplatné datum";
    }
    return new Intl.DateTimeFormat('cs-CZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).format(date);
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

          {/* Dnešní oběd */}
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
                <div className="meal-card">
                  <p><strong>Polévka:</strong> {todayMeal.soup}</p>
                  <p><strong>Hlavní jídlo 1:</strong> {todayMeal.first_option}</p>
                  <p><strong>Hlavní jídlo 2:</strong> {todayMeal.second_option}</p>
                  <p><strong>Nápoj:</strong> {todayMeal.drink}</p>
                  <small>{formatDate(todayMeal.lunch_date)}</small>
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

          {/* Obědy v posledním týdnu (older than today) */}
          <section className="past-meals">
            <h3>Obědy v posledním týdnu</h3>
            {pastLunches.length === 0 ? (
            <p>Žádné starší obědy nebyly nalezeny.</p>
          ) : (
            pastLunches.map((meal, index) => (
              <div className="meal-card" key={meal.lunch.lunch_id || index}>
                <span className="status">Neohodnoceno</span>
                <p>
                  <strong>Oběd {meal.lunch.lunch_id}:</strong> {meal.lunch.first_option}
                </p>
                <small>{formatDate(meal.lunch.lunch_date)}</small>
                {/* You can add a Rate button if needed */}
              </div>
            ))
          )}

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

      {/* Logout confirmation modal */}
      {showLogoutModal && <LogoutModal onClose={() => setShowLogoutModal(false)} />}
    </div>
  );
}
