// App.tsx
import React, { useState } from "react";
import {
	BrowserRouter as Router,
	Route,
	Routes,
	Navigate,
} from "react-router-dom";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import LunchRating from "./pages/LunchRatingForm";

interface UserCredentials {
	username: string;
	password: string;
}

export default function App() {
	const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
	const [userCredentials, setUserCredentials] =
		useState<UserCredentials | null>(null);

	const handleLogin = (username: string, password: string) => {
		setUserCredentials({ username, password });
		setIsLoggedIn(true);
	};

	const handleLogout = () => {
		setUserCredentials(null);
		setIsLoggedIn(false);
	};

	return (
		<Router>
			<Routes>
				<Route
					path="/"
					element={
						<LandingPage
							isLoggedIn={isLoggedIn}
							userCredentials={userCredentials!}
							onLogout={handleLogout}
						/>
					}
				/>
				<Route
					path="/login"
					element={<LoginPage onLogin={handleLogin} />}
				/>
				<Route
					path="/rating"
					element={
						isLoggedIn && userCredentials ? (
							<LunchRating
								refreshData={undefined}
								userCredentials={userCredentials}
								onClose={() => <Navigate to="/" replace />}
							/>
						) : (
							<Navigate to="/login" replace />
						)
					}
				/>
				<Route path="*" element={<Navigate to="/" />} />
			</Routes>
		</Router>
	);
}
