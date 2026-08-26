import DashboardNavbar from "../components/DashboardNavbar";
import { sendExchangeRequest } from "../api/exchange";
import { getMatches,getGuestMatches } from "../api/match";
import "../css/matches.css";
import { useEffect,useState } from "react";
import AuthPrompt from "../components/AuthPrompt";
import { useNavigate } from "react-router-dom";   // 👈 import

function Matches() {
   const navigate = useNavigate();
 const [profiles, setProfiles] = useState([]);
const [currentIndex, setCurrentIndex] = useState(0);
const [action, setAction] = useState(null);
const [showAuthPrompt, setShowAuthPrompt] = useState(false);
const [guestSwipeCount, setGuestSwipeCount] = useState(0);


  useEffect(() => {
  const fetchMatches = async () => {
    try {
      const isLoggedIn = !!localStorage.getItem("token");

      const data = isLoggedIn
        ? await getMatches()
        : await getGuestMatches();

      console.log("MATCH DATA:", data);

      setProfiles(data.matches || []);

    } catch (error) {
      console.error("Failed to fetch matches:", error);
    }
  };

  fetchMatches();
}, []);

  const profile = profiles[currentIndex];

  const handleAction = async (type) => {
  if (action) return;

  const isLoggedIn = !!localStorage.getItem("token");

  // Guest trying to connect/request exchange
  if (!isLoggedIn && type === "accept") {
    setShowAuthPrompt(true);
    return;
  }

  // Guest has already used 5 swipes
  if (!isLoggedIn && type === "reject" && guestSwipeCount >= 5) {
    setShowAuthPrompt(true);
    return;
  }

  try {
    if (type === "accept") {
      await sendExchangeRequest(profile.id);
    }

    setAction(type);

    if (!isLoggedIn && type === "reject") {
      setGuestSwipeCount((prev) => prev + 1);
    }

    setTimeout(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === profiles.length - 1
          ? 0
          : prevIndex + 1
      );

      setAction(null);
    }, 1800);

  } catch (error) {
    alert(error.message);
  }
};
if (!profile) {
  return (
    <>
      <DashboardNavbar />

      <section className="matches-page">
        <p>No matches found.</p>
      </section>
    </>
  );
}
  return (
    <>
      <DashboardNavbar />

      <section className="matches-page">

        <div className="swipe-text">
  <span>Swipe left to connect, swipe right to skip</span>
</div>

        <div className="match-container">

          {/* LEFT / CONNECT */}
          <button
            className="arrow-btn"
            onClick={() => handleAction("accept")}
            disabled={!!action}
          >
            ←
          </button>


          {/* MATCH CARD */}
          <div
            className={`match-card ${
              action === "accept"
                ? "accept-animation"
                : action === "reject"
                ? "reject-animation"
                : ""
            }`}
          >

            <div className="match-header">

              <div className="profile-initials">
  {profile.name
    .split(" ")
    .map((name) => name[0])
    .join("")
    .slice(0, 2)
    .toUpperCase()}
</div>

              <h2>{profile.name}</h2>

              <p className="match-meta">
  {profile.college} • {profile.year} Year
</p>

            </div>


            <div className="skills-section">

              <h4>Teaches</h4>

              <div className="skills-row">
                {profile.theyTeachMe.map((skill) => (
  <span key={skill.id}>
    {skill.name}
  </span>
))}
              </div>


              <h4>Wants</h4>

              <div className="skills-row wants">
                {profile.theyLearnFromMe.map((skill) => (
  <span key={skill.id}>
    {skill.name}
  </span>
))}
              </div>

            </div>


            <div className="rating">
              ★★★★★ {profile.rating}
            </div>


            <div className="match-score">
              {profile.matchPercentage}% Match
            </div>


            {/* GREEN FEEDBACK */}
            {action === "accept" && (
              <div className="match-feedback accept-feedback">
                Exchange request sent
              </div>
            )}

          </div>


          {/* RIGHT / SKIP */}
          <button
            className="arrow-btn"
            onClick={() => handleAction("reject")}
            disabled={!!action}
          >
            →
          </button>

        </div>
               {/* with this: */}
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

      </section>
    </>
  );
}

export default Matches;