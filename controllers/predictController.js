const axios = require("axios");
const History = require("../models/History");

const predictUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Make the request to Python service
    const response = await axios.post(
      "https://plaintiff-settled-dh-madonna.trycloudflare.com/predict",
      { url }
    );
    // Encrypt the URL before saving
    const encryptedUrl = new History().encryptUrl(url);
    console.log(response.data);
    const { prediction, confidence } = response.data;
    // Save history with encrypted URL
    const data = await History.create({
      userId: req.user.id,
      type: "url",
      encryptedUrl: encryptedUrl, // Save only encrypted URL
      isPhishing: prediction == "phishing",
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
    // Send URL to Python ML API
    const response = await axios.post(
      "https://plaintiff-settled-dh-madonna.trycloudflare.com/predict",
      { url }
    );

    const { prediction, confidence } = response.data;
    console.log("Prediction:", prediction);

    // Encrypt the URL before saving
    const encryptedUrl = new History().encryptUrl(url);

    // Save history with deviceID instead of userId
    const data = await History.create({
      deviceID,
      type: "url",
      encryptedUrl,
      isPhishing: prediction == "phishing",
    });
    console.log("Data saved:", data);

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
