const express = require("express");
const { getStats } = require("../controllers/statsController");

const router = express.Router();
router.get("/stats", verifyToken, getStats);
module.exports = router;
