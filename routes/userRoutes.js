const express = require("express");
const { getMe, getHistory, getStats } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.get("/me", verifyToken, getMe);
router.get("/history", verifyToken, getHistory);
router.get("/", verifyToken, getStats);
module.exports = router;
