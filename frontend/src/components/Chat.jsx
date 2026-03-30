import { useEffect, useState, useRef } from "react";
import socket from "../services/socket";
import API from "../services/api";
import MessageInput from "./MessageInput";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [typingUser, setTypingUser] = useState("");

  const departmentId = localStorage.getItem("department");
  const userId = localStorage.getItem("userId");
  const role = localStorage.getItem("role");

  const bottomRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio("/notification.mp3");
  }, []);

  useEffect(() => {
    if (!departmentId) return;

    socket.emit("userOnline", userId);
    socket.emit("joinDepartment", departmentId);

    socket.on("receiveMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);

      if (msg.sender?._id !== userId) {
        audioRef.current?.play().catch(() => { });
      }
    });

    socket.on("messageEdited", (updatedMsg) => {
      setMessages((prev) =>
        prev.map((m) => (m._id === updatedMsg._id ? updatedMsg : m))
      );
    });

    socket.on("messageDeleted", (id) => {
      setMessages((prev) => prev.filter((m) => m._id !== id));
    });

    socket.on("typing", (name) => {
      setTypingUser(name);
      setTimeout(() => setTypingUser(""), 1500);
    });

    fetchMessages();

    return () => {
      socket.off("receiveMessage");
      socket.off("typing");
      socket.off("messageEdited");
      socket.off("messageDeleted");
    };
  }, [departmentId]);

  const fetchMessages = async () => {
    const res = await API.get(`/messages/${departmentId}`);
    setMessages(res.data);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✏️ EDIT
  const editMessage = async (msg) => {
    const newText = prompt("Edit message", msg.text);
    if (!newText) return;

    try {
      const res = await API.put(`/messages/edit/${msg._id}`, {
        text: newText
      });

      socket.emit("editMessage", res.data.data);

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  // 🗑 DELETE
  const deleteMessage = async (msg) => {
    try {
      await API.delete(`/messages/delete/${msg._id}`);

      socket.emit("deleteMessage", {
        id: msg._id,
        department: departmentId
      });

    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  // ⏱ BONUS: TIME CALCULATION
  const getMinutesAgo = (date) => {
    return Math.floor((Date.now() - new Date(date)) / 60000);
  };

  return (
    <div className="chat">
      <div className="messages">

        {messages.map((msg, i) => (
          <div
            key={i}
            className="msg"
            style={{
              alignSelf:
                msg.sender?._id === userId
                  ? "flex-end"
                  : "flex-start",
              background:
                msg.sender?._id === userId
                  ? "#dff9fb"
                  : "white"
            }}
          >
            <strong>{msg.sender?.fullName}</strong>

            {msg.text && <p>{msg.text}</p>}

            {msg.fileUrl && (
              msg.fileUrl.match(/\.(jpeg|jpg|png|gif)$/) ? (
                <img src={msg.fileUrl} alt="file" width="150" />
              ) : (
                <a href={msg.fileUrl} target="_blank" rel="noreferrer">
                  📎 Download File
                </a>
              )
            )}

            {/* ⏱ TIME + STATUS */}
            <small>
              {new Date(msg.createdAt).toLocaleString()}{" "}
              {msg.sender?._id === userId &&
                (msg.status === "delivered" ? "✔✔" : "✔")}
            </small>

            {/* ✏️ EDIT (ONLY OWNER) */}
            {msg.sender?._id === userId && (
              <button onClick={() => editMessage(msg)}>✏️</button>
            )}

            {/* 🗑 DELETE (ONLY ADMIN) */}
            {role === "admin" && (
              <button onClick={() => deleteMessage(msg)}>🗑</button>
            )}
          </div>
        ))}

        <div ref={bottomRef}></div>

        {typingUser && (
          <div className="typing">
            {typingUser} is typing...
          </div>
        )}

      </div>

      <MessageInput />
    </div>
  );
};

export default Chat;