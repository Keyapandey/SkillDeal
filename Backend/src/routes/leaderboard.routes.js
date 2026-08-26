const express = require("express");

const router = express.Router();

const {
    getLeaderboard
} = require("../controllers/leaderboard.controller");

const authMiddleware = require("../middleware/auth.middleware");

router.get("/", (req, res, next) => {

    const authHeader = req.headers.authorization;

    // Guest user
    if (!authHeader) {
        req.isGuest = true;
        return next();
    }

    // Logged-in user
    authMiddleware(req, res, next);

}, getLeaderboard);

module.exports = router;