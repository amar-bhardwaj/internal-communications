const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// ✅ GENERATE TOKEN
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id,
      role: user.role,
      department: user.department ? user.department.toString() : null
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// ✅ REGISTER (FIXED)
exports.register = async (req, res) => {
  try {
    const { fullName, username, password, department, role } = req.body;

    const exists = await User.findOne({ username });
    if (exists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashed = await bcrypt.hash(password, 10);

    const user = new User({
      fullName,
      username,
      password: hashed,
      role: role || "employee",
      department: department || null // ✅ FIXED
    });

    await user.save();

    res.json({ message: "User created", user });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({ message: "Error registering user" });
  }
};

// ✅ LOGIN (UNCHANGED WORKING)
exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (user.role === "employee" && !user.department) {
      return res.status(400).json({
        message: "User has no department assigned"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user);

    res.json({
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        role: user.role,
        department: user.department ? user.department.toString() : null
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({ error: err.message });
  }
};