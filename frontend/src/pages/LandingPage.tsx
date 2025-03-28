import React, { useState } from "react";
import "../css/landing_page.css";
import { useLunch } from "../hooks/useLunch";
import { LogoutModal } from "./LogoutModal";
import { GuestLanding } from "../components/GuestLandingPage";
import { TodayMealCard } from "../components/TodayMealCard";
import { PastMealsList } from "../components/PastMealList";
import { BottomNav } from "../components/BottomNav";

interface UserCredentials {
	username: string;
	password: string;
}

interface LandingPageProps {
	isLoggedIn: boolean;
	userCredentials: UserCredentials;
	onLogout: () => void;
}

export default function LandingPage({
	isLoggedIn,
	userCredentials,
	onLogout,
}: LandingPageProps) {
	const [showLogoutModal, setShowLogoutModal] = useState(false);

	const { todayMeal, pastLunches, loading, error, refresh } =
		useLunch(userCredentials);

	const openLogoutModal = () => setShowLogoutModal(true);
	const closeLogoutModal = () => setShowLogoutModal(false);

	return (
		<div className="landing-page">
			{!isLoggedIn && <GuestLanding />}


			{isLoggedIn && (
				<>
					<header className="rating-title">
						<p>
							Vyberte si oběd a
							<br />
							<span>ohodnoťte jej!</span>
						</p>
					</header>

					<TodayMealCard
						lunchEntry={todayMeal}
						loading={loading}
						error={error}
						refresh={refresh}
					/>

					<PastMealsList
						meals={pastLunches}
						loading={loading}
						error={error}
						refresh={refresh}
					/>
				</>
			)}

			<BottomNav isLoggedIn={isLoggedIn} onProfileClick={openLogoutModal} />

			{showLogoutModal && (
				<LogoutModal onClose={closeLogoutModal} onLogout={onLogout} />
			)}
		</div>
	);
}
