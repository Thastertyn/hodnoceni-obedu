import React from "react";
import { useNavigate } from "react-router-dom";
import { Lunch } from "../types";

interface TodayMealCardProps {
	todayMeal: Lunch | null;
	loading: boolean;
	error: string | null;
	refresh: () => void;
}

export function TodayMealCard({
	todayMeal,
	loading,
	error,
	refresh,
}: TodayMealCardProps) {
	const navigate = useNavigate();

	return (
		<section className="today-meal">
			<h3 style={{ color: "black" }}>Dnešní oběd</h3>
			{loading && (
				<p className="loading-message">Načítání dnešního oběda...</p>
			)}
			{(todayMeal == null || error)&& (
				<div className="error-container">
					<p className="error-message">{error}</p>
					<button onClick={refresh} className="retry-button">
						Zkusit znovu
					</button>
				</div>
			)}
			{!loading && !error && todayMeal && (
				<div className="meal-options">
					<div className="meal-card">
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
						{/* <button
							className="rate-button"
							onClick={() =>
								navigate("/rating", {
									state: {
										date: todayMeal.lunch_date,
									},
								})
							}>
							Hodnotit
						</button> */}
					</div>
				</div>
			)}
		</section>
	);
}
