import { useEffect, useState } from "react";
import { getMyExchanges } from "../api/exchange";
import { getProfile } from "../api/profile";
import "../css/dashboardStats.css";
import {
  ArrowUpRight,
  BookOpen,
  GraduationCap,
  Flame
} from "lucide-react";

import "../css/dashboardStats.css";

function DashboardStats() {
  const [exchangeCount, setExchangeCount] = useState(0);
  const [skillsLearned, setSkillsLearned] = useState(0);
  const [skillsTaught, setSkillsTaught] = useState(0);
  const [streak, setStreak] = useState(0);
  useEffect(() => {
  const fetchExchanges = async () => {
    try {
      const data = await getMyExchanges();

      const exchanges = data.exchanges || [];

      // Total exchanges
      setExchangeCount(exchanges.length);

      // Only COMPLETED exchanges count as taught/learned
      const completedExchanges = exchanges.filter(
        (exchange) => exchange.status === "COMPLETED"
      );

      setSkillsLearned(completedExchanges.length);
      setSkillsTaught(completedExchanges.length);

      const profileData = await getProfile();

      setStreak(profileData.profile.streak);

    } catch (error) {
      console.error("Failed to fetch exchanges:", error);
    }
  };

  fetchExchanges();
}, []);
  return (
    <section className="dashboard-stats-section">

      <div className="dashboard-card">
        <h2>{exchangeCount}</h2>
        <ArrowUpRight className="card-icon" />
        <p>Exchanges</p>
         {/* <span className="card-change">+3 this week</span> */}
      </div>

      <div className="dashboard-card">
        <h2>{skillsLearned}</h2>
        <BookOpen className="card-icon" />
        <p>Skills Learned</p>
        {/* <span className="card-change">+1 this week</span> */}
      </div>

      <div className="dashboard-card">
        <h2>{skillsTaught}</h2>
        <GraduationCap className="card-icon" />
        <p>Skills Taught</p>
        {/* <span className="card-change">Same as last week</span> */}
      </div>

      <div className="dashboard-card">
        <h2>{streak}</h2>
        <Flame className="card-icon" />
        <p>Day Streak</p>
        {/* <span className="card-change">Personal best!</span> */}
      </div>

    </section>
  );
}

export default DashboardStats;