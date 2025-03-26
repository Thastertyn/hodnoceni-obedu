import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/lunch_rating_form.css';
import RatingSection from '../components/RatingSection';
import { UserCredentials } from '../types';

type Props = {
   onClose?: () => void;
   userCredentials: UserCredentials | null;
   refreshData?: () => void;
};

const toggleSelection = (
   currentValue: string,
   newValue: string,
   setState: (val: string) => void
) => {
   setState(currentValue === newValue ? '' : newValue);
};

export default function LunchRatingForm({
   onClose,
   userCredentials,
   refreshData,
}: Props) {
   const navigate = useNavigate();
   const { state } = useLocation();
   const { mealId, date } = (state as { mealId: string; date: string }) || {};

   const username =
      userCredentials?.username || localStorage.getItem('username') || '';
   const password =
      userCredentials?.password || localStorage.getItem('password') || '';

   const [taste, setTaste] = useState('');
   const [temperature, setTemperature] = useState('');
   const [portion, setPortion] = useState('');
   const [soup, setSoup] = useState('');
   const [dessert, setDessert] = useState('');
   const [wouldPayMore, setWouldPayMore] = useState('');
   const [feedback, setFeedback] = useState('');
   const [isSubmitting, setIsSubmitting] = useState(false);
   const [error, setError] = useState<string | null>(null);

   const handleSubmit = async () => {
      if (!username || !password) {
         setError('Nejste přihlášeni. Přihlaste se prosím znovu.');
         return;
      }

      if (!taste || !temperature || !portion) {
         setError('Vyplňte prosím alespoň chuť, teplotu a velikost porce.');
         return;
      }

      setIsSubmitting(true);
      setError(null);

      const formData = {
         lunch_id: mealId,
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
               Accept: 'application/json',
               'Content-Type': 'application/json',
               'X-USERNAME': username,
               'X-PASSWORD': password,
            },
            body: JSON.stringify(formData),
         });

         if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detail || `HTTP chyba: ${response.status}`);
         }

         console.log('✅ Hodnocení odesláno');
         refreshData?.();
         navigate('/', { replace: true });
      } catch (err: any) {
         console.error('❌ Chyba:', err);
         setError(`Chyba při odesílání hodnocení: ${err.message}`);
      } finally {
         setIsSubmitting(false);
      }
   };

   return (
      <div className="rating-container">
         <div className="form-header">
            <button className="close-button" onClick={onClose || (() => navigate('/'))}>
               ×
            </button>
         </div>
         <h2>Hodnocení</h2>

         {error && <div className="error-message">{error}</div>}

         <div className="sections-container">
            <RatingSection
               title="Polévka"
               options={['Bez polévky', 'Dobrá', 'Průměrná', 'Špatná']}
               selected={soup}
               onSelect={(val) => toggleSelection(soup, val, setSoup)}
            />
            <RatingSection
               title="Dezert"
               options={['Bez dezertu', 'Dobrá', 'Průměrná', 'Špatná']}
               selected={dessert}
               onSelect={(val) => toggleSelection(dessert, val, setDessert)}
            />
            <RatingSection
               title="Chuť jídla"
               options={['Vynikající', 'Průměrné', 'Mizerné']}
               selected={taste}
               onSelect={(val) => toggleSelection(taste, val, setTaste)}
            />
            <RatingSection
               title="Teplota"
               options={['Studené', 'Akorát', 'Horké']}
               selected={temperature}
               onSelect={(val) => toggleSelection(temperature, val, setTemperature)}
            />
            <RatingSection
               title="Porce"
               options={['Hlad', 'Akorát', 'Přejedl']}
               selected={portion}
               onSelect={(val) => toggleSelection(portion, val, setPortion)}
            />
            <RatingSection
               title="Příplatek"
               options={[
                  '6Kč - větší porce',
                  '10Kč - dezert',
                  'Nejsem ochoten připlatit',
               ]}
               selected={wouldPayMore}
               onSelect={(val) => toggleSelection(wouldPayMore, val, setWouldPayMore)}
            />
         </div>

         <textarea
            className="feedback"
            placeholder="Zpětná vazba (dobrovolné)"
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
         ></textarea>

         <button
            className={`submit-button ${isSubmitting ? 'submitting' : ''}`}
            onClick={handleSubmit}
            disabled={isSubmitting}
         >
            {isSubmitting ? 'Odesílám...' : 'Potvrdit hodnocení'}
         </button>

         <div className="user-info-display">Přihlášen: {username}</div>
      </div>
   );
}