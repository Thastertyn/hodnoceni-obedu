import React from "react";
import { useNavigate } from "react-router-dom";
import { Lunch, LunchEntry } from "../types";

interface TodayMealCardProps {
	lunchEntry: LunchEntry | null;
	loading: boolean;
	error: string | null;
	refresh: () => void;
}

export function TodayMealCard({
	lunchEntry,
	loading,
	error,
	refresh,
}: TodayMealCardProps) {
	const navigate = useNavigate();

	const todayMeal = lunchEntry?.lunch;
	const isOrdered = todayMeal?.main_course !== undefined;
	const isRated = lunchEntry?.rating !== null;
	const today = new Date().toISOString().split("T")[0];

	return (
		<section className="today-meal">
			<h3 style={{ color: "black" }}>Dnešní oběd</h3>
			{loading && (
				<p className="loading-message">Načítání dnešního oběda...</p>
			)}

			{todayMeal === null && (
				<div className="error-container">
					<p className="error-message">Neobjednáno</p>
				</div>
			)}

			{error && (
				<div className="error-container">
					<p className="error-message">{error}</p>
					<button onClick={refresh} className="retry-button">
						Zkusit znovu
					</button>
				</div>
			)}

			{!loading && !error && todayMeal && (
				<div className="meal-options">
					<div
						className="meal-card"
						onClick={() =>
							isOrdered &&
							navigate("/rating", {
								state: {
									date: today,
								},
							})
						}
						style={{
							cursor: isOrdered ? "pointer" : "default",
						}}
					>
						{(isOrdered && (
							<span
								className="status"
								style={{ color: isRated ? "green" : "red" }}
							>
								{isRated ? "Hodnoceno" : "Nehodnoceno"}
							</span>
						)) || <span className="status">&nbsp;</span>}
						<p>
							<strong>Polévka:</strong> {todayMeal.soup}
						</p>
						<p>
							<strong>Hlavní jídlo:</strong> {todayMeal.main_course}
						</p>
						<p>
							<strong>Nápoj:</strong> {todayMeal.drink}
						</p>
						<small>Dnes</small>
					</div>
				</div>
			)}
		</section>
	);
}
