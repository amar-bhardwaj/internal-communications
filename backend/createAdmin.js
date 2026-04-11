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
    // await User.deleteMany({ role: "admin" });

    const hashedPassword = await bcrypt.hash("Saanvi#981", 10);

    // const admin = new User({
    //   fullName: "Yogesh Gupta",
    //   username: "yogeshgupta",
    //   password: hashedPassword,
    //   role: "admin"
    // });

    const admin = new User({
      fullName: "Swati Vijay",
      username: "swativijay",
      password: hashedPassword,
      role: "admin"
    });

    await admin.save();

    console.log("✅ Admin created successfully!");

    process.exit();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();