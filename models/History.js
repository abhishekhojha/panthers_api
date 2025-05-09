const mongoose = require("mongoose");
const crypto = require("crypto");

const historySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: { type: String, enum: ["url", "email"], required: true },
    encryptedUrl: { type: String, required: true }, // Store encrypted URL only
    isPhishing: { type: Boolean, required: true },
  },
  { timestamps: true }
);

// Method to encrypt URL
historySchema.methods.encryptUrl = function (url) {
  const cipher = crypto.createCipheriv(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_IV
  );
  let encrypted = cipher.update(url, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
};

// Method to decrypt URL
historySchema.methods.decryptUrl = function () {
  const decipher = crypto.createDecipheriv(
    "aes-256-cbc",
    process.env.ENCRYPTION_KEY,
    process.env.ENCRYPTION_IV
  );
  let decrypted = decipher.update(this.encryptedUrl, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};

const History = mongoose.model("History", historySchema);

module.exports = History;
