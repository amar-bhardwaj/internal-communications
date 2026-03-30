import { useState } from "react";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import Chat from "./components/Chat";
import "./index.css";

function App() {
  const [user, setUser] = useState(!!localStorage.getItem("token"));

  // ✅ SAFE ROLE EXTRACTION
  const token = localStorage.getItem("token");

  let role = null;

  if (token) {
    try {
      role = JSON.parse(atob(token.split(".")[1])).role;
    } catch (err) {
      role = null;
    }
  }

  // ✅ NOT LOGGED IN → LOGIN PAGE
  if (!user) return <Login setUser={setUser} />;

  // ✅ ADMIN VIEW
  if (role === "admin") {
    return <AdminDashboard />;
  }

  // ✅ EMPLOYEE VIEW (DEFAULT)
  return (
    <div className="app">
      <Header />

      <div className="main">
        <Sidebar />
        <Chat />
      </div>

      <Footer />
    </div>
  );
}

export default App;