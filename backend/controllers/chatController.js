const Message = require("../models/Message");

exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    department: req.params.department,
    chatType: "group"
  }).populate("sender", "fullName");

  res.json(messages);
};

exports.getPrivateMessages = async (req, res) => {
  const myId = req.user.id;
  const otherUser = req.params.userId;

  const messages = await Message.find({
    chatType: "private",
    $or: [
      { sender: myId, receiver: otherUser },
      { sender: otherUser, receiver: myId }
    ]
  }).sort({ createdAt: 1 });

  res.json(messages);
};