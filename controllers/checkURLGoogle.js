const axios = require("axios");
const dotenv = require("dotenv");
dotenv.config();
const API_KEY = process.env.SAFE_BROWSING_API_KEY;

async function checkUrlWithGoogleSafeBrowsing(urlToCheck) {
  try {
    const body = {
      client: {
        clientId: "phishshield",
        clientVersion: "1.0.0"
      },
      threatInfo: {
        threatTypes: [
          "MALWARE",
          "SOCIAL_ENGINEERING",
          "UNWANTED_SOFTWARE",
          "POTENTIALLY_HARMFUL_APPLICATION"
        ],
        platformTypes: ["ANY_PLATFORM"],
        threatEntryTypes: ["URL"],
        threatEntries: [{ url: urlToCheck }]
      }
    };

    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${API_KEY}`,
      body,
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );
    console.log("Google Safe Browsing response:", response.data);
    
    return response.data && response.data.matches ? "phishing" : "safe";
  } catch (error) {
    console.error("Google Safe Browsing error:", error.response?.data || error.message);
    return "error";
  }
}

module.exports = { checkUrlWithGoogleSafeBrowsing }