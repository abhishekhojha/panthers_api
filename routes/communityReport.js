const express = require("express");
const router = express.Router();
const {
  reportPhishingUrl,
  getReports,
  updateReportStatus,
} = require("../controllers/communityReportController");
const { verifyToken } = require("../middlewares/auth");

router.post("/report", verifyToken, reportPhishingUrl);
router.get("/", verifyToken, getReports); 
// router.patch("/:id", verifyToken, updateReportStatus); 

module.exports = router;
