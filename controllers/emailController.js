const fs = require("fs");
const axios = require("axios");
const { simpleParser } = require("mailparser"); 

const extractEmailContent = (filePath) => {
  return new Promise((resolve, reject) => {
    simpleParser(fs.createReadStream(filePath), (err, parsed) => {
      if (err) {
        return reject(err);
      }
      resolve(parsed.text); 
    });
  });
};

const sendToPythonBackend = async (emailContent) => {
  try {
    const response = await axios.post("http://localhost:6000/predict", {
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

  try {
    const emailContent = await extractEmailContent(filePath);

    const result = await sendToPythonBackend(emailContent);
    fs.unlinkSync(filePath);

    return res.json(result);
  } catch (error) {
    console.error("Error processing email:", error);
    return res.status(500).json({ error: "Error processing the email file" });
  }
};

module.exports = { uploadEmail };
