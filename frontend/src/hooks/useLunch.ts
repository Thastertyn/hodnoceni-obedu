import { useState, useEffect, useCallback } from "react";
import {
	Lunch,
	LunchData,
	UserCredentials,
} from "../types";

interface UseLunchOptions {
	past?: number;
	future?: number;
}

// --- Helper function ---
const getCurrentDateString = (): string =>
	new Date().toISOString().split("T")[0];

export function useLunch(
	userCredentials: UserCredentials | null,
	{ past = 7, future = 0 }: UseLunchOptions = {}
): {
	todayMeal: Lunch | null;
	pastLunches: LunchData;
	loading: boolean;
	error: string | null;
	refresh: () => void;
} {
	const [todayMeal, setTodayMeal] = useState<Lunch | null>(null);
	const [pastLunches, setPastLunches] = useState<LunchData>({});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const applyLunchData = useCallback((data: LunchData) => {
		const todayStr = getCurrentDateString();
		const todayEntry = data[todayStr];

		setTodayMeal(todayEntry?.lunch ?? null);

		const past = Object.entries(data)
			.filter(
				([date, entry]) => date < todayStr
			)
			.sort(([a], [b]) => b.localeCompare(a))
			.slice(0, 5);

		const pastObj: LunchData = Object.fromEntries(past);

		setPastLunches(pastObj);
	}, []);

	const fetchLunches = useCallback(async () => {
		if (!userCredentials) return;

		const todayStr = getCurrentDateString();

		try {
			setLoading(true);

			const url = `http://127.0.0.1:8000/lunch?day=${todayStr}&past=${past}&future=${future}`;

			const response = await fetch(url, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"X-USERNAME": userCredentials.username,
					"X-PASSWORD": userCredentials.password,
				},
			});

			if (!response.ok) {
				throw new Error(`Server error: ${response.status}`);
			}

			const data: LunchData = await response.json();

			applyLunchData(data);
		} catch (err: any) {
			console.error("❌ Error fetching /lunch:", err);
			setError(`Nepodařilo se načíst obědy: ${err.message}`);
		} finally {
			setLoading(false);
		}
	}, [userCredentials, past, future, applyLunchData]);

	useEffect(() => {
		if (userCredentials) fetchLunches();
	}, [userCredentials, fetchLunches]);

	return {
		todayMeal,
		pastLunches,
		loading,
		error,
		refresh: fetchLunches,
	};
}
