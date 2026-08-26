import { useState } from "react";
import "../css/loginModal.css";

function LoginModal({ onClose, onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = () => {
    onLogin(email, password);
  };

  return (
    <div className="modal-overlay">

      <div className="login-modal">

        <button
          className="close-btn"
          onClick={onClose}
        >
          ×
        </button>

        <h2>Welcome Back</h2>

        <p className="login-subtitle">
          Continue your skill exchange journey.
        </p>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="login-submit"
          onClick={handleSubmit}
        >
          Log In
        </button>

      </div>

    </div>
  );
}

export default LoginModal;