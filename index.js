const express = require("express");
const connectDB = require("./config/db");
const passport = require("passport");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const cookieParser = require("cookie-parser");
const multer = require('multer');
// const emailRoutes = require('./routes/emailRoutes'); 
const upload = multer({ dest: 'uploads/' });
dotenv.config();
// MongoDB Connection
connectDB();

const app = express();
app.use(cookieParser());

//session
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    },
  })
);
require("./config/passport");
// Middleware
app.use(express.json());
const allowedOrigins = ["http://localhost:5500", "http://localhost:5173"];
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(passport.initialize());

// Routes
app.use("/auth", authRoutes);
app.use("/api/user", userRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
