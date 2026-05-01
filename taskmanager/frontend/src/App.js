import React, { useState } from "react";
import axios from "axios";
import "./App.css";

function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [token, setToken] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [users, setUsers] = useState([]);

  // 🔐 LOGIN
  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:8080/auth/login", {
        email,
        password,
      });

      setToken(res.data);
      setIsLoggedIn(true);
    } catch (err) {
      alert("Login Failed ❌");
    }
  };

  // 🚪 LOGOUT
  const handleLogout = () => {
    setIsLoggedIn(false);
    setToken("");
    setUsers([]);
  };

  // 👥 FETCH USERS
  const fetchUsers = async () => {
    try {
      const res = await axios.get("http://localhost:8080/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUsers(res.data);
    } catch (err) {
      console.log(err);
      alert("Error fetching users ❌");
    }
  };

  return (
    <div>
      {!isLoggedIn ? (
        // 🔐 LOGIN PAGE
        <div style={{ textAlign: "center", marginTop: "100px" }}>
          <h1>Login</h1>

          <input
            type="email"
            placeholder="Enter Email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <br /><br />

          <input
            type="password"
            placeholder="Enter Password"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />

          <button onClick={handleLogin}>Login</button>
        </div>
      ) : (
        // 🚀 DASHBOARD
        <>
          {/* HEADER */}
          <div className="header">
            <h2>Task Manager</h2>
            <button onClick={handleLogout}>Logout</button>
          </div>

          {/* SIDEBAR */}
          <div className="sidebar">
            <h3>Menu</h3>
            <ul>
              <li>Dashboard</li>
              <li onClick={fetchUsers}>Users</li>
              <li>Settings</li>
            </ul>
          </div>

          {/* MAIN CONTENT */}
          <div className="main">
            {/* WELCOME */}
            <div className="card">
              <h3>Welcome</h3>
              <p>{email}</p>
            </div>

            {/* TOKEN */}
            <div className="card">
              <h3>JWT Token</h3>
              <p style={{ wordBreak: "break-all" }}>{token}</p>
            </div>

            {/* USERS */}
            <div className="card">
              <h3>Users List</h3>

              {users.length === 0 ? (
                <p>Click "Users" in sidebar to load data</p>
              ) : (
                <ul>
                  {users.map((u) => (
                    <li key={u.id}>
                      {u.name} - {u.role}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default App;