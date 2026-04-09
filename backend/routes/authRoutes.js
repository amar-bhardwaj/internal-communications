const express = require("express");
const router = express.Router();

const { login } = require("../controllers/authController");

const bcrypt = require("bcryptjs");
const User = require("../models/User"); // ✅ MISSING BEFORE


// ✅ REGISTER (for testing)
router.post("/register", async (req, res) => {
  try {
    const { fullName, username, password, department, role } = req.body;

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      username,
      password: hashed,
      role: role || "employee",
      department: department || null
    });

    await user.save();

    if (user.role === "manager" && department) {
      const Department = require("../models/Department");

      await Department.findByIdAndUpdate(department, {
        $addToSet: { managers: user._id }
      });
    }

    res.json({ message: "User created", user });

  } catch (err) {
    console.error(err); // 👈 ADD THIS
    res.status(500).json({ message: "Error creating user" });
  }
});


// ✅ LOGIN (already working)
router.post("/login", login);

module.exports = router;