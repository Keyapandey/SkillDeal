const express = require("express");
const { getMatches,getGuestMatches } = require("../controllers/match.controller");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.get("/", authMiddleware, getMatches);
router.get("/guest", getGuestMatches);

module.exports = router;