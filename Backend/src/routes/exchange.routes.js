const express = require("express");
const { sendExchangeRequest, 
    getIncomingRequests,
    getSentRequests,
    acceptExchangeRequest,
    declineExchangeRequest,
    getMyExchanges,
    scheduleExchange,
    startSession,
    endSession,
    completeExchange} = require("../controllers/exchange.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/request", authMiddleware, sendExchangeRequest);
router.get("/requests", authMiddleware, getIncomingRequests);
router.patch("/requests/:id/accept", authMiddleware, acceptExchangeRequest);
router.patch("/requests/:id/decline",authMiddleware,declineExchangeRequest);
router.get("/my", authMiddleware, getMyExchanges);
router.get("/sent", authMiddleware, getSentRequests);
router.patch("/:id/schedule", authMiddleware, scheduleExchange);
router.patch("/:id/start-session", authMiddleware, startSession);
router.patch("/:id/end-session", authMiddleware, endSession);
router.patch("/:id/complete",authMiddleware,completeExchange);

module.exports = router;