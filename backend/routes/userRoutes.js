const express = require("express");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getUserProfile, updateUserProfile, getUsers, getUserById, updateUserRole, deleteUser } = require("../controllers/userController");
const { profile: uploadProfile } = require("../middleware/uploadMiddleware");

// Register route
router.post("/register", async (req, res) => {
  const { name, email, password, role } = req.body;

  try {
    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Create a new user
    const user = new User({
      name,
      email,
      password,
      role,
    });

    // Save the user to the database
    await user.save();

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, "MY_NAME_IS_GOPINATH", {
      expiresIn: "30d", // 30 days validity
    });

    res.status(201).json({
      message: "User created successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// User profile routes
router.get("/profile", protect, getUserProfile);
router.put("/profile", protect, uploadProfile.single('profileImage'), updateUserProfile);

// Admin routes
router.get("/", protect, getUsers);
router.get("/:id", protect, getUserById);
router.put("/:id/role", protect, updateUserRole);
router.delete("/:id", protect, deleteUser);

module.exports = router;
