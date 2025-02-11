import React, { useState } from 'react';
import LunchRatingForm from './LunchRatingForm';

export default function App() {
  const [showForm, setShowForm] = useState(false);

  const handleShowForm = () => setShowForm(true);
  const handleCloseForm = () => setShowForm(false);

  return (
    <div>
      {showForm ? (
        <LunchRatingForm onClose={handleCloseForm} />
      ) : (
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <button onClick={handleShowForm}>Otevřít formulář</button>
        </div>
      )}
    </div>
  );
}
