import { useState } from "react";
import API from "../services/api";

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: "", password: "" });

  const login = async () => {
    try {
      const res = await API.post("/auth/login", form);

      console.log("LOGIN RESPONSE:", res.data);

      // ✅ SAVE TOKEN
      localStorage.setItem("token", res.data.token);

      // ✅ SAVE USER DATA (IMPORTANT)
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.fullName);
      localStorage.setItem("role", res.data.user.role);

      // ✅ SAVE DEPARTMENT
      localStorage.setItem("department", res.data.user.department);

      setUser(true);

    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="login">
      <h2>Login</h2>

      <input
        placeholder="Username"
        onChange={(e) =>
          setForm({ ...form, username: e.target.value })
        }
      />

      <input
        type="password"
        placeholder="Password"
        onChange={(e) =>
          setForm({ ...form, password: e.target.value })
        }
      />

      <button onClick={login}>Login</button>
    </div>
  );
};

export default Login;