const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Department"
  },
  text: {
    type: String
  },
  fileUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ["sent", "delivered"],
    default: "sent"
  }
}, { timestamps: true });

module.exports = mongoose.model("Message", messageSchema);