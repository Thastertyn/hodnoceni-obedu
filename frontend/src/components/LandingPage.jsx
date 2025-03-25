import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import LogoutModal from "./LogoutModal";
import "../css/landing_page.css";
import logo from "../img/logo.png";
import { useLunch } from "../hooks/useLunch";

export default function LandingPage({ isLoggedIn, userCredentials, onLogout }) {
	const navigate = useNavigate();
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const { todayMeal, pastLunches, loading, error, refresh } =
		useLunch(userCredentials);

	// --- Logout modal handlers ---
	const openLogoutModal = () => setShowLogoutModal(true);
	const closeLogoutModal = () => setShowLogoutModal(false);

	// --- Format date: "DD.MM.YYYY" ---
	const formatDate = (dateString) => {
		if (!dateString) return "";
		const date = new Date(dateString);
		return `${date.getDate().toString().padStart(2, "0")}.${(
			date.getMonth() + 1
		)
			.toString()
			.padStart(2, "0")}.${date.getFullYear()}`;
	};


	return (
		<div className="landing-page">
			{/* If user is NOT logged in, show original layout */}
			{!isLoggedIn && (
				<div className="content">
					<header className="landing-header">
						<p>
							Vítejte v aplikaci,
							<br />
							<span>Hodnocení školních obědů</span>
						</p>
						<div className="sub-text">
							<p>
								Vyberte si <strong>oběd</strong> a{" "}
								<strong>ohodnoťte</strong> jej!
							</p>
						</div>
					</header>
					<div className="logo-container">
						<img src={logo} alt="logo" className="logo" />
					</div>
					<section className="login-prompt">
						<h2>
							<strong>Přihlaste se</strong> pro hodnocení!
						</h2>
						<button
							className="login-button-redir"
							onClick={() => navigate("/login")}>
							Přihlásit se
						</button>
					</section>
				</div>
			)}

			{/* If user IS logged in, show the new layout with data from API */}
			{isLoggedIn && (
				<>
					<header className="rating-title">
						<p>
							Vyberte si oběd a
							<br />
							<span>ohodnoťte jej!</span>
						</p>
					</header>

					{/* Dnešní oběd */}
					<section className="today-meal">
						<h3 style={{color:"black"}}>Dnešní oběd</h3>
						{loading && (
							<p className="loading-message">
								Načítání dnešního oběda...
							</p>
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
								<div className="meal-card">
									<p>
										<strong>Polévka:</strong> {todayMeal.soup}
									</p>
									<p>
										<strong>Hlavní jídlo 1:</strong>{" "}
										{todayMeal.first_option}
									</p>
									<p>
										<strong>Hlavní jídlo 2:</strong>{" "}
										{todayMeal.second_option}
									</p>
									<p>
										<strong>Nápoj:</strong> {todayMeal.drink}
									</p>
									<small>{formatDate(todayMeal.lunch_date)}</small>
									<button
										className="rate-button"
										onClick={() =>
											navigate("/rating", {
												state: {
													mealId: todayMeal.lunch_id,
													date: todayMeal.lunch_date,
												},
											})
										}>
										Hodnotit
									</button>
								</div>
							</div>
						)}
					</section>

					{/* Obědy v posledním týdnu (older than today) */}
					<section className="past-meals">
						<h3>Obědy v posledním týdnu</h3>
						{loading && (
							<p className="loading-message">
								Načítání obědů...
							</p>
						)}
						{error && (
							<div className="error-container">
								<p className="error-message">{error}</p>
								<button onClick={refresh} className="retry-button">
									Zkusit znovu
								</button>
							</div>
						)}
						{!loading && !error && pastLunches.length === 0 ? (
							<p>Žádné starší obědy nebyly nalezeny.</p>
						) : (
							pastLunches.map((meal, index) => {
								// meal is { lunch: {...}, rating: {...} or null }
								const isRated = meal.rating !== null;

								return (
									<div
										className="meal-card"
										key={meal.lunch.lunch_id || index}
										onClick={() => {
											// Only allow rating if not rated yet
											if (!isRated) {
												navigate("/rating", {
													state: {
														mealId: meal.lunch.lunch_id,
														date: meal.lunch.lunch_date,
													},
												});
											}
										}}
										style={{
											cursor: isRated ? "default" : "pointer",
										}}>
										<span
											className="status"
											style={{ color: isRated ? "green" : "red" }}>
											{isRated ? "Hodnoceno" : "Nehodnoceno"}
										</span>
										<p>
											<strong>Oběd : {meal.lunch.main_course}:</strong>{" "}
											{meal.lunch.first_option}
										</p>
										<small>{formatDate(meal.lunch.lunch_date)}</small>
									</div>
								);
							})
						)}
					</section>
				</>
			)}

			{/* Bottom navigation bar */}
			<nav className="bottom-nav">
				<button>
					<span role="img" aria-label="home">
						🏠
					</span>
				</button>
				<button
					onClick={() =>
						isLoggedIn ? navigate("/rating") : navigate("/login")
					}>
					<span role="img" aria-label="ratings">
						🖊️
					</span>
				</button>
				<button onClick={() => setShowLogoutModal(true)}>
					<span role="img" aria-label="profile">
						👤
					</span>
				</button>
			</nav>

			{/* Logout confirmation modal */}
			{showLogoutModal && (
				<LogoutModal onClose={closeLogoutModal} onLogout={onLogout} />
			)}
		</div>
	);
}
