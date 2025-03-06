import React, { useState } from 'react';
import '../css/lunch_rating_form.css';

export default function LunchRatingForm({ onClose, lunchId }) {
  const [taste, setTaste] = useState('');
  const [temperature, setTemperature] = useState('');
  const [portion, setPortion] = useState('');
  const [soup, setSoup] = useState('');
  const [dessert, setDessert] = useState('');
  const [wouldPayMore, setWouldPayMore] = useState('');
  const [feedback, setFeedback] = useState('');

  // Helper function for button styling
  const getButtonClass = (selectedValue, optionValue) =>
    selectedValue === optionValue ? 'button selected' : 'button';

  // Toggle selection function
  const toggleSelection = (setState, value, current) => {
    setState(current === value ? '' : value);
  };

  // Submit function
  const handleSubmit = async () => {
    const username = localStorage.getItem('username');
    const password = localStorage.getItem('password');

    if (!username || !password) {
      console.error('Username or password is missing');
      return;
    }

    const formData = {
      lunch_id: lunchId, // Ensure this is passed from parent
      taste,
      temperature,
      portion_size: portion,
      soup,
      dessert,
      would_pay_more: wouldPayMore,
      feedback,
    };

    try {
      const response = await fetch('http://127.0.0.1:8000/lunch/rating', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-USERNAME': username,
          'X-PASSWORD': password,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      console.log('Rating submitted successfully');
      onClose(); // Close form after submission
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  return (
    <div className="rating-container">
      <div className="form-header">
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <h2>Hodnocení</h2>

      <div className="sections-container">
        <div className="section">
          <h3>Hodnocení polévky</h3>
          <button className={getButtonClass(soup, 'Bez polévky')} onClick={() => toggleSelection(setSoup, 'Bez polévky', soup)}>Bez polévky</button>
          <button className={getButtonClass(soup, 'Dobrá')} onClick={() => toggleSelection(setSoup, 'Dobrá', soup)}>Dobrá</button>
          <button className={getButtonClass(soup, 'Průměrná')} onClick={() => toggleSelection(setSoup, 'Průměrná', soup)}>Průměrná</button>
          <button className={getButtonClass(soup, 'Špatná')} onClick={() => toggleSelection(setSoup, 'Špatná', soup)}>Špatná</button>
        </div>

        <div className="section">
          <h3>Hodnocení dezertu</h3>
          <button className={getButtonClass(dessert, 'Bez dezertu')} onClick={() => toggleSelection(setDessert, 'Bez dezertu', dessert)}>Bez dezertu</button>
          <button className={getButtonClass(dessert, 'Dobrá')} onClick={() => toggleSelection(setDessert, 'Dobrá', dessert)}>Dobrá</button>
          <button className={getButtonClass(dessert, 'Průměrná')} onClick={() => toggleSelection(setDessert, 'Průměrná', dessert)}>Průměrná</button>
          <button className={getButtonClass(dessert, 'Špatná')} onClick={() => toggleSelection(setDessert, 'Špatná', dessert)}>Špatná</button>
        </div>

        <div className="section">
          <h3>Chuť jídla</h3>
          <button className={getButtonClass(taste, 'Vynikající')} onClick={() => toggleSelection(setTaste, 'Vynikající', taste)}>Vynikající</button>
          <button className={getButtonClass(taste, 'Průměrné')} onClick={() => toggleSelection(setTaste, 'Průměrné', taste)}>Průměrné</button>
          <button className={getButtonClass(taste, 'Mizerné')} onClick={() => toggleSelection(setTaste, 'Mizerné', taste)}>Mizerné</button>
        </div>

        <div className="section">
          <h3>Teplota</h3>
          <button className={getButtonClass(temperature, 'Studené')} onClick={() => toggleSelection(setTemperature, 'Studené', temperature)}>Studené</button>
          <button className={getButtonClass(temperature, 'Akorát')} onClick={() => toggleSelection(setTemperature, 'Akorát', temperature)}>Akorát</button>
          <button className={getButtonClass(temperature, 'Horké')} onClick={() => toggleSelection(setTemperature, 'Horké', temperature)}>Horké</button>
        </div>

        <div className="section">
          <h3>Porce</h3>
          <button className={getButtonClass(portion, 'Hlad')} onClick={() => toggleSelection(setPortion, 'Hlad', portion)}>Měl jsem hlad</button>
          <button className={getButtonClass(portion, 'Akorát')} onClick={() => toggleSelection(setPortion, 'Akorát', portion)}>Akorát</button>
          <button className={getButtonClass(portion, 'Přejedl')} onClick={() => toggleSelection(setPortion, 'Přejedl', portion)}>Přejedl jsem se</button>
        </div>

        <div className="section">
          <h3>Příplatek</h3>
          <button className={getButtonClass(wouldPayMore, '6Kč - větší porce')} onClick={() => toggleSelection(setWouldPayMore, '6Kč - větší porce', wouldPayMore)}>6Kč - větší porce</button>
          <button className={getButtonClass(wouldPayMore, '10Kč - dezert')} onClick={() => toggleSelection(setWouldPayMore, '10Kč - dezert', wouldPayMore)}>10Kč - dezert</button>
          <button className={getButtonClass(wouldPayMore, 'Nejsem ochoten připlatit')} onClick={() => toggleSelection(setWouldPayMore, 'Nejsem ochoten připlatit', wouldPayMore)}>Nejsem ochoten připlatit</button>
        </div>
      </div>

      <textarea className="feedback" placeholder="Zpětná vazba (dobrovolné)" value={feedback} onChange={(e) => setFeedback(e.target.value)}></textarea>

      <button className="submit-button" onClick={handleSubmit}>Potvrdit hodnocení</button>
    </div>
  );
}
