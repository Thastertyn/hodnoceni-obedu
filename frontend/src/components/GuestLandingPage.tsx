import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "../img/logo.png";

export function GuestLanding() {
	const navigate = useNavigate();

	return (
		<div className="content">
			<header className="landing-header">
				<p>
					Vítejte v aplikaci,
					<br />
					<span>Hodnocení školních obědů</span>
				</p>
				<div className="sub-text">
					<p>
						Vyberte si <strong>oběd</strong> a <strong>ohodnoťte</strong>{" "}
						jej!
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
	);
}
