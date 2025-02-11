import React, { useState } from 'react';
import './css/lunch_rating_form.css';

export default function LunchRatingForm({ onClose }) {
  const [taste, setTaste] = useState('');
  const [temperature, setTemperature] = useState('');
  const [portion, setPortion] = useState('');
  const [soup, setSoup] = useState('');
  const [dessert, setDessert] = useState('');
  const [wouldPayMore, setWouldPayMore] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Pomocná funkce pro přiřazení třídy tlačítku dle výběru
  const getButtonClass = (selectedValue, optionValue) =>
    selectedValue === optionValue ? 'button selected' : 'button';

  // Odeslání formuláře
  const handleSubmit = () => {
    const formData = { taste, temperature, portion, soup, dessert, wouldPayMore, feedback };
    console.log('Form data:', formData);
    // Po odeslání můžete formulář zavřít nebo provést další akce
  };

  return (
    <div className="rating-container">
      <div className="form-header">
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <h2>Hodnocení</h2>

      {/* Hodnocení chuti */}
      <div className="section">
        <h3>Chuť jídla</h3>
        <button
          className={getButtonClass(taste, 'Vynikající')}
          onClick={() => setTaste('Vynikající')}
        >
          Vynikající – skvěle dochucené
        </button>
        <button
          className={getButtonClass(taste, 'Průměrné')}
          onClick={() => setTaste('Průměrné')}
        >
          Průměrné – obyčejné, nevýrazné
        </button>
        <button
          className={getButtonClass(taste, 'Mizerné')}
          onClick={() => setTaste('Mizerné')}
        >
          Mizerné – nedochucené, zklamání
        </button>
      </div>

      {/* Hodnocení teploty */}
      <div className="section">
        <h3>Teplota</h3>
        <button
          className={getButtonClass(temperature, 'Studené')}
          onClick={() => setTemperature('Studené')}
        >
          Studené
        </button>
        <button
          className={getButtonClass(temperature, 'Akorát')}
          onClick={() => setTemperature('Akorát')}
        >
          Akorát
        </button>
        <button
          className={getButtonClass(temperature, 'Horké')}
          onClick={() => setTemperature('Horké')}
        >
          Horké
        </button>
      </div>

      {/* Hodnocení porce */}
      <div className="section">
        <h3>Porce</h3>
        <button
          className={getButtonClass(portion, 'Hlad')}
          onClick={() => setPortion('Hlad')}
        >
          Měl jsem hlad
        </button>
        <button
          className={getButtonClass(portion, 'Akorát')}
          onClick={() => setPortion('Akorát')}
        >
          Akorát
        </button>
        <button
          className={getButtonClass(portion, 'Přejedl')}
          onClick={() => setPortion('Přejedl')}
        >
          Přejedl jsem se
        </button>
      </div>

      {/* Hodnocení polévky */}
      <div className="section">
        <h3>Hodnocení polévky</h3>
        <button
          className={getButtonClass(soup, 'Bez polévky')}
          onClick={() => setSoup('Bez polévky')}
        >
          Bez polévky
        </button>
        <button
          className={getButtonClass(soup, 'Dobrá')}
          onClick={() => setSoup('Dobrá')}
        >
          Dobrá
        </button>
        <button
          className={getButtonClass(soup, 'Průměrná')}
          onClick={() => setSoup('Průměrná')}
        >
          Průměrná
        </button>
        <button
          className={getButtonClass(soup, 'Špatná')}
          onClick={() => setSoup('Špatná')}
        >
          Špatná
        </button>
      </div>

      {/* Hodnocení dezertu */}
      <div className="section">
        <h3>Hodnocení dezertu</h3>
        <button
          className={getButtonClass(dessert, 'Bez dezertu')}
          onClick={() => setDessert('Bez dezertu')}
        >
          Bez dezertu
        </button>
        <button
          className={getButtonClass(dessert, 'Dobrá')}
          onClick={() => setDessert('Dobrá')}
        >
          Dobrá
        </button>
        <button
          className={getButtonClass(dessert, 'Průměrná')}
          onClick={() => setDessert('Průměrná')}
        >
          Průměrná
        </button>
        <button
          className={getButtonClass(dessert, 'Špatná')}
          onClick={() => setDessert('Špatná')}
        >
          Špatná
        </button>
      </div>

      {/* Checkbox "Ochoten připlatit" */}
      <div className="checkbox-container">
        <label>
          <input
            type="checkbox"
            checked={wouldPayMore}
            onChange={() => setWouldPayMore(!wouldPayMore)}
          />
          Ochoten připlatit
        </label>
      </div>

      {/* Zpětná vazba */}
      <textarea
        placeholder="Zpětná vazba (dobrovolné)"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
        className="feedback"
      ></textarea>

      {/* Tlačítko pro odeslání */}
      <button className="submit-button" onClick={handleSubmit}>
        Potvrdit hodnocení
      </button>
    </div>
  );
}
