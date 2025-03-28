import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import '../css/lunch_rating_form.css';
import RatingSection from '../components/RatingSection';
import { UserCredentials, RATING_LABELS } from '../types';
import { API_HOST } from '../config';

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

const invertMapping = (mapping: Record<number, string>) => {
   return Object.entries(mapping).map(([key, label]) => ({
      key,
      label,
   }));
};

export default function LunchRatingForm({
   onClose,
   userCredentials,
   refreshData,
}: Props) {
   const navigate = useNavigate();
   const { state } = useLocation();
   let { mealId, date } = (state as { mealId: string; date: string }) || {};

   if(!date) {
      date = new Date().toISOString().split("T")[0];
   }

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
         taste: parseInt(taste),
         temperature: parseInt(temperature),
         portion_size: parseInt(portion),
         soup: soup !== '' ? parseInt(soup) : null,
         dessert: dessert !== '' ? parseInt(dessert) : null,
         would_pay_more: wouldPayMore !== '' ? parseInt(wouldPayMore) : null,
         feedback,
      };

      try {
         const response = await fetch(`${API_HOST}/lunch/${date}/rate`, {
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
            <button className="close-button" onClick={(() => navigate('/'))}>
               ×
            </button>
         </div>
         <h2>Hodnocení</h2>

         {error && <div className="error-message">{error}</div>}

         <div className="sections-container">
            <RatingSection
               title="Polévka"
               options={invertMapping(RATING_LABELS.soup)}
               selected={soup}
               onSelect={(val) => toggleSelection(soup, val, setSoup)}
            />
            <RatingSection
               title="Dezert"
               options={invertMapping(RATING_LABELS.dessert)}
               selected={dessert}
               onSelect={(val) => toggleSelection(dessert, val, setDessert)}
            />
            <RatingSection
               title="Chuť jídla"
               options={invertMapping(RATING_LABELS.taste)}
               selected={taste}
               onSelect={(val) => toggleSelection(taste, val, setTaste)}
            />
            <RatingSection
               title="Teplota"
               options={invertMapping(RATING_LABELS.temperature)}
               selected={temperature}
               onSelect={(val) => toggleSelection(temperature, val, setTemperature)}
            />
            <RatingSection
               title="Porce"
               options={invertMapping(RATING_LABELS.portion_size)}
               selected={portion}
               onSelect={(val) => toggleSelection(portion, val, setPortion)}
            />
            <RatingSection
               title="Příplatek"
               options={invertMapping(RATING_LABELS.would_pay_more)}
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
