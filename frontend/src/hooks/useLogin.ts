// hooks/useLogin.ts
import { useState } from "react";

type OnSuccessFn = (username: string, password: string) => void;

interface UseLoginResult {
	verifyLogin: (username: string, password: string) => Promise<boolean>;
	isLoading: boolean;
	error: string;
}

export function useLogin(onSuccess: OnSuccessFn): UseLoginResult {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [error, setError] = useState<string>("");

	const verifyLogin = async (
		username: string,
		password: string
	): Promise<boolean> => {
		if (!username || !password) {
			setError("Zadejte prosím uživatelské jméno a heslo.");
			return false;
		}

		setIsLoading(true);
		setError("");

		try {
			const response = await fetch("http://127.0.0.1:8000/verify-login", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"X-USERNAME": username,
					"X-PASSWORD": password,
				},
			});

			if (!response.ok) {
				setError("Přihlášení se nezdařilo. Zkontrolujte své údaje.");
				return false;
			}

			onSuccess(username, password);
			return true;
		} catch (err) {
			console.error("Login error:", err);
			setError("Chyba při přihlašování. Zkuste to prosím znovu.");
			return false;
		} finally {
			setIsLoading(false);
		}
	};

	return { verifyLogin, isLoading, error };
}
