import { useNavigate } from "react-router-dom";
import { formatDate } from "../utils/date";
import { LunchData } from "../types";

interface PastMealsListProps {
	meals: LunchData;
	loading: boolean;
	error: string | null;
	refresh: () => void;
}

export function PastMealsList({
	meals,
	loading,
	error,
	refresh,
}: PastMealsListProps) {
	const navigate = useNavigate();

	const mealEntries = Object.entries(meals); // [date, entry]
	console.log(mealEntries);

	return (
		<section className="past-meals">
			<h3>Obědy v posledním týdnu</h3>

			{loading && <p className="loading-message">Načítání obědů...</p>}

			{error && (
				<div className="error-container">
					<p className="error-message">{error}</p>
					<button onClick={refresh} className="retry-button">
						Zkusit znovu
					</button>
				</div>
			)}

			{!loading && !error && mealEntries.length === 0 ? (
				<p>Žádné starší obědy nebyly nalezeny.</p>
			) : (
				mealEntries.map(([date, meal]) => {
					console.log(meal);
					const isRated = meal.rating !== null;
					const isOrdered = meal.lunch?.main_course !== undefined;
					const mainCourse = meal.lunch?.main_course ?? "Neobjednáno";

					return (
						<div
							className="meal-card"
							key={date}
							onClick={() => {
								if (!isRated) {
									navigate("/rating", { state: { date } });
								}
							}}
							style={{
								cursor: isRated || !isOrdered ? "default" : "pointer",
							}}
						>
							{isOrdered && (
								<span
									className="status"
									style={{ color: isRated ? "green" : "red" }}
								>
									{isRated ? "Hodnoceno" : "Nehodnoceno"}
								</span>
							) || (
								<span className="status">&nbsp;</span>
							)}
							<p>
								<strong>Oběd: {mainCourse}</strong>
							</p>
							<small>{formatDate(date)}</small>
						</div>
					);
				})
			)}
		</section>
	);
}
