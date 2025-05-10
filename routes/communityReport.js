const express = require("express");
const router = express.Router();
const {
  reportPhishingUrl,
  getReports,
  updateReportStatus,
} = require("../controllers/communityReportController");
const { verifyToken, isAdmin } = require("../middlewares/auth");

router.post("/report", verifyToken, reportPhishingUrl);
router.get("/", verifyToken, getReports);
router.patch("/:id", verifyToken, isAdmin, updateReportStatus);

module.exports = router;
