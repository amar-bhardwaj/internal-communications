import { useEffect, useState } from "react";
import Users from "./Users";
import Departments from "./Departments";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Chat from "../components/Chat";
import socket from "../services/socket";
import API from "../services/api";
import Notifications from "../pages/Notifications";

const AdminDashboard = () => {
  const [active, setActive] = useState("chat");
  const [unread, setUnread] = useState({});

  const [notificationMsg, setNotificationMsg] = useState("");
  const [departments, setDepartments] = useState([]);
  const [selectedDepts, setSelectedDepts] = useState([]);
  const [file, setFile] = useState(null); // ✅ FILE STATE

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    socket.emit("userOnline", userId);

    socket.on("receiveMessage", (msg) => {
      if (!msg.department) return;

      setUnread((prev) => ({
        ...prev,
        [msg.department]: (prev[msg.department] || 0) + 1
      }));
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, []);

  // FETCH DEPARTMENTS
  useEffect(() => {
    fetch("http://127.0.0.1:5000/api/admin/departments", {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then((res) => res.json())
      .then((data) => setDepartments(data || []))
      .catch(() => setDepartments([]));
  }, []);

  const handleNavigation = (page) => {
    setActive(page);
  };

  // ✅ FULL FIXED SEND NOTIFICATION (WITH FILE SUPPORT)
  const sendNotification = async () => {
    if (!notificationMsg) {
      alert("Enter notification message");
      return;
    }

    let targetDepts = selectedDepts;

    if (targetDepts.length === 0) {
      targetDepts = departments.map((d) => d._id);
    }

    let fileUrl = "";

    // ✅ UPLOAD FILE FIRST
    if (file) {
      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await API.post("/upload", formData, {
          headers: {
            "Content-Type": "multipart/form-data"
          }
        });

        fileUrl = res.data.fileUrl;
      } catch (err) {
        console.error("File upload failed");
      }
    }

    // ✅ SEND SOCKET EVENT
    socket.emit("sendNotification", {
      message: notificationMsg,
      departments: targetDepts,
      sender: userId,
      fileUrl // ✅ IMPORTANT
    });

    alert("Notification sent");

    // RESET
    setNotificationMsg("");
    setSelectedDepts([]);
    setFile(null);
  };

  const toggleDept = (id) => {
    setSelectedDepts((prev) =>
      prev.includes(id)
        ? prev.filter((d) => d !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="app">
      <Header />

      <div className="main">
        <div className="sidebar">
          <h3>⚙️ Admin Panel</h3>

          <div
            className="userItem"
            onClick={() => handleNavigation("chat")}
          >
            💬 Chat
          </div>

          <div
            className="userItem"
            onClick={() => handleNavigation("users")}
          >
            👥 Users
          </div>

          <div
            className="userItem"
            onClick={() => handleNavigation("departments")}
          >
            🏢 Departments
          </div>

          <div
            className="userItem"
            onClick={() => handleNavigation("notifications")}
          >
            🔔 Notifications
          </div>
        </div>

        <div style={{ flex: 1, padding: "20px" }}>
          {active === "chat" && <Chat />}
          {active === "users" && <Users />}
          {active === "departments" && <Departments />}

          {active === "notifications" && (
            <div>

              {/* 🔔 SEND NOTIFICATION */}
              <div className="adminCard">
                <h3>Send Notification 🔔</h3>

                <textarea
                  placeholder="Enter notification message..."
                  value={notificationMsg}
                  onChange={(e) => setNotificationMsg(e.target.value)}
                  style={{ width: "100%", height: "80px" }}
                />

                <h4>Select Departments (optional)</h4>

                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {departments.map((d) => (
                    <label key={d._id}>
                      <input
                        type="checkbox"
                        checked={selectedDepts.includes(d._id)}
                        onChange={() => toggleDept(d._id)}
                      />
                      {d.name}
                    </label>
                  ))}
                </div>

                <input
                  type="file"
                  onChange={(e) => setFile(e.target.files[0])}
                  style={{ marginTop: "10px" }}
                />

                <button onClick={sendNotification} style={{ marginTop: "10px" }}>
                  Send Notification
                </button>

                <p style={{ fontSize: "12px", marginTop: "10px" }}>
                  * If no department selected → sends to ALL users
                </p>
              </div>

              {/* 🔥 SHOW NOTIFICATIONS (THIS WAS MISSING) */}
              <Notifications />

            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default AdminDashboard;