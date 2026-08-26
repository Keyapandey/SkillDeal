import "../css/authPrompt.css";

function AuthPrompt({
  onClose,
  onGetStarted,
  onLogin
}) {
  return (
    <div
      className="auth-prompt-overlay"
      onClick={onClose}
    >
      <div
        className="auth-prompt"
        onClick={(e) => e.stopPropagation()}
      >

        <button
          className="auth-prompt-close"
          onClick={onClose}
        >
          ×
        </button>

        <div className="auth-prompt-icon">
          ✦
        </div>

        <h2>
          Create an account to start your journey on SkillDeal
        </h2>

        <p>
          Connect with learners, exchange skills, and start
          learning from people like you.
        </p>

        <button
          className="auth-prompt-primary"
          onClick={onGetStarted}
        >
          Get Started
        </button>

        <button
          className="auth-prompt-login"
          onClick={onLogin}
        >
          Already have an account? Log In
        </button>

      </div>
    </div>
  );
}

export default AuthPrompt;