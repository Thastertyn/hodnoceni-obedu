import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import LogoutModal from './LogoutModal'; 
import '../css/landing_page.css';
import logo from '../img/logo.png';

// Cache configuration
const CACHE_CONFIG = {
  todayMeal: {
    expirationMinutes: 30, // Cache expires after 30 minutes
    getKey: (username) => `todayMeal_${username}`
  },
  pastLunches: {
    expirationMinutes: 60, // Cache expires after 1 hour
    getKey: (username) => `pastLunches_${username}`
  }
};

export default function LandingPage({ isLoggedIn, userCredentials, onLogout }) {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [todayMeal, setTodayMeal] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pastLoading, setPastLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pastError, setPastError] = useState(null);
  
  // NEW state for past lunches
  const [pastLunches, setPastLunches] = useState([]);

  // Reference date for testing - use this instead of new Date() for consistency
  const currentDate = new Date("2025-03-06");

  const openLogoutModal = () => {
    setShowLogoutModal(true);
  };

  const closeLogoutModal = () => {
    setShowLogoutModal(false);
  };

  // Helper function to check if cache is valid
  const isCacheValid = useCallback((cacheData, expirationMinutes) => {
    if (!cacheData || !cacheData.timestamp) return false;
    
    const now = new Date();
    const cachedTime = new Date(cacheData.timestamp);
    const diffMs = now - cachedTime;
    const diffMinutes = diffMs / (1000 * 60);
    
    // Check if cache is still valid based on expiration time
    return diffMinutes < expirationMinutes;
  }, []);

  // Helper to get current date string in YYYY-MM-DD format
  const getCurrentDateString = useCallback(() => {
    return currentDate.toISOString().split('T')[0]; // Use reference date
  }, []);

  // 1) Fetch today's lunch with caching
  const fetchTodayMeal = useCallback(async (forceRefresh = false) => {
    if (!userCredentials) return;
    
    const cacheKey = CACHE_CONFIG.todayMeal.getKey(userCredentials.username);
    
    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          
          // Check if cache is valid and matches current date
          if (isCacheValid(parsedCache, CACHE_CONFIG.todayMeal.expirationMinutes) && 
              parsedCache.date === getCurrentDateString()) {
            console.log("Using cached today's meal data");
            setTodayMeal(parsedCache.data);
            return;
          }
        }
      } catch (err) {
        console.warn("Error reading from cache:", err);
        // Continue to fetch fresh data
      }
    }

    // If no valid cache or force refresh requested, fetch fresh data
    setLoading(true);
    setError(null);
    
    try {
      const today = getCurrentDateString();
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
      
      // Save to cache with timestamp
      const cacheData = {
        data: data,
        timestamp: new Date().toISOString(),
        date: today
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
    } catch (err) {
      console.error('Error fetching today\'s meal:', err);
      setError(`Nepodařilo se načíst dnešní oběd: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [userCredentials, getCurrentDateString, isCacheValid]);

  // 2) Fetch older lunches with caching
  const fetchPastLunches = useCallback(async (forceRefresh = false) => {
    if (!userCredentials) return;
    
    const cacheKey = CACHE_CONFIG.pastLunches.getKey(userCredentials.username);
    
    // Try to get from cache first if not forcing refresh
    if (!forceRefresh) {
      try {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
          const parsedCache = JSON.parse(cachedData);
          
          // Check if cache is valid
          if (isCacheValid(parsedCache, CACHE_CONFIG.pastLunches.expirationMinutes)) {
            console.log("Using cached past lunches data");
            setPastLunches(parsedCache.data);
            return;
          }
        }
      } catch (err) {
        console.warn("Error reading from cache:", err);
        // Continue to fetch fresh data
      }
    }

    // If no valid cache or force refresh, fetch new data
    setPastLoading(true);
    setPastError(null);
    
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
      
      // Use the reference date (2025-03-10 in your original code)
      const refDate = new Date("2025-03-10");
      refDate.setHours(0, 0, 0, 0);
      
      const olderLunches = data.filter(item => {
        const rawDate = item.lunch?.lunch_date;
        
        if (!rawDate) {
          return false;
        }
        
        const lunchDate = new Date(rawDate);
        lunchDate.setHours(0, 0, 0, 0);
        
        return lunchDate < refDate;
      });
  
      // Sort by date (newest first)
      olderLunches.sort((a, b) => new Date(b.lunch.lunch_date) - new Date(a.lunch.lunch_date));
      
      const filteredLunches = olderLunches.slice(0, 5);
      setPastLunches(filteredLunches);
      
      // Save to cache with timestamp
      const cacheData = {
        data: filteredLunches,
        timestamp: new Date().toISOString()
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      
    } catch (err) {
      console.error("❌ Error fetching past lunches:", err);
      setPastError(`Nepodařilo se načíst starší obědy: ${err.message}`);
    } finally {
      setPastLoading(false);
    }
  }, [userCredentials, isCacheValid]);

  // Fetch data on component mount or when login state changes
  useEffect(() => {
    if (isLoggedIn && userCredentials) {
      fetchTodayMeal(false); // Use cache if available
      fetchPastLunches(false); // Use cache if available
    }
  }, [isLoggedIn, userCredentials, fetchTodayMeal, fetchPastLunches]);

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

  // Function to manually refresh data
  const refreshData = () => {
    if (isLoggedIn && userCredentials) {
      fetchTodayMeal(true); // Force refresh
      fetchPastLunches(true); // Force refresh
    }
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
          <div className="user-info">
            <p>Přihlášen: {userCredentials?.username || 'SasaTurtle'}</p>
            <button className="refresh-button" onClick={refreshData} title="Obnovit data">
              🔄 Obnovit
            </button>
          </div>
          
          <h2 className="rating-title">Vyberte si oběd a ohodnoťte jej!</h2>

          {/* Dnešní oběd */}
          <section className="today-meal">
            <h3>Dnešní oběd</h3>
            {loading && <p className="loading-message">Načítání dnešního oběda...</p>}
            {error && (
              <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={() => fetchTodayMeal(true)} className="retry-button">Zkusit znovu</button>
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
            {pastLoading && <p className="loading-message">Načítání starších obědů...</p>}
            {pastError && (
              <div className="error-container">
                <p className="error-message">{pastError}</p>
                <button onClick={() => fetchPastLunches(true)} className="retry-button">Zkusit znovu</button>
              </div>
            )}
            {!pastLoading && !pastError && pastLunches.length === 0 ? (
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
      {showLogoutModal && (
        <LogoutModal 
          onClose={closeLogoutModal} 
          onLogout={onLogout}
        />
      )}
    </div>
  );
}