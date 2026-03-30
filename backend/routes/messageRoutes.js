const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");


// ✏️ EDIT MESSAGE (ONLY SENDER + TIME LIMIT)
router.put("/edit/:id", auth, async (req, res) => {
  try {
    const { text } = req.body;

    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // ✅ Only sender can edit
    if (msg.sender.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // ⏱ TIME LIMIT (5 minutes)
    const now = new Date();
    const created = new Date(msg.createdAt);
    const diff = (now - created) / 1000; // seconds

    if (diff > 300) {
      return res.status(400).json({
        message: "Edit time expired (5 minutes)"
      });
    }

    msg.text = text;
    await msg.save();

    res.json({ message: "Message updated", data: msg });

  } catch (err) {
    res.status(500).json({ message: "Error editing message" });
  }
});




// 🗑 DELETE MESSAGE (ADMIN ONLY)
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // ✅ ONLY ADMIN CAN DELETE
    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Only admin can delete messages"
      });
    }

    await msg.deleteOne();

    res.json({ message: "Message deleted" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting message" });
  }
});




// ✅ SEND MESSAGE
router.post("/send", auth, async (req, res) => {
  try {
    const { text, department, fileUrl } = req.body;

    const message = new Message({
      sender: req.user.id,
      department,
      text,
      fileUrl,
      status: "sent"
    });

    await message.save();

    // ✅ Populate sender name (IMPORTANT)
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName");

    // ✅ Emit via socket (IMPORTANT)
    req.io.to(department).emit("receiveMessage", populatedMessage);

    res.json({ message: "Message sent", data: populatedMessage });

  } catch (err) {
    res.status(500).json({ message: "Error sending message" });
  }
});


// ✅ GET MESSAGES (already correct, just slight improvement)
router.get("/:departmentId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      department: req.params.departmentId
    })
      .populate("sender", "fullName") // cleaned
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

module.exports = router;