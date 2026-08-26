import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

import SignupModal from "../components/SignupModal";
import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import StudentScroller from "../components/StudentScroller";
import HowItWorks from "../components/HowItWorks";
import LoginModal from "../components/LoginModal";
import DashboardHome from "../components/DashboardHome";

import { loginUser, registerUser} from "../api/auth";

function Home() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(
    !!localStorage.getItem("token")
  );

  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  useEffect(() => {

  if (location.state?.openLogin) {
    setShowLogin(true);
  }

  if (location.state?.openSignup) {
    setShowSignup(true);
  }

}, [location.state]);

  const handleLogin = async (email, password) => {
    try {
      const data = await loginUser(email, password);

      localStorage.setItem("token", data.token);

      setIsLoggedIn(true);
      setShowLogin(false);

    } catch (error) {
      alert(error.message);
    }
  };

  const handleSignup = async (userData) => {
  try {
    const data = await registerUser(userData);

    alert(data.message);

    setShowSignup(false);

  } catch (error) {
    alert(error.message);
  }
};


  if (isLoggedIn) {
    return <DashboardHome />;
  }


  return (
    <>
      <Navbar
  onLoginClick={() => setShowLogin(true)}
  onSignupClick={() => setShowSignup(true)}
/>

      <Hero
        onSignupClick={() => setShowSignup(true)}
      />

      <StudentScroller />

      <HowItWorks />


      {showLogin && (
        <LoginModal
          onClose={() => setShowLogin(false)}
          onLogin={handleLogin}
        />
      )}


      {showSignup && (
        <SignupModal
  onClose={() => setShowSignup(false)}
  onSignup={handleSignup}
/>
      )}
    </>
  );
}

export default Home;