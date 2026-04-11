const onlineUsers = new Map();

const Notification = require("../models/Notification");


module.exports = (io) => {

  io.on("connection", (socket) => {
    console.log("🟢 Connected:", socket.id);

    // ✅ ONLINE USERS
    socket.on("userOnline", (userId) => {
      if (!userId) return;

      onlineUsers.set(userId, socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

    // ✅ EMPLOYEE JOIN
    socket.on("joinDepartment", ({ departmentId, user }) => {
      if (!departmentId || !user) return;

      // ✅ ADMIN can join any department
      if (user.role === "admin") {
        socket.join(departmentId);
        console.log("👨‍💼 Admin joined:", departmentId);
        return;
      }

      // ✅ MANAGER & EMPLOYEE → only their department
      if (user.department === departmentId) {
        socket.join(departmentId);
        console.log("👤 Joined own dept:", departmentId);
      } else {
        console.log("⛔ Unauthorized room access blocked");
      }
    });

    // ✅ ADMIN JOIN ANY DEPARTMENT
    socket.on("joinAdminRoom", (departmentId) => {
      if (!departmentId) return;

      socket.join(departmentId);
      console.log("👨‍💼 Admin joined:", departmentId);
    });


    // ✅ ADMIN JOIN ALL DEPARTMENTS
    // ✅ ADMIN JOIN ALL DEPARTMENTS
    socket.on("joinAllDepartments", async () => {
      try {
        const Department = require("../models/Department");

        const departments = await Department.find();

        departments.forEach((dept) => {
          socket.join(dept._id.toString());
        });

        console.log("👨‍💼 Admin joined ALL departments");
      } catch (err) {
        console.error("Join all departments error:", err);
      }
    });


    // ✅ SEND MESSAGE
    socket.on("sendMessage", (data) => {
      if (!data.department) return;

      io.to(data.department).emit("receiveMessage", data);
    });

    // ✅ EDIT
    socket.on("editMessage", (msg) => {
      io.to(msg.department).emit("messageEdited", msg);
    });

    // ✅ DELETE
    socket.on("deleteMessage", ({ id, department }) => {
      io.to(department).emit("messageDeleted", id);
    });

    // ✅ TYPING
    socket.on("typing", ({ departmentId, userName }) => {
      socket.to(departmentId).emit("typing", userName);
    });



    // 🔔 SEND NOTIFICATION (ADMIN + MANAGER)
    socket.on("sendNotification", async (data) => {
      try {
        let { departments, message, sender, fileUrl, departmentId } = data;

        if (!message) return;

        // ✅ FIX: MANAGER SUPPORT
        if (!departments || departments.length === 0) {
          if (departmentId) {
            departments = [departmentId]; // manager case
          } else {
            console.log("❌ No departments provided");
            return;
          }
        }

        const newNotification = new Notification({
          message,
          departments,
          sender,
          fileUrl
        });

        await newNotification.save();

        departments.forEach((dept) => {
          io.to(dept.toString()).emit("notification", newNotification);
        });

        console.log("✅ Notification sent to:", departments);

      } catch (err) {
        console.error("❌ Notification error:", err);
      }
    });

    // ❌ DISCONNECT
    socket.on("disconnect", () => {
      let userIdToRemove = null;

      for (let [uid, sid] of onlineUsers.entries()) {
        if (sid === socket.id) {
          userIdToRemove = uid;
          break;
        }
      }

      if (userIdToRemove) {
        onlineUsers.delete(userIdToRemove);
      }

      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    });

  });
};