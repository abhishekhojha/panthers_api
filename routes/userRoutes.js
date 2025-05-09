const express = require("express");
const { getMe } = require("../controllers/userController");
const { verifyToken } = require("../middlewares/auth");

const router = express.Router();

router.get("/me", verifyToken, getMe);

module.exports = router;
