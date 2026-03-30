const User = require("../models/User");
const Department = require("../models/Department");
const bcrypt = require("bcryptjs");
const webpush = require("../config/push");

// =======================
// DEPARTMENT MANAGEMENT
// =======================

// Create Department
exports.createDepartment = async (req, res) => {
  try {
    const dept = await Department.create({ name: req.body.name });
    res.json(dept);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete Department
exports.deleteDepartment = async (req, res) => {
  try {
    await Department.findByIdAndDelete(req.params.id);
    res.json({ message: "Department deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Rename Department
exports.renameDepartment = async (req, res) => {
  try {
    const dept = await Department.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      { new: true }
    );
    res.json(dept);
  } catch (err) {
    res.status(500).json(err);
  }
};

// =======================
// EMPLOYEE MANAGEMENT
// =======================

// Create Employee
exports.createEmployee = async (req, res) => {
  try {
    const { fullName, username, password, departmentId } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      fullName,
      username,
      password: hashedPassword,
      department: departmentId,
      role: "employee"
    });

    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Delete Employee
exports.deleteEmployee = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Assign / Change Department
exports.changeDepartment = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { department: req.body.departmentId },
      { new: true }
    );
    res.json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

// Reset Employee Password
exports.resetPassword = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    await User.findByIdAndUpdate(req.params.id, {
      password: hashedPassword
    });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};


//Reset Admin Own Password
exports.resetOwnPassword = async (req, res) => {
  try {
    const hashedPassword = await bcrypt.hash(req.body.newPassword, 10);

    await User.findByIdAndUpdate(req.user.id, {
      password: hashedPassword
    });

    res.json({ message: "Admin password updated" });

  } catch (err) {
    res.status(500).json(err);
  }
};




// store subscriptions with department
let subscriptions = [];

// SAVE SUBSCRIPTION (auto from frontend)
exports.saveSubscription = (req, res) => {
  const { subscription, department } = req.body;

  subscriptions.push({
    subscription,
    department
  });

  res.json({ message: "Subscribed successfully" });
};

// SEND NOTIFICATION TO DEPARTMENTS
exports.sendNotification = async (req, res) => {
  const { message, departments } = req.body;

  const payload = JSON.stringify({
    title: "🚨 EMERGENCY ALERT",
    body: message
  });

  try {
    const filteredSubs = subscriptions.filter(sub =>
      departments.includes(sub.department)
    );

    for (let sub of filteredSubs) {
      await webpush.sendNotification(sub.subscription, payload);
    }

    res.json({ message: "Notification sent to departments" });

  } catch (err) {
    res.status(500).json(err);
  }
};