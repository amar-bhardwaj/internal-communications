import { useEffect, useState } from "react";
import API from "../services/api";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedDept, setSelectedDept] = useState("");

  const [form, setForm] = useState({
    fullName: "",
    username: "",
    password: "",
    department: "",
    role: "employee"
  });

  const [managerForm, setManagerForm] = useState({
    userId: "",
    departmentId: ""
  });

  useEffect(() => {
    fetchUsers();
    fetchDepartments();
  }, []);

  // ✅ FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await API.get("/admin/users");
      setUsers(res.data || []);
    } catch {
      console.error("Error fetching users");
    }
  };

  // ✅ FETCH DEPARTMENTS
  const fetchDepartments = async () => {
    try {
      const res = await API.get("/admin/departments");
      setDepartments(res.data || []);
    } catch {
      console.error("Error fetching departments");
    }
  };

  // ✅ CREATE USER
  const createUser = async () => {
    if (!form.fullName || !form.username || !form.password) {
      alert("Please fill all fields");
      return;
    }

    try {
      await API.post("/auth/register", form);

      alert("User created successfully");

      setForm({
        fullName: "",
        username: "",
        password: "",
        department: "",
        role: "employee"
      });

      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error creating user");
    }
  };

  // ✅ DELETE USER
  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await API.delete(`/admin/delete-user/${id}`);
      fetchUsers();
    } catch {
      alert("Error deleting user");
    }
  };

  // ✅ ASSIGN MANAGER
  const assignManager = async () => {
    if (!managerForm.userId || !managerForm.departmentId) {
      alert("Select user and department");
      return;
    }

    try {
      await API.post("/admin/assign-manager", managerForm);

      alert("Manager assigned successfully");

      setManagerForm({
        userId: "",
        departmentId: ""
      });

      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || "Error assigning manager");
    }
  };

  // ✅ REMOVE MANAGER (🔥 FIX)
  const removeManager = async (userId) => {
    if (!window.confirm("Make this user an employee again?")) return;

    try {
      await API.post("/admin/remove-manager", { userId });

      alert("Manager removed");

      fetchUsers();
    } catch {
      alert("Error removing manager");
    }
  };



  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.fullName
      ?.toLowerCase()
      .includes(search.toLowerCase());

    const matchesDept = selectedDept
      ? u.department?._id === selectedDept
      : true;

    return matchesSearch && matchesDept;
  });


  return (
    <div>

      <div style={{ marginBottom: "15px" }}>

        {/* SEARCH */}
        <input
          type="text"
          placeholder="Search user..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* FILTER */}
        <select
          value={selectedDept}
          onChange={(e) => setSelectedDept(e.target.value)}
        >
          <option value="">All Departments</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

      </div>
      <h2>👥 Users Management</h2>

      {/* 🔥 CREATE USER */}
      <div className="adminCard">
        <h3>Create New User</h3>

        <input
          placeholder="Full Name"
          value={form.fullName}
          onChange={(e) =>
            setForm({ ...form, fullName: e.target.value })
          }
        />

        <input
          placeholder="Username"
          value={form.username}
          onChange={(e) =>
            setForm({ ...form, username: e.target.value })
          }
        />

        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) =>
            setForm({ ...form, password: e.target.value })
          }
        />

        <select
          value={form.department}
          onChange={(e) =>
            setForm({ ...form, department: e.target.value })
          }
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <select
          value={form.role}
          onChange={(e) =>
            setForm({ ...form, role: e.target.value })
          }
        >
          <option value="employee">Employee</option>
          <option value="manager">Manager</option>
        </select>

        <button onClick={createUser}>Create User</button>
      </div>

      {/* 🔥 ASSIGN MANAGER */}
      <div className="adminCard">
        <h3>Assign Manager</h3>

        <select
          value={managerForm.userId}
          onChange={(e) =>
            setManagerForm({ ...managerForm, userId: e.target.value })
          }
        >
          <option value="">Select User</option>
          {filteredUsers.map((u) => (
            <option key={u._id} value={u._id}>
              {u.fullName}
            </option>
          ))}
        </select>

        <select
          value={managerForm.departmentId}
          onChange={(e) =>
            setManagerForm({
              ...managerForm,
              departmentId: e.target.value
            })
          }
        >
          <option value="">Select Department</option>
          {departments.map((d) => (
            <option key={d._id} value={d._id}>
              {d.name}
            </option>
          ))}
        </select>

        <button onClick={assignManager}>
          Assign Manager
        </button>
      </div>

      {/* 🔥 USERS LIST */}
      <div className="adminCard">
        <h3>All Users</h3>

        {filteredUsers.length === 0 && <p>No users found</p>}

        {users.map((u) => (
          <div key={u._id} className="adminRow">
            <div>
              <strong>{u.fullName}</strong> ({u.username}) <br />

              <small>
                {u.role === "manager" ? "👨‍💼 Manager" : "👤 Employee"} |{" "}
                {u.department?.name || "No Department"}
              </small>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              {/* 🔥 REMOVE MANAGER BUTTON */}
              {u.role === "manager" && (
                <button onClick={() => removeManager(u._id)}>
                  Remove Manager
                </button>
              )}

              <button onClick={() => deleteUser(u._id)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Users;