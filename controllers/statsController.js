const History = require("../models/History");
const CommunityReport = require("../models/CommunityReport");
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalScanned = await History.countDocuments();
    const threatsDetected = await History.countDocuments({
      isPhishing: true,
    });
    const safeUrls = await History.countDocuments({
      isPhishing: false,
    });
    const communityReports = await CommunityReport.countDocuments();

    res.json({
      scannedUrls: totalScanned,
      threatsDetected,
      safeUrls,
      communityReports,
    });
  } catch (error) {
    console.error("Stats fetch error:", error);
    res.status(500).json({ error: "Failed to fetch statistics" });
  }
};
