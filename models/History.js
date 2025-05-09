const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, enum: ["url", "email"], required: true },
  input: { type: String, required: true },
  isPhishing: { type: Boolean, required: true },
},{timestamps: true});

const History = mongoose.model("History", historySchema);
module.exports = History;
