import "../css/navbar.css";
import {
  Link,
  useNavigate,
  useLocation
} from "react-router-dom";
import { useState } from "react";
import AuthPrompt from "../components/AuthPrompt";

function Navbar({ onLoginClick, onSignupClick }) {

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const isLoggedIn = !!localStorage.getItem("token");


  // =========================
  // NORMAL LOGIN BUTTON
  // =========================

  const handleAuthClick = () => {

    if (isLoggedIn) {
      navigate("/profile");
      return;
    }

    // Already on Home
    if (location.pathname === "/") {
      onLoginClick();
      return;
    }

    // On Explore / Matches / Leaderboard etc.
    // Go Home and open the normal LoginModal
    navigate("/", {
      state: {
        openLogin: true
      }
    });
  };


  return (
    <nav className="navbar">

      <div className="logo">

        <div className="logo-circle"></div>

        <span>
          SkillDeal
        </span>

      </div>


      <ul className="navbar-links">

        {/* HOME */}

        <li>
          <Link to="/">
            Home
          </Link>
        </li>


        {/* EXPLORE */}

        <li>
          <Link to="/explore">
            Explore
          </Link>
        </li>


        {/* MATCHES */}

        <li>
          <Link to="/matches">
            Matches
          </Link>
        </li>


        {/* MESSAGES */}

        <li>

          <button
            type="button"
            className="navbar-link-button"
            onClick={() => {

              if (isLoggedIn) {

                navigate("/messages");

              } else {

                setShowAuthPrompt(true);

              }

            }}
          >
            Messages
          </button>

        </li>


        {/* LEADERBOARD */}

        <li>
          <Link to="/leaderboard">
            Leaderboard
          </Link>
        </li>


        {/* LOGIN / PROFILE */}

        <li>

          <button
            className="login-btn"
            onClick={handleAuthClick}
          >
            {isLoggedIn
              ? "👤 Profile"
              : "Log In"}
          </button>

        </li>

      </ul>


      {/* AUTH PROMPT */}

      {showAuthPrompt && (

        <AuthPrompt

          onClose={() => {
            setShowAuthPrompt(false);
          }}



          onGetStarted={() => {

            setShowAuthPrompt(false);

            navigate("/", {
              state: {
                openSignup: true
              }
            });

          }}



          onLogin={() => {

            setShowAuthPrompt(false);

            navigate("/", {
              state: {
                openLogin: true
              }
            });

          }}

        />

      )}

    </nav>
  );
}

export default Navbar;