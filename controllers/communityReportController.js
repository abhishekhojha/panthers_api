const CommunityReport = require("../models/CommunityReport");

exports.reportPhishingUrl = async (req, res) => {
  const { url, reason, isPhishing } = req.body;

  if (!url) return res.status(400).json({ error: "URL is required" });

  try {
    const report = new CommunityReport({
      userId: req.user.id,
      url,
      reason,
      isPhishing
    });

    await report.save();
    res.status(201).json({ message: "Report submitted", report });
  } catch (error) {
    res.status(500).json({ error: "Failed to submit report" });
  }
};

exports.getReports = async (req, res) => {
  try {
    const reports = await CommunityReport.find().populate("userId", "email");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
};

exports.updateReportStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const report = await CommunityReport.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: "Failed to update report status" });
  }
};
