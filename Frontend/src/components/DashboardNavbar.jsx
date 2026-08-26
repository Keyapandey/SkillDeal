import "../css/dashboardNavbar.css";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import AuthPrompt from "./AuthPrompt";
import { CircleUserRound } from "lucide-react";

function DashboardNavbar() {

  const navigate = useNavigate();

  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  const isLoggedIn = !!localStorage.getItem("token");


  const handleProfileClick = () => {

    if (isLoggedIn) {
      navigate("/profile");
    } else {
     navigate("/", { state: { openLogin: true } }); 
    }

  };


  const handleMessagesClick = () => {

    if (isLoggedIn) {
      navigate("/messages");
    } else {
      setShowAuthPrompt(true);
    }

  };


  return (
    <>
      <nav className="dashboard-navbar">

        {/* LOGO */}

        <div className="dashboard-logo">

          <div className="dashboard-logo-circle"></div>

          <span>
            SkillDeal
          </span>

        </div>


        {/* NAVIGATION */}

        <ul className="dashboard-links">

          <li>
            <Link to="/">
              Home
            </Link>
          </li>


          <li>
            <Link to="/explore">
              Explore
            </Link>
          </li>


          <li>
            <Link to="/matches">
              Matches
            </Link>
          </li>


          {/* MESSAGES */}

          <li>

            {isLoggedIn ? (

              <Link to="/messages">
                Messages
              </Link>

            ) : (

              <button
                className="dashboard-link-button"
                onClick={handleMessagesClick}
              >
                Messages
              </button>

            )}

          </li>


          {/* LEADERBOARD */}

          <li>
            <Link to="/leaderboard">
              Leaderboard
            </Link>
          </li>


          {/* PROFILE / LOGIN */}

          <li>

            <button
              className={
                isLoggedIn
                  ? "dashboard-profile"
                  : "dashboard-login-btn"
              }
              onClick={handleProfileClick}
            >

              {isLoggedIn ? (
  <CircleUserRound size={25} strokeWidth={2} />
) : (
  "Log In"
)}

            </button>

          </li>

        </ul>

      </nav>


      {/* AUTH POPUP */}

      {showAuthPrompt && (
  <AuthPrompt
    onClose={() => setShowAuthPrompt(false)}
    onGetStarted={() => {
      setShowAuthPrompt(false);
      navigate("/", { state: { openSignup: true } });
    }}
    onLogin={() => {
      setShowAuthPrompt(false);
      navigate("/", { state: { openLogin: true } });
    }}
  />
)}

    </>
  );
}

export default DashboardNavbar;