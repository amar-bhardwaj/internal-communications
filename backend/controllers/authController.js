const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Generate Token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department ? user.department.toString() : null // ✅ ensure string
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// Login
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Find user
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ❗ IMPORTANT: Check department exists
    if (user.role === "employee" && !user.department) {
      return res.status(400).json({
        message: "User has no department assigned"
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = generateToken(user);

    // Response
    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        department: user.department
          ? user.department.toString()
          : null
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err); // ✅ ADD THIS
    res.status(500).json({ error: err.message });
  }
};