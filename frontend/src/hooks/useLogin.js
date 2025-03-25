import { useState } from 'react';

export function useLogin(onSuccess) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyLogin = async (username, password) => {
    if (!username || !password) {
      setError('Zadejte prosím uživatelské jméno a heslo.');
      return false;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('http://127.0.0.1:8000/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-USERNAME': username,
          'X-PASSWORD': password,
        },
      });

      if (!response.ok) {
        setError('Přihlášení se nezdařilo. Zkontrolujte své údaje.');
        return false;
      }

      // Success
      onSuccess(username, password);
      return true;

    } catch (err) {
      console.error('Login error:', err);
      setError('Chyba při přihlašování. Zkuste to prosím znovu.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyLogin, isLoading, error };
}
