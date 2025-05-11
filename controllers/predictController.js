const axios = require("axios");
const History = require("../models/History");
const fs = require("fs");
const path = require("path");
const { checkUrlWithGoogleSafeBrowsing } = require("./checkURLGoogle");
const safeDomains = JSON.parse(
  fs.readFileSync(path.resolve(__dirname, "safe_domains.json"), "utf-8")
).safe_domains;
const CommunityReport = require("../models/CommunityReport");

const predictUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    const getDomain = (url) => {
      // const domain = new URL(url).hostname.replace(/^www\./, ""); // Normalize to remove 'www'
      // return domain;
      const hostname = new URL(url).hostname;
      const parts = hostname.split(".");

      if (parts.length > 2) {
        return parts.slice(-2).join(".");
      }
      return hostname;
    };

    // Check if the domain is in the safe list
    const domain = getDomain(url);

    if (safeDomains.includes(domain)) {
      // If domain is safe, skip model prediction and return safe
      const encryptedUrl = new History().encryptUrl(url);
      const data = await History.create({
        userId: req.user.id,
        type: "url",
        encryptedUrl: encryptedUrl, // Save only encrypted URL
        isPhishing: false, // Mark as safe
      });
      return res.json(data);
    }
    const latestReport = await CommunityReport.findOne({ url })
      .sort({ createdAt: -1 }) // get the latest entry
      .exec();

    if (latestReport && latestReport.status === "validated") {
      const encryptedUrl = new History().encryptUrl(url);
      const data = await History.create({
        userId: req.user.id,
        type: "url",
        encryptedUrl,
        isPhishing: latestReport.isPhishing,
      });
      return res.json(data);
    }
    const googleCheckResult = await checkUrlWithGoogleSafeBrowsing(url);

    if (googleCheckResult == "phishing") {
      const encryptedUrl = new History().encryptUrl(url);
      const data = await History.create({
        userId: req.user.id,
        type: "url",
        encryptedUrl,
        isPhishing: true,
      });
      return res.json(data);
    }

    // Helper function to make prediction request
    const checkWithModel = async (urlToCheck) => {
      try {
        const response = await axios.post(
          "https://perl-piano-belkin-mega.trycloudflare.com/predict",
          { url: urlToCheck }
        );
        return response.data.prediction; // Assuming prediction is in `prediction` field
      } catch (error) {
        console.error("Error checking URL:", error.message);
        return "error"; // In case of network or API failure
      }
    };

    let withoutWWW = url.replace(/^www\./, "");
    if (!withoutWWW.match(/^https?:\/\//)) {
      withoutWWW = "https://" + withoutWWW;
    }

    let withWWW = withoutWWW.replace(/^https?:\/\//, ""); // Remove protocol
    withWWW = "https://www." + withWWW; // Add 'www.' prefix

    // Check both versions of the URL
    const resultWithoutWWW = await checkWithModel(withoutWWW);
    const resultWithWWW = await checkWithModel(withWWW);

    // If both are phishing, mark as phishing
    const finalPrediction =
      resultWithoutWWW == "phishing" && resultWithWWW == "phishing"
        ? "phishing"
        : "safe";

    // Encrypt the URL before saving
    const encryptedUrl = new History().encryptUrl(url);

    // Save history with encrypted URL
    const data = await History.create({
      userId: req.user.id,
      type: "url",
      encryptedUrl: encryptedUrl, // Save only encrypted URL
      isPhishing: finalPrediction == "phishing",
    });

    // Return prediction response
    res.json(data);
  } catch (error) {
    console.error("Prediction API Error:", error.message);
    res.status(500).json({ error: "Prediction service unavailable" });
  }
};

const predictUrlForExtension = async (req, res) => {
  const { url, deviceID } = req.body;

  if (!url || !deviceID) {
    return res.status(400).json({ error: "URL and deviceID are required" });
  }

  try {
    const getDomain = (url) => {
      // const domain = new URL(url).hostname.replace(/^www\./, ""); // Normalize to remove 'www'
      // return domain;
      const hostname = new URL(url).hostname;
      const parts = hostname.split(".");

      if (parts.length > 2) {
        return parts.slice(-2).join(".");
      }
      return hostname;
    };

    // Check if the domain is in the safe list
    const domain = getDomain(url);

    if (safeDomains.includes(domain)) {
      // If domain is safe, skip model prediction and return safe
      const encryptedUrl = new History().encryptUrl(url);
      const data = await History.create({
        deviceID,
        type: "url",
        encryptedUrl: encryptedUrl, // Save only encrypted URL
        isPhishing: false, // Mark as safe
      });
      return res.json({
        message: "Prediction saved",
        data,
      });
    }
    const latestReport = await CommunityReport.findOne({ url })
      .sort({ createdAt: -1 }) // get the latest entry
      .exec();

    if (latestReport && latestReport.status === "validated") {
      const encryptedUrl = new History().encryptUrl(url);
      const data = await History.create({
        deviceID,
        type: "url",
        encryptedUrl,
        isPhishing: latestReport.isPhishing,
      });
      return res.json({
        message: "Prediction saved",
        data,
      });
    }
    const googleCheckResult = await checkUrlWithGoogleSafeBrowsing(url);

    if (googleCheckResult == "phishing") {
      const encryptedUrl = new History().encryptUrl(url);
      const data = await History.create({
        deviceID,
        type: "url",
        encryptedUrl,
        isPhishing: true,
      });
      return res.json({
        message: "Prediction saved",
        data,
      });
    }

    // Helper function to make prediction request
    const checkWithModel = async (urlToCheck) => {
      try {
        const response = await axios.post(
          "https://perl-piano-belkin-mega.trycloudflare.com/predict",
          { url: urlToCheck }
        );
        return response.data.prediction; // Assuming prediction is in `prediction` field
      } catch (error) {
        console.error("Error checking URL:", error.message);
        return "error"; // In case of network or API failure
      }
    };

    let withoutWWW = url.replace(/^www\./, "");
    if (!withoutWWW.match(/^https?:\/\//)) {
      withoutWWW = "https://" + withoutWWW;
    }

    let withWWW = withoutWWW.replace(/^https?:\/\//, ""); // Remove protocol
    withWWW = "https://www." + withWWW; // Add 'www.' prefix

    // Check both versions of the URL
    const resultWithoutWWW = await checkWithModel(withoutWWW);
    const resultWithWWW = await checkWithModel(withWWW);

    // If both are phishing, mark as phishing
    const finalPrediction =
      resultWithoutWWW == "phishing" && resultWithWWW == "phishing"
        ? "phishing"
        : "safe";

    // Encrypt the URL before saving
    const encryptedUrl = new History().encryptUrl(url);

    // Save history with deviceID instead of userId
    const data = await History.create({
      deviceID,
      type: "url",
      encryptedUrl,
      isPhishing: finalPrediction == "phishing",
    });

    return res.json({
      message: "Prediction saved",
      data,
    });
  } catch (error) {
    console.error("Prediction API Error:", error.message);
    res.status(500).json({ error: "Prediction service unavailable" });
  }
};

module.exports = { predictUrl, predictUrlForExtension };
