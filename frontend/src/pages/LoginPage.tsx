// LoginPage.tsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../css/login_page.css";
import logo from "../img/logo.png";
import { useLogin } from "../hooks/useLogin";

interface LoginPageProps {
   onLogin: (username: string, password: string) => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
   const navigate = useNavigate();
   const [username, setUsername] = useState<string>("");
   const [password, setPassword] = useState<string>("");

   const { verifyLogin, isLoading, error } = useLogin((user: string, pass: string) => {
      onLogin(user, pass);
      navigate("/");
   });

   const handleLogin = async () => {
      await verifyLogin(username, password);
   };

   return (
      <div className="login-container">
         <div className="left-section">
            <img src={logo} alt="logo" className="logo" />
            <p>
               Vítejte v aplikaci pro
               <br />
               <span>Hodnocení školních obědů</span>
            </p>
         </div>

         <div className="right-section">
            <div className="login-form">
               <h2>Přihlášení</h2>
               <p>Zadejte Vaše přihlašovací údaje k iCanteen!</p>

               {error && <div className="error-message">{error}</div>}

               <div className="input-container">
                  <span className="icon">👤</span>
                  <input
                     type="text"
                     placeholder="Uživatelské jméno"
                     value={username}
                     onChange={(e) => setUsername(e.target.value)}
                     disabled={isLoading}
                  />
               </div>

               <div className="input-container">
                  <span className="icon">🔒</span>
                  <input
                     type="password"
                     placeholder="Heslo"
                     value={password}
                     onChange={(e) => setPassword(e.target.value)}
                     disabled={isLoading}
                  />
               </div>

               <button
                  className="login-button"
                  onClick={handleLogin}
                  disabled={isLoading}>
                  {isLoading ? "Přihlašování..." : "Přihlásit se"}
               </button>
            </div>
         </div>
      </div>
   );
}
