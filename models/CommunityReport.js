const mongoose = require("mongoose");

const communityReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    url: { type: String, required: true },
    reason: { type: String }, // Optional field for user to mention why
    status: {
      type: String,
      enum: ["pending", "reviewed", "flagged"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CommunityReport", communityReportSchema);
