import DashboardNavbar from "../components/DashboardNavbar";
import "../css/leaderboard.css";
import { Repeat } from "lucide-react";
import { useEffect, useState } from "react";
import { getLeaderboard } from "../api/leaderboard";
import {
  Lock,
  Check,
} from "lucide-react";
import Loading from "../components/loading";

function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [level, setLevel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [achievements, setAchievements] = useState([]);

  const isLoggedIn = !!localStorage.getItem("token");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const data = await getLeaderboard();

        console.log("LEADERBOARD:", data);

        setLeaderboard(data.leaderboard || []);
        setCurrentUser(data.currentUser || null);
        setLevel(data.level);
        setAchievements(data.achievements || []);
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <DashboardNavbar />

      <section className="leaderboard-page">

        <p className="leaderboard-subtitle">
          Top Exchangers
        </p>

        {/* PODIUM */}

        {leaderboard.length >= 3 && (
          <>
            <div className="podium">

              {/* SECOND */}

              <div className="podium-user second">

                <div className="second-avatar">
                  {leaderboard[1].name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="leaderboard-name">
                  {leaderboard[1].name}
                </div>

                <div className="podium-score">
                  {leaderboard[1].monthlyExchanges}
                  <Repeat size={16} />
                </div>

                <div className="podium-base second-place">
                  2
                </div>

              </div>


              {/* FIRST */}

              <div className="podium-user first">

                <div className="first-avatar">
                  {leaderboard[0].name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="leaderboard-name">
                  {leaderboard[0].name}
                </div>

                <div className="podium-score">
                  {leaderboard[0].monthlyExchanges}
                  <Repeat size={16} />
                </div>

                <div className="podium-base first-place">
                  1
                </div>

              </div>


              {/* THIRD */}

              <div className="podium-user third">

                <div className="third-avatar">
                  {leaderboard[2].name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <div className="leaderboard-name">
                  {leaderboard[2].name}
                </div>

                <div className="podium-score">
                  {leaderboard[2].monthlyExchanges}
                  <Repeat size={16} />
                </div>

                <div className="podium-base third-place">
                  3
                </div>

              </div>

            </div>

            <div className="podium-floor"></div>
          </>
        )}


        {/* RANKINGS */}

        <div className="leaderboard-card">

          {leaderboard.slice(3).map((user) => (

            <div
              className="ranking-row"
              key={user.id}
            >

              <div className="ranking-left">

                <span className="rank-number">
                  {user.rank}
                </span>

                <div className="rank-avatar">
                  {user.name
                    .split(" ")
                    .map((name) => name[0])
                    .join("")
                    .slice(0, 2)
                    .toUpperCase()}
                </div>

                <span>
                  {user.name}
                </span>

              </div>

              <div className="ranking-right">

                <span>
                  {user.monthlyExchanges}
                </span>

                <Repeat size={18} />

              </div>

            </div>

          ))}

        </div>


        {/* ACHIEVEMENTS */}

        <h3 className="achievement-heading">
          ACHIEVEMENTS · LEVEL {isLoggedIn ? (level ?? "—") : "—"}
        </h3>


        {/* XP CARD */}

        <div className="xp-card">

          <div className="xp-ring">

            <div className="xp-ring-inner">

              <span>
                {isLoggedIn ? (level ?? "—") : "—"}
              </span>

            </div>

          </div>


          <div className="xp-content">

            <h2>
              {isLoggedIn ? "Practitioner" : "SkillDeal Member"}
            </h2>

            <p>
              {isLoggedIn
                ? `${currentUser?.xp ?? 0} / 250 xp to Specialist`
                : "Create an account to earn XP and unlock achievements"}
            </p>

          </div>

        </div>


        {/* ACHIEVEMENT LIST */}

        <div className="achievement-list">

          {achievements.map((achievement) => {

            /*
             * A guest can NEVER have an unlocked achievement.
             * Logged-in users use the normal achievement logic.
             */

            const isUnlocked =
              isLoggedIn &&
              (
                achievement.unlocked ||
                achievement.progress >= achievement.target
              );


            const progress = isLoggedIn
              ? achievement.progress
              : 0;


            return (

              <div
                key={achievement.id}
                className={`achievement-row ${
                  isUnlocked
                    ? "unlocked"
                    : "locked-achievement"
                }`}
              >

                {/* LEFT SIDE */}

                <div
                  className={`achievement-left ${
                    isUnlocked
                      ? ""
                      : "locked"
                  }`}
                >

                  <div className="achievement-icon-box">

                    {isUnlocked ? (
                      <Check size={24} />
                    ) : (
                      <Lock size={24} />
                    )}

                  </div>


                  <span>
                    {achievement.name}
                  </span>


                  {!isUnlocked &&
                    achievement.target > 0 && (
                      <span className="progress-count">
                        {progress}/{achievement.target}
                      </span>
                    )}

                </div>


                {/* RIGHT SIDE */}

                <div
                  className={`achievement-right ${
                    isUnlocked
                      ? "completed"
                      : "locked"
                  }`}
                >

                  {isUnlocked ? (

                    <>
                      <Check size={18} />

                      <span>
                        +{achievement.xpReward} xp
                      </span>
                    </>

                  ) : (

                    <>
                      <Lock size={18} />

                      <span>
                        +{achievement.xpReward} xp
                      </span>
                    </>

                  )}

                </div>

              </div>

            );

          })}

        </div>

      </section>
    </>
  );
}

export default Leaderboard;