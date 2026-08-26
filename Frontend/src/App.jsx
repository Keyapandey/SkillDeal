import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Explore from "./pages/Explore";
import Matches from "./pages/Matches";
import Messages from "./pages/Messages";
import Leaderboard from "./pages/Leaderboard";
import Profile from "./pages/Profile";

function App() {
  return (
    <Routes>

      <Route path="/" element={<Home />} />

      <Route path="/explore" element={<Explore />} />

      <Route path="/matches" element={<Matches />} />

      <Route path="/messages" element={<Messages />} />

      <Route path="/leaderboard" element={<Leaderboard />} />

      <Route path="/profile" element={<Profile />} />

    </Routes>
  );
}

export default App;