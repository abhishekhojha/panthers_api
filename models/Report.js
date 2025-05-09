const mongoose = require("mongoose");

const communityReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  url: { type: String, required: true },
  verdict: { type: String, enum: ["phishing", "safe"], required: true },
  reason: { type: String }, 
  status: {
    type: String,
    enum: ["pending", "validated", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

const CommunityReport = mongoose.model(
  "CommunityReport",
  communityReportSchema
);
module.exports = CommunityReport;
