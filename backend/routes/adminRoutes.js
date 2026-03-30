const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");

// Models
const Department = require("../models/Department");
const User = require("../models/User");

const bcrypt = require("bcryptjs");


// ✅ CREATE DEPARTMENT
router.post("/create-department", auth, async (req, res) => {
  try {
    const { name } = req.body;

    const exists = await Department.findOne({ name });
    if (exists) {
      return res.status(400).json({ message: "Department already exists" });
    }

    const dept = new Department({ name });
    await dept.save();

    res.json({ message: "Department created", dept });
  } catch (err) {
    res.status(500).json({ message: "Error creating department" });
  }
});


// ✅ GET ALL DEPARTMENTS
router.get("/departments", auth, async (req, res) => {
  try {
    const departments = await Department.find();
    res.json(departments);
  } catch (err) {
    res.status(500).json({ message: "Error fetching departments" });
  }
});


// ✅ RENAME DEPARTMENT
router.put("/rename-department", auth, async (req, res) => {
  try {
    const { oldName, newName } = req.body;

    const dept = await Department.findOne({ name: oldName });
    if (!dept) {
      return res.status(404).json({ message: "Department not found" });
    }

    dept.name = newName;
    await dept.save();

    res.json({ message: "Department renamed" });
  } catch (err) {
    res.status(500).json({ message: "Error renaming department" });
  }
});


// ✅ DELETE DEPARTMENT
router.delete("/delete-department", auth, async (req, res) => {
  try {
    const { name } = req.body;

    await Department.findOneAndDelete({ name });

    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting department" });
  }
});


// ✅ ADD EMPLOYEE TO DEPARTMENT
router.post("/add-employee", auth, async (req, res) => {
  try {
    const { userId, department } = req.body;

    // ✅ Validate input
    if (!userId || !department) {
      return res.status(400).json({ message: "userId and department required" });
    }

    // ✅ Find user
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Assign department
    user.department = department;

    await user.save();

    res.json({
      message: "Employee added to department",
      user
    });

  } catch (err) {
    console.error("ADD EMPLOYEE ERROR:", err); // 👈 IMPORTANT
    res.status(500).json({ message: "Error adding employee" });
  }
});


// ✅ REMOVE EMPLOYEE FROM DEPARTMENT
router.post("/remove-employee", auth, async (req, res) => {
  try {
    const { userId } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.department = null;
    await user.save();

    res.json({ message: "Employee removed from department" });
  } catch (err) {
    res.status(500).json({ message: "Error removing employee" });
  }
});


// ✅ RESET PASSWORD
router.post("/reset-password", auth, async (req, res) => {
  try {
    const { userId, newPassword } = req.body;

    const hashed = await bcrypt.hash(newPassword, 10);

    await User.findByIdAndUpdate(userId, {
      password: hashed
    });

    res.json({ message: "Password reset successful" });
  } catch (err) {
    res.status(500).json({ message: "Error resetting password" });
  }
});


//Get users
router.get("/users", auth, async (req, res) => {
  try {
    const users = await User.find().populate("department", "name");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});


//Delete users
router.delete("/delete-user/:id", auth, async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting user" });
  }
});


//Get users by department
router.get("/users/:departmentId", auth, async (req, res) => {
  try {
    const users = await User.find({
      department: req.params.departmentId
    }).populate("department", "name");

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Error fetching users" });
  }
});


//

module.exports = router;