import DashboardNavbar from "./DashboardNavbar";
import DashboardStats from "./DashboardStats";
import ActiveExchanges from "./ActiveExchanges";
import "../css/dashboardHome.css";

function DashboardHome() {
  return (
    <>
      <DashboardNavbar />

      {/* HERO / SKILL EXCHANGE */}
      <section className="dashboard-hero">

        {/* floating skill tags */}
        <span className="skill-pill pill-1">Photoshop</span>
        <span className="skill-pill pill-2">UI Design</span>
        <span className="skill-pill pill-3">Guitar</span>
        <span className="skill-pill pill-4">Excel</span>
        <span className="skill-pill pill-5">Python</span>
        <span className="skill-pill pill-6">Public Speaking</span>
        <span className="skill-pill pill-7">Canva</span>

        <div className="dashboard-hero-content">

          <h1>Where skills become currency</h1>

          <p className="dashboard-hero-subtitle">
            5 exchanges closed this week
            <span>|</span>
            120+ skills on SkillDeal
          </p>

          <div className="skill-exchange-box">

            <div className="skill-choice offer">
              <span>YOU OFFER</span>
              <p>Add a skill you can teach</p>
            </div>

            <div className="exchange-symbol">
              ⇄
            </div>

            <div className="skill-choice want">
              <span>YOU WANT</span>
              <p>Add a skill you'd love to learn</p>
            </div>

          </div>

        </div>
      </section>

      {/* STATS */}
      <DashboardStats />

      {/* DEAL OF THE DAY */}
      <section className="deal-section">

        <h2>DEAL OF THE DAY</h2>

        <div className="deal-card">

          <div className="deal-avatar">
            PS
          </div>

          <div className="deal-content">
            <p>
              <strong>Priya Sharma</strong> teaches Photoshop
              <span className="deal-arrow"> ⇄ </span>
              wants Guitar lessons
            </p>

            <span>
              This is the kind of match waiting for you
            </span>
          </div>

        </div>

      </section>

      {/* ONGOING EXCHANGES */}
      <ActiveExchanges />

    </>
  );
}

export default DashboardHome;