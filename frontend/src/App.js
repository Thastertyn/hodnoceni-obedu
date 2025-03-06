import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import LunchRating from './components/LunchRatingForm';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userCredentials, setUserCredentials] = useState(null);

  const handleLogin = (username, password) => {
    // Store the credentials for future API calls
    setUserCredentials({ username, password });
    setIsLoggedIn(true);
  };

  // Add logout handler
  const handleLogout = () => {
    // Clear user credentials
    setUserCredentials(null);
    // Set logged in state to false
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        {/* Landing page as default */}
        <Route
          path="/"
          element={
            <LandingPage
              isLoggedIn={isLoggedIn}
              userCredentials={userCredentials}
              onLogout={handleLogout}
            />
          }
        />

        {/* Login page */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Lunch rating form - Pass userCredentials */}
        <Route 
          path="/rating" 
          element={
            isLoggedIn ? (
              <LunchRating 
                onClose={() => <Navigate to="/" />} 
                lunchId={1} // This should be dynamic based on selected meal
                userCredentials={userCredentials}
              />
            ) : (
              <Navigate to="/login" />
            )
          }
        />

        {/* Fallback to landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}