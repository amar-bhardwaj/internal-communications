const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");

    // DELETE old admin if exists (temporary for fix)
    await User.deleteMany({ role: "admin" });

    const hashedPassword = await bcrypt.hash("Internal#421", 10);

    const admin = new User({
      fullName: "Saanvi Technologies",
      username: "admin",
      password: hashedPassword,
      role: "admin",
      department: "admin"
    });

    await admin.save();

    console.log("✅ Admin created successfully!");
    console.log("Username: admin");
    console.log("Password: Internal#421");

    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();