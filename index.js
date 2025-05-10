const express = require("express");
const connectDB = require("./config/db");
const passport = require("passport");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const communityReport = require("./routes/communityReport");
const cookieParser = require("cookie-parser");

const predictRoutes = require('./routes/predictRoutes'); 
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
const allowedOrigins = ["http://localhost:5500", "http://localhost:5173",`chrome-extension://${process.env.CHROME_EXTENSION_ID}`];
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
app.use("/api/predict", predictRoutes);
app.use("/api/community", communityReport);
app.get('/', (req, res) => {
  res.send('Welcome to the Home Page!');
});
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
