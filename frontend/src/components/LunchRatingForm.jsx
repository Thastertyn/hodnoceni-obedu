import React, { useState } from 'react';
import '../css/lunch_rating_form.css';

export default function LunchRatingForm({ onClose }) {
  const [taste, setTaste] = useState('');
  const [temperature, setTemperature] = useState('');
  const [portion, setPortion] = useState('');
  const [soup, setSoup] = useState('');
  const [dessert, setDessert] = useState('');
  const [wouldPayMore, setWouldPayMore] = useState('');
  const [feedback, setFeedback] = useState('');

  // Pomocná funkce pro přiřazení třídy tlačítku dle výběru
  const getButtonClass = (selectedValue, optionValue) =>
    selectedValue === optionValue ? 'button selected' : 'button';

  // Funkce pro změnu výběru (kliknutím na stejnou možnost ji zrušíš)
  const toggleSelection = (setState, value, current) => {
    setState(current === value ? '' : value);
  };

  // Odeslání formuláře
  const handleSubmit = () => {
    const formData = { taste, temperature, portion, soup, dessert, wouldPayMore, feedback };
    console.log('Form data:', formData);
  };

  return (
    <div className="rating-container">
      <div className="form-header">
        <button className="close-button" onClick={onClose}>×</button>
      </div>
      <h2>Hodnocení</h2>

      <div className="sections-container">
        {/* Hodnocení polévky */}
        <div className="section">
          <h3>Hodnocení polévky</h3>
          <button className={getButtonClass(soup, 'Bez polévky')} onClick={() => toggleSelection(setSoup, 'Bez polévky', soup)}>Bez polévky</button>
          <button className={getButtonClass(soup, 'Dobrá')} onClick={() => toggleSelection(setSoup, 'Dobrá', soup)}>Dobrá</button>
          <button className={getButtonClass(soup, 'Průměrná')} onClick={() => toggleSelection(setSoup, 'Průměrná', soup)}>Průměrná</button>
          <button className={getButtonClass(soup, 'Špatná')} onClick={() => toggleSelection(setSoup, 'Špatná', soup)}>Špatná</button>
        </div>

        {/* Hodnocení dezertu */}
        <div className="section">
          <h3>Hodnocení dezertu</h3>
          <button className={getButtonClass(dessert, 'Bez dezertu')} onClick={() => toggleSelection(setDessert, 'Bez dezertu', dessert)}>Bez dezertu</button>
          <button className={getButtonClass(dessert, 'Dobrá')} onClick={() => toggleSelection(setDessert, 'Dobrá', dessert)}>Dobrá</button>
          <button className={getButtonClass(dessert, 'Průměrná')} onClick={() => toggleSelection(setDessert, 'Průměrná', dessert)}>Průměrná</button>
          <button className={getButtonClass(dessert, 'Špatná')} onClick={() => toggleSelection(setDessert, 'Špatná', dessert)}>Špatná</button>
        </div>
        
        {/* Hodnocení chuti */}
        <div className="section">
          <h3>Chuť jídla</h3>
          <button className={getButtonClass(taste, 'Vynikající')} onClick={() => toggleSelection(setTaste, 'Vynikající', taste)}>Vynikající – skvěle dochucené</button>
          <button className={getButtonClass(taste, 'Průměrné')} onClick={() => toggleSelection(setTaste, 'Průměrné', taste)}>Průměrné – obyčejné, nevýrazné</button>
          <button className={getButtonClass(taste, 'Mizerné')} onClick={() => toggleSelection(setTaste, 'Mizerné', taste)}>Mizerné – nedochucené, zklamání</button>
          <button className={"button"} style={{opacity: 0}}>s</button>
        </div>

        {/* Hodnocení teploty */}
        <div className="section">
          <h3>Teplota</h3>
          <button className={getButtonClass(temperature, 'Studené')} onClick={() => toggleSelection(setTemperature, 'Studené', temperature)}>Studené</button>
          <button className={getButtonClass(temperature, 'Akorát')} onClick={() => toggleSelection(setTemperature, 'Akorát', temperature)}>Akorát</button>
          <button className={getButtonClass(temperature, 'Horké')} onClick={() => toggleSelection(setTemperature, 'Horké', temperature)}>Horké</button>
          <button className={"button"} style={{opacity: 0}}>s</button>
        </div>

        {/* Hodnocení porce */}
        <div className="section">
          <h3>Porce</h3>
          <button className={getButtonClass(portion, 'Hlad')} onClick={() => toggleSelection(setPortion, 'Hlad', portion)}>Měl jsem hlad</button>
          <button className={getButtonClass(portion, 'Akorát')} onClick={() => toggleSelection(setPortion, 'Akorát', portion)}>Akorát</button>
          <button className={getButtonClass(portion, 'Přejedl')} onClick={() => toggleSelection(setPortion, 'Přejedl', portion)}>Přejedl jsem se</button>
          <button className={"button"} style={{opacity: 0}}>s</button>
        </div>

        {/* Ochoten připlatit */}
        <div className="section">
          <h3>Příplatek</h3>
          <button className={getButtonClass(wouldPayMore, '6Kč - větší porce')} onClick={() => toggleSelection(setWouldPayMore, '6Kč - větší porce', wouldPayMore)}>6Kč - větší porce</button>
          <button className={getButtonClass(wouldPayMore, '10Kč - dezert (buchta, puding, ...)')} onClick={() => toggleSelection(setWouldPayMore, '10Kč - dezert (buchta, puding, ...)', wouldPayMore)}>10Kč - dezert (buchta, puding, ...)</button>
          <button className={getButtonClass(wouldPayMore, 'Nejsem ochoten připlatit')} onClick={() => toggleSelection(setWouldPayMore, 'Nejsem ochoten připlatit', wouldPayMore)}>Nejsem ochoten připlatit</button>
          <button className={"button"} style={{opacity: 0}}>s</button>
        </div>
      </div>
 
      {/* Zpětná vazba */}
      <textarea className="feedback" placeholder="Zpětná vazba (dobrovolné)" value={feedback} onChange={(e) => setFeedback(e.target.value)}></textarea>

      {/* Tlačítko pro odeslání */}
      <button className="submit-button" onClick={handleSubmit}>Potvrdit hodnocení</button>
    </div>
  );
}
