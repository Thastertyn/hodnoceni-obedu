import { useState, useEffect, useCallback } from "react";

// --- Helper functions ---
const getCurrentDateString = () => new Date().toISOString().split("T")[0];

const isCacheValid = (cacheData, expirationMinutes) => {
	if (!cacheData?.timestamp) return false;
	const now = new Date();
	const cachedTime = new Date(cacheData.timestamp);
	const diffMinutes = (now - cachedTime) / (1000 * 60);
	return diffMinutes < expirationMinutes;
};

// --- Main hook ---
export function useLunch(userCredentials, { past = 7, future = 0 } = {}) {
	const [todayMeal, setTodayMeal] = useState(null);
	const [pastLunches, setPastLunches] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);

	const fetchLunches = useCallback(
		async (forceRefresh = false) => {
			if (!userCredentials) return;

			const todayStr = getCurrentDateString();
			const cacheKey = `lunchData_${userCredentials.username}`;

			if (!forceRefresh) {
				try {
					const cachedData = localStorage.getItem(cacheKey);
					if (cachedData) {
						const parsed = JSON.parse(cachedData);
						if (isCacheValid(parsed, 30)) {
							console.log("Using cached lunch data");
							applyLunchData(parsed.data, todayStr);
							return;
						}
					}
				} catch (err) {
					console.warn("Error reading lunch cache:", err);
				}
			}

			try {
				setLoading(true);
				const response = await fetch(
					`http://127.0.0.1:8000/lunch?day=${todayStr}&past=${past}&future=${future}`,
					{
						method: "GET",
						headers: {
							"Content-Type": "application/json",
							"X-USERNAME": userCredentials.username,
							"X-PASSWORD": userCredentials.password,
						},
					}
				);

				if (!response.ok) {
					throw new Error(`Chyba serveru: ${response.status}`);
				}

				const data = await response.json();
				localStorage.setItem(
					cacheKey,
					JSON.stringify({ data, timestamp: new Date().toISOString() })
				);

				applyLunchData(data, todayStr);
			} catch (err) {
				console.error("❌ Error fetching /lunch:", err);
				setError(`Nepodařilo se načíst obědy: ${err.message}`);
			} finally {
				setLoading(false);
			}
		},
		[userCredentials, past, future]
	);

	const applyLunchData = (data, todayStr) => {
		const today = data[todayStr] || null;
		setTodayMeal(today?.lunch ? { ...today.lunch, lunch_date: todayStr } : null);

		const past = Object.entries(data)
			.filter(([dateStr]) => dateStr < todayStr)
			.sort(([a], [b]) => b.localeCompare(a))
			.slice(0, 5)
			.map(([dateStr, entry]) => ({
				lunch: { ...entry.lunch, lunch_date: dateStr },
				rating: entry.rating,
			}));

		setPastLunches(past);
	};

	useEffect(() => {
		if (userCredentials) fetchLunches();
	}, [userCredentials, fetchLunches]);

	return {
		todayMeal,
		pastLunches,
		loading,
		error,
		refresh: () => fetchLunches(true),
	};
}
