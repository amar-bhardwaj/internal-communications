import { useEffect, useState } from "react";
import API from "../services/api";
import socket from "../services/socket";

const Sidebar = () => {
  const [users, setUsers] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);

  const departmentId = localStorage.getItem("department");
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    fetchUsers();

    // ✅ Listen online users
    socket.on("onlineUsers", (users) => {
      setOnlineUsers(users);
    });

    return () => {
      socket.off("onlineUsers");
    };
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await API.get(`/admin/users/${departmentId}`);
      setUsers(res.data);
    } catch (err) {
      console.error("Error fetching users");
    }
  };

  const logout = () => {
    localStorage.clear();
    window.location.reload();
  };

  return (
    <div className="sidebar">
      <h3>👥 Team</h3>

      <p className="currentUser">Logged in as:</p>
      <strong>{userName}</strong>

      <hr />

      {/* USERS */}
      {users.map((u) => (
        <div key={u._id} className="userItem">
          <span
            className="dot"
            style={{
              background: onlineUsers.includes(u._id)
                ? "#2ecc71"
                : "#bdc3c7"
            }}
          ></span>

          {u.fullName}
        </div>
      ))}

      <button className="logoutBtn" onClick={logout}>
        Logout
      </button>
    </div>
  );
};

export default Sidebar;