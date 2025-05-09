const History = require("../models/history");

const predictUrl = async (req, res) => {
  const { url } = req.body;

  if (!url) {
    return res.status(400).json({ error: "URL is required" });
  }

  try {
    // Make the request to Python service
    const response = await axios.post("http://localhost:6000/predict", { url });

    // Encrypt the URL before saving
    const encryptedUrl = new History().encryptUrl(url);

    // Save history with encrypted URL
    await History.create({
      userId: req.user._id,
      type: "url",
      encryptedUrl: encryptedUrl, // Save only encrypted URL
      isPhishing: response.data.isPhishing,
    });

    // Return prediction response
    res.json(response.data);
  } catch (error) {
    console.error("Prediction API Error:", error.message);
    res.status(500).json({ error: "Prediction service unavailable" });
  }
};
const predictEmail = async (req, res) => {
  const { sender, subject, body } = req.body;

  if (!sender || !subject || !body) {
    return res.status(400).json({ error: "Sender, subject, and body are required" });
  }

  try {
    // Call the Python service for phishing detection
    const response = await axios.post("http://localhost:5000/predict-email", { sender, subject, body });

    // Encrypt email body before saving (optional)
    const encryptedBody = new History().encryptUrl(body);

    // Save the result to history
    await History.create({
      userId: req.user._id,
      type: 'email',
      encryptedUrl: encryptedBody, // Encrypted email content (or metadata)
      isPhishing: response.data.isPhishing,
    });

    // Return prediction response
    res.json(response.data);
  } catch (error) {
    console.error("Prediction API Error:", error.message);
    res.status(500).json({ error: "Prediction service unavailable" });
  }
};


module.exports = { predictUrl };
