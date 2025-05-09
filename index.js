const express = require('express');
const connectDB = require('./config/db');
const passport = require('passport');
const cors = require('cors');

const dotenv = require('dotenv');
dotenv.config();
// MongoDB Connection
connectDB();

const app = express();
require('./config/passport');
// Middleware
app.use(express.json());
app.use(cors());
app.use(passport.initialize());


// Routes
app.use('/auth', require('./routes/authRoutes'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
