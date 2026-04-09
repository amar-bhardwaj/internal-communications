const express = require("express");
const router = express.Router();

const auth = require("../middleware/authMiddleware");
const Message = require("../models/Message");

const Notification = require("../models/Notification");


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
    const diff = (now - created) / 1000;

    if (diff > 1800) {
      return res.status(400).json({
        message: "Edit time expired (30 minutes)"
      });
    }

    msg.text = text;
    await msg.save();

    const updated = await Message.findById(msg._id)
      .populate("sender", "fullName username");

    // ✅🔥 REAL-TIME EMIT
    if (req.io) {
      req.io.to(msg.department.toString()).emit("messageEdited", updated);
    }

    res.json({ message: "Message updated", data: updated });

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

    const departmentId = msg.department;

    await msg.deleteOne();

    // ✅🔥 REAL-TIME EMIT
    if (req.io) {
      req.io.to(departmentId.toString()).emit("messageDeleted", msg._id);
    }

    res.json({ message: "Message deleted" });

  } catch (err) {
    res.status(500).json({ message: "Error deleting message" });
  }
});


// ✅ SEND MESSAGE
router.post("/send", auth, async (req, res) => {
  try {
    const { text, department, fileUrl, fileName, replyTo } = req.body;

    const message = new Message({
      sender: req.user.id,
      department,
      text,
      fileUrl,
      fileName,
      replyTo,
      status: "sent"
    });

    await message.save();

    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "fullName");

    if (req.io) {
      req.io.to(department).emit("receiveMessage", populatedMessage);
    }

    res.json({ message: "Message sent", data: populatedMessage });

  } catch (err) {
    res.status(500).json({ message: "Error sending message" });
  }
});




router.put("/notification/read/:id", auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, {
      $addToSet: { readBy: req.user.id }
    });

    res.json({ message: "Marked as read" });
  } catch {
    res.status(500).json({ message: "Error" });
  }
});


// ✅ GET MESSAGES
router.get("/:departmentId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      department: req.params.departmentId
    })
      .populate("sender", "fullName")
      .sort({ createdAt: 1 });

    res.json(messages);

  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});


// 🔔 GET NOTIFICATIONS
router.get("/notifications/:departmentId", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({
      departments: req.params.departmentId
    })
      .populate("sender", "fullName")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Error fetching notifications" });
  }
});

module.exports = router;