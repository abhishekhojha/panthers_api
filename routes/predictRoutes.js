// routes/emailRoutes.js
const express = require('express');
const router = express.Router();
const { uploadEmail } = require('../controllers/emailController'); 
const { predictUrl } = require('../controllers/predictController'); 
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });
// Define the route for email file upload
router.post('/upload-email', upload.single('file'), uploadEmail);
// Define the route for URL prediction
router.post('/url', predictUrl);

module.exports = router;