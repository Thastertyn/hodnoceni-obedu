import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import LunchRating from './components/LunchRatingForm';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <Router>
      <Routes>
        {/* LandingPage jako výchozí stránka */}
        <Route path="/" element={<LandingPage isLoggedIn={isLoggedIn} />} />
        
        {/* Login stránka */}
        <Route path="/login" element={<LoginPage onLogin={handleLogin} />} />

        <Route path="/rating" element={<LunchRating/>} />

        {/* Pokud neexistuje route, přesměruj na hlavní stránku */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
