import { useEffect, useState } from "react";
import API from "../services/api";

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [deptName, setDeptName] = useState("");

  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    password: ""
  });

  const [selectedDept, setSelectedDept] = useState("");

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  const fetchUsers = async () => {
    const res = await API.get("/admin/users");
    setUsers(res.data);
  };

  const fetchDepartments = async () => {
    const res = await API.get("/admin/departments");
    setDepartments(res.data);
  };

  // ✅ CREATE DEPARTMENT
  const createDepartment = async () => {
    if (!deptName) return;

    await API.post("/admin/create-department", { name: deptName });
    setDeptName("");
    fetchDepartments();
  };

  // ✅ DELETE DEPARTMENT
  const deleteDepartment = async (name) => {
    await API.delete("/admin/delete-department", {
      data: { name }
    });
    fetchDepartments();
  };

  // ✅ CREATE USER
  const createUser = async () => {
    await API.post("/auth/register", newUser);
    setNewUser({ fullName: "", username: "", password: "" });
    fetchUsers();
  };

  // ✅ DELETE USER
  const deleteUser = async (id) => {
    await API.delete(`/admin/delete-user/${id}`);
    fetchUsers();
  };

  // ✅ ASSIGN DEPARTMENT
  const assignDept = async (userId) => {
    if (!selectedDept) return alert("Select department");

    await API.post("/admin/add-employee", {
      userId,
      department: selectedDept
    });

    fetchUsers();
  };

  return (
    <div className="admin">
      <h2>Admin Dashboard</h2>

      {/* ================= DEPARTMENTS ================= */}
      <div className="departments">
        <h3>Departments</h3>

        <input
          placeholder="New Department"
          value={deptName}
          onChange={(e) => setDeptName(e.target.value)}
        />

        <button onClick={createDepartment}>Create</button>

        {departments.map((d) => (
          <div key={d._id}>
            {d.name}
            <button onClick={() => deleteDepartment(d.name)}>
              Delete
            </button>
          </div>
        ))}
      </div>

      {/* ================= CREATE USER ================= */}
      <div className="createUser">
        <h3>Create User</h3>

        <input
          placeholder="Full Name"
          value={newUser.fullName}
          onChange={(e) =>
            setNewUser({ ...newUser, fullName: e.target.value })
          }
        />

        <input
          placeholder="Username"
          value={newUser.username}
          onChange={(e) =>
            setNewUser({ ...newUser, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={newUser.password}
          onChange={(e) =>
            setNewUser({ ...newUser, password: e.target.value })
          }
        />

        <button onClick={createUser}>Create</button>
      </div>

      {/* ================= USERS ================= */}
      <div className="users">
        <h3>All Users</h3>

        <select onChange={(e) => setSelectedDept(e.target.value)}>
          <option value="">Assign Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        {users.map((u) => (
          <div key={u._id} className="userCard">
            <p><strong>{u.fullName}</strong></p>
            <p>{u.username}</p>
            <p>{u.department?.name || "No Dept"}</p>

            <button onClick={() => assignDept(u._id)}>
              Assign Dept
            </button>

            <button onClick={() => deleteUser(u._id)}>
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminDashboard;