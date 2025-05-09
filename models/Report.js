const mongoose = require("mongoose");

const communityReportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
  deviceID: { type: String, unique: true, default: null },
  url: { type: String, required: true },
  verdict: { type: String, enum: ["phishing", "safe"], required: true },
  reason: { type: String }, 
  status: {
    type: String,
    enum: ["pending", "validated", "rejected"],
    default: "pending",
  },
},{timestamps: true});

const CommunityReport = mongoose.model(
  "CommunityReport",
  communityReportSchema
);
module.exports = CommunityReport;
