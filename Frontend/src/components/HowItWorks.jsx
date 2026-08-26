import "../css/howItWorks.css";
import "../css/stats.css";

function HowItWorks() {
    return (
  <section className="how-section">

    <h2 className="how-heading">
      How It Works?
    </h2>

    <div className="how-container">

      <div className="how-card">
        <div className="step-circle">1</div>

        <h3>Log In</h3>

        <p>
          Create your account and build your profile.
        </p>
      </div>

      <div className="how-card">
        <div className="step-circle">2</div>

        <h3>Explore to Find Your Match</h3>

        <p>
          Find students who can teach what you want to learn.
        </p>
      </div>

      <div className="how-card">
        <div className="step-circle">3</div>

        <h3>Exchange Your Skills</h3>

        <p>
          Teach one topic and learn another without spending money.
        </p>
      </div>

    </div>

    <div className="stats-banner">

      <div className="stat-item">
        <h2>12000+</h2>
        <p>Students</p>
      </div>

      <div className="stat-item">
        <h2>400+</h2>
        <p>Skills</p>
      </div>

      <div className="stat-item">
        <h2>850+</h2>
        <p>Exchanges</p>
      </div>

    </div>

  </section>
);
}
  export default HowItWorks;