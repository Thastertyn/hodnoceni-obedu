import React from 'react';
import '../css/logout_modal.css';

export default function LogoutModal({ onClose, onLogout }) {
  // Handler for confirming logout
  const handleConfirmLogout = () => {
    // Call the logout function
    onLogout();
    // Close the modal
    onClose();
  };

  return (
    <div className="logout-modal-overlay">
      <div className="logout-modal">
        <h2>Chcete se odhlásit?</h2>
        <p>Po odhlášení budete přesunuti na úvodní stránku.</p>
        <div className="button-group">
          <button className="cancel-button" onClick={onClose}>Ne</button>
          <button className="confirm-button" onClick={handleConfirmLogout}>Ano</button>
        </div>
      </div>
    </div>
  );
}