import React, { useState } from 'react';
import LunchRatingForm from './components/LunchRatingForm';
import LoginPage from './components/LoginPage';
import LandingPage from './components/LandingPage';

export default function App() {
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showLanding, setShowLanding] = useState(false);

  return (
    <div style={{ textAlign: 'center', marginTop: '20px' }}>
      {showForm ? (
        <LunchRatingForm onClose={() => setShowForm(false)} />
      ) : (
        <button onClick={() => setShowForm(true)}>Otevřít formulář</button>
      )}

      {showLogin ? (
        <LoginPage onClose={() => setShowLogin(false)} />
      ) : (
        <button onClick={() => setShowLogin(true)}>Open Login Page</button>
      )}

      {showLanding ? (
        <LandingPage onClose={() => setShowLanding(false)} />
      ) : (
        <button onClick={() => setShowLanding(true)}>Open Landing Page</button>
      )}
    </div>
  );
}
