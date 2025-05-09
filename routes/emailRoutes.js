// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const { uploadEmail } = require('../controllers/emailController'); // Import the controller

// Define the route for email file upload
router.post('/upload-email', upload.single('file'), uploadEmail);

module.exports = router;