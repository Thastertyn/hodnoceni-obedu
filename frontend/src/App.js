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
            />
          }
        />

        {/* Login page */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        {/* Lunch rating form */}
        <Route path="/rating" element={<LunchRating />} />

        {/* Fallback to landing page */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
