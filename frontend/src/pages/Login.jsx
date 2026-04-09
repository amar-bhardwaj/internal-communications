import { useState } from "react";
import API from "../services/api";

const Login = ({ setUser }) => {
  const [form, setForm] = useState({ username: "", password: "" });

  const login = async () => {
    try {
      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userId", res.data.user.id);
      localStorage.setItem("userName", res.data.user.fullName);
      localStorage.setItem("role", res.data.user.role);
      localStorage.setItem("department", res.data.user.department);

      setUser(true);
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="loginPage">

      <div className="loginCard">
        <h2>Saanvi Technologies<br /><span style={{fontSize:"20px", fontWeight:"normal"}}>Intercom Panel</span></h2>
        <p className="subText">Login to continue</p>

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

    </div>
  );
};

export default Login;