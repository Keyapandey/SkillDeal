const express= require("express");
const cors= require("cors");
const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const skillRoutes = require("./routes/skill.routes");
const exchangeRoutes = require("./routes/exchange.routes");
const matchRoutes = require("./routes/match.routes");
const messageRoutes = require("./routes/message.routes");
const leaderboardRoutes = require("./routes/leaderboard.routes");
const profileRoutes = require("./routes/profile.routes");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api", skillRoutes);
app.use("/api/exchanges", exchangeRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/profile", profileRoutes);

app.get("/",(req,res)=>{
    res.send("Skilldeal backend is running");
});

module.exports=app;
