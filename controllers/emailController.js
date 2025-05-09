const fs = require("fs");
const axios = require("axios");
const { simpleParser } = require("mailparser");
const path = require("path");
const dns = require("dns");
const validator = require("validator");
// Helper: Resolve MX records for domain
function resolveMxAsync(domain) {
  return new Promise((resolve, reject) => {
    dns.resolveMx(domain, (err, addresses) => {
      if (err) reject(err);
      else resolve(addresses);
    });
  });
}

// Combined email validation
async function isValidEmail(email) {
  if (!validator.isEmail(email)) {
    return { valid: false, reason: "Invalid email format" };
  }

  const domain = email.split("@")[1];
  try {
    const mxRecords = await resolveMxAsync(domain);
    if (!mxRecords || mxRecords.length === 0) {
      return { valid: false, reason: "Email domain has no MX records" };
    }
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: "Error resolving domain" };
  }
}

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
    const emailCheck = await isValidEmail(fromEmail);

    if (!emailCheck.valid) {
      fs.unlinkSync(filePath);
      return res
        .status(400)
        .json({ error: `Invalid sender email: ${emailCheck.reason}` });
    }

    const result = await sendToPythonBackend(emailText);

    fs.unlinkSync(filePath);

    return res.json({ ...result, from: fromEmail });
  } catch (error) {
    console.error("Error processing email:", error);
    return res.status(500).json({ error: "Error processing the email file" });
  }
};

module.exports = { uploadEmail };
