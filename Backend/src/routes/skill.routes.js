const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { addSkill, deleteSkill,getUserSkills,getAllSkills,searchUsersBySkill,getAllUsers } = require("../controllers/skill.controller");

const router = express.Router();

router.post("/skills", authMiddleware, addSkill);
router.delete("/skills", authMiddleware, deleteSkill);
router.get("/skills", authMiddleware, getUserSkills);
router.get("/skills/all", getAllSkills);
router.get("/skills/search", searchUsersBySkill);
router.get("/skills/users", getAllUsers);

module.exports = router;