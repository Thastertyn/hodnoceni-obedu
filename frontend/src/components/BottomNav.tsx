import React from "react";
import { useNavigate } from "react-router-dom";

interface BottomNavProps {
   isLoggedIn: boolean;
   onProfileClick: () => void;
}

export function BottomNav({ isLoggedIn, onProfileClick }: BottomNavProps) {
   const navigate = useNavigate();

   return (
      <nav className="bottom-nav">
         <button>
            <span role="img" aria-label="home">🏠</span>
         </button>
         <button onClick={() => navigate(isLoggedIn ? "/rating" : "/login")}>
            <span role="img" aria-label="ratings">🖊️</span>
         </button>
         <button onClick={onProfileClick}>
            <span role="img" aria-label="profile">👤</span>
         </button>
      </nav>
   );
}
