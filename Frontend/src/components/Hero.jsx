import "../css/hero.css";

function Hero({ onSignupClick }) {
  const skills = [
    { name: "Figma", className: "skill-1" },
    { name: "UI Design", className: "skill-2" },
    { name: "Guitar", className: "skill-3" },
    { name: "Chess", className: "skill-4" },
    { name: "Excel", className: "skill-5" },
    { name: "Python", className: "skill-6" }
  ];

  return (
    <section className="hero">

      {/* Floating skill names */}
      <div className="hero-skills">
        {skills.map((skill) => (
          <span
            key={skill.name}
            className={`floating-skill ${skill.className}`}
          >
            {skill.name}
          </span>
        ))}
      </div>

      <h1>
        Skill for Skill
      </h1>

      <p className="hero-tagline">
        Teach one topic. Learn another.
      </p>

      <p className="hero-subtitle">
        No money involved.
      </p>

      <button onClick={onSignupClick}>
        Get Started
      </button>

    </section>
  );
}

export default Hero;