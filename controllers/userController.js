const User = require("../models/User");
const History = require("../models/History");
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.getHistory = async (req, res) => {
  try {
    const userId = req.user.id; 
    const { page = 1, limit = 10, type } = req.query;

    const user = await User.findById(userId);
    if (!user || !user.deviceID) {
      return res.status(404).json({ success: false, message: "User or device ID not found" });
    }

    const query = {
      userId,
      deviceID: user.deviceID,
    };
    const total = await History.countDocuments(query);

    const histories = await History.find(query)
      .sort({ createdAt: -1 }) 
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalItems: total,
      data: histories,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};