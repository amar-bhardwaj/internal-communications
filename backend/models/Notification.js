const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    // 🔔 Notification text
    message: {
      type: String,
      required: true
    },

    // 📎 FILE ATTACHMENT (NEW)
    fileUrl: {
      type: String
    },

    // 📌 Departments this notification is sent to
    departments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Department"
      }
    ],

    // 👤 Who created it (admin/manager)
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    // 👁️ Track who has read it
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model("Notification", notificationSchema);