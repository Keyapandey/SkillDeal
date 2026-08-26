const express = require("express");

const {sendMessage,getMessages,getConversations} = require("../controllers/message.controller");

const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/", authMiddleware, sendMessage);
router.get("/conversations", authMiddleware, getConversations);
router.get("/:userId", authMiddleware, getMessages);


module.exports = router;