const fs = require("fs");
const axios = require("axios");
const { simpleParser } = require("mailparser");

const extractEmailContent = (filePath) => {
  return new Promise((resolve, reject) => {
    simpleParser(fs.createReadStream(filePath), (err, parsed) => {
      if (err) {
        return reject(err);
      }

      const emailText = parsed.text || "";
      const fromEmail = parsed.from?.value?.[0]?.address || "Unknown";

      resolve({ emailText, fromEmail });
    });
  });
};

const sendToPythonBackend = async (emailContent) => {
  try {
    const response = await axios.post("http://localhost:5001/predict", {
      text: emailContent,
    });
    return response.data;
  } catch (error) {
    console.error("Error sending data to Python backend:", error);
    throw error;
  }
};

const uploadEmail = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const filePath = req.file.path;
  const fileExtension = path.extname(req.file.originalname).toLowerCase();

  // ✅ Validate .eml extension
  if (fileExtension !== ".eml") {
    fs.unlinkSync(filePath); // Clean up the file if invalid
    return res.status(400).json({ error: "Only .eml files are allowed" });
  }

  try {
    const { emailText, fromEmail } = await extractEmailContent(filePath);

    const result = await sendToPythonBackend(emailText);

    fs.unlinkSync(filePath);

    return res.json({ ...result, from: fromEmail });
  } catch (error) {
    console.error("Error processing email:", error);
    return res.status(500).json({ error: "Error processing the email file" });
  }
};

module.exports = { uploadEmail };
