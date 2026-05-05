import React, { useState, useEffect } from "react";
import UserList from "./components/UserList";
import EditUserForm from "./components/EditUserForm";
import TaskList from "./components/TaskList";
import Leaderboard from "./components/Leaderboard";
import AdminPanel from "./components/AdminPanel";
import { login, getUsers, deleteUser, updateUser, getMyPerformance } from "./services/api";

import "./App.css";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("token"));
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [myPerformance, setMyPerformance] = useState(null);
  const [notifications, setNotifications] = useState([]);

  // Active Tab
  const [activeTab, setActiveTab] = useState("tasks");


  // Edit User States
  const [editingUser, setEditingUser] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState("");

  // Login Form States
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      loadUsers();
      loadMyPerformance();
      loadNotifications();
    }
  }, [isLoggedIn]);

  const loadNotifications = async () => {
    try {
      const res = await import("./services/api").then(api => api.getNotifications());
      setNotifications(res.data);
    } catch (err) {
      console.error("Failed to load notifications:", err);
    }
  };

  const loadMyPerformance = async () => {

    try {
      const res = await getMyPerformance();
      setMyPerformance(res.data);
    } catch (err) {
      console.error("Failed to load personal performance:", err);
    }
  };

  // Clear success message after 3 seconds
  useEffect(() => {
    if (updateSuccess) {
      const timer = setTimeout(() => setUpdateSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [updateSuccess]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await login({ email, password });
      const receivedToken = res.data.token || res.data;
      localStorage.setItem("token", receivedToken);
      localStorage.setItem("email", email);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      setLoginError(err.response?.data?.error || "Invalid email or password. Please try again.");
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    setIsLoggedIn(false);
    setUsers([]);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getUsers();
      setUsers(res.data);
    } catch (err) {
      console.error(err);
      if (err.response && (err.response.status === 401 || err.response.status === 403)) {
        handleLogout();
      } else {
        setError("Failed to load users. Please ensure the server is running.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user) => {
    setEditingUser(user);
  };

  const handleSaveUser = async (updatedUser) => {
    try {
      const res = await updateUser(updatedUser.id, updatedUser);
      setUsers(users.map(u => (u.id === updatedUser.id ? res.data : u)));
      setEditingUser(null);
      setUpdateSuccess("User updated successfully!");
    } catch (err) {
      console.error("Error updating user:", err);
      throw new Error("Failed to update user.");
    }
  };

  // Determine current user's role safely
  let currentUserRole = null;
  const loggedInEmail = localStorage.getItem("email");
  const currentUserObj = users.find(u => u.email === loggedInEmail);
  
  if (currentUserObj && currentUserObj.role) {
    currentUserRole = currentUserObj.role.toUpperCase();
  }

  const token = localStorage.getItem("token");
  if (token) {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      const decoded = JSON.parse(jsonPayload);
      if (decoded.role) {
        currentUserRole = decoded.role.toUpperCase();
      }
    } catch (e) {
      console.error("Failed to parse JWT", e);
    }
  }

  // Forgot Password States
  // Forgot Password States
  const [forgotPasswordStep, setForgotPasswordStep] = useState(0);
  const [fpEmail, setFpEmail] = useState("");
  const [fpOtp, setFpOtp] = useState("");
  const [fpNewPassword, setFpNewPassword] = useState("");
  const [fpLoading, setFpLoading] = useState(false);
  const [fpError, setFpError] = useState("");
  const [fpSuccess, setFpSuccess] = useState("");

  // Auth Mode: login / register
  const [authMode, setAuthMode] = useState("login");
  const [regData, setRegData] = useState({ name: "", email: "", password: "", companyName: "" });
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState("");



  const handleForgotPasswordRequest = async (e) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError("");
    setFpSuccess("");
    try {
      const res = await import("./services/api").then(api => api.forgotPassword({ email: fpEmail }));
      setFpSuccess(res.data.message || "OTP sent to your email!");
      setForgotPasswordStep(2);
    } catch (err) {
      setFpError(err.response?.data?.error || "Failed to send OTP.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFpLoading(true);
    setFpError("");
    setFpSuccess("");
    try {
      const res = await import("./services/api").then(api => api.resetPassword({ email: fpEmail, otp: fpOtp, newPassword: fpNewPassword }));
      setFpSuccess(res.data.message || "Password reset successfully!");
      setTimeout(() => {
        setForgotPasswordStep(0);
        setFpSuccess("");
      }, 2000);
    } catch (err) {
      setFpError(err.response?.data?.error || "Invalid OTP or failed to reset.");
    } finally {
      setFpLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setRegLoading(true);
    setRegError("");
    try {
      const res = await import("./services/api").then(api => api.register(regData));
      const { token } = res.data;
      localStorage.setItem("token", token);
      localStorage.setItem("email", regData.email);
      setIsLoggedIn(true);
      setLoggedInEmail(regData.email);
      setAuthMode("login");
    } catch (err) {
      setRegError(err.response?.data?.error || "Registration failed.");
    } finally {
      setRegLoading(false);
    }
  };

  if (!isLoggedIn) {
    if (forgotPasswordStep > 0) {
      return (
        <div className="login-container">
          <div className="login-card">
            <h2>Forgot Password</h2>
            <p className="login-subtitle">
              {forgotPasswordStep === 1 
                ? "Enter your email to receive an OTP." 
                : "Enter the OTP sent to your email and your new password."}
            </p>
            
            {fpError && <div className="login-error">{fpError}</div>}
            {fpSuccess && <div className="success-toast" style={{ position: 'relative', top: 0, marginBottom: '15px' }}>{fpSuccess}</div>}
            
            {forgotPasswordStep === 1 ? (
              <form onSubmit={handleForgotPasswordRequest}>
                <div className="form-group">
                  <label>Email</label>
                  <input 
                    type="email" 
                    value={fpEmail}
                    onChange={(e) => setFpEmail(e.target.value)}
                    placeholder="Enter your registered email"
                    required 
                  />
                </div>
                <button type="submit" className="btn-login" disabled={fpLoading}>
                  {fpLoading ? "Sending OTP..." : "Send OTP"}
                </button>
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  <span className="link-text" onClick={() => setForgotPasswordStep(0)}>Back to Login</span>
                </div>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div className="form-group">
                  <label>OTP</label>
                  <input 
                    type="text" 
                    value={fpOtp}
                    onChange={(e) => setFpOtp(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    required 
                  />
                </div>
                <div className="form-group">
                  <label>New Password</label>
                  <input 
                    type="password" 
                    value={fpNewPassword}
                    onChange={(e) => setFpNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    required 
                  />
                </div>
                <button type="submit" className="btn-login" disabled={fpLoading}>
                  {fpLoading ? "Resetting..." : "Reset Password"}
                </button>
                <div style={{ textAlign: "center", marginTop: "15px" }}>
                  <span className="link-text" onClick={() => setForgotPasswordStep(0)}>Back to Login</span>
                </div>
              </form>
            )}
          </div>
        </div>
      );
    }

    if (authMode === "register") {
      return (
        <div className="login-container">
          <div className="login-card anim-slide-up">
            <h2>Create Your Workspace</h2>
            <p className="login-subtitle">Start managing your team with a professional SaaS environment</p>
            
            {regError && <div className="login-error">{regError}</div>}
            
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  value={regData.name}
                  onChange={(e) => setRegData({...regData, name: e.target.value})}
                  placeholder="e.g. John Doe"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Organization Name</label>
                <input 
                  type="text" 
                  value={regData.companyName}
                  onChange={(e) => setRegData({...regData, companyName: e.target.value})}
                  placeholder="e.g. Acme Corp"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Email Address</label>
                <input 
                  type="email" 
                  value={regData.email}
                  onChange={(e) => setRegData({...regData, email: e.target.value})}
                  placeholder="name@company.com"
                  required 
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  value={regData.password}
                  onChange={(e) => setRegData({...regData, password: e.target.value})}
                  placeholder="Minimum 8 characters"
                  required 
                />
              </div>
              <button type="submit" className="btn-login" disabled={regLoading}>
                {regLoading ? "Building Workspace..." : "Create Workspace"}
              </button>
              <div className="auth-footer">
                Already have a workspace? <span className="link-text" onClick={() => setAuthMode("login")}>Sign In</span>
              </div>
            </form>
          </div>
        </div>
      );
    }

    return (
      <div className="login-container">
        <div className="login-card">
          <h2>Task Manager Login</h2>
          <p className="login-subtitle">Enter your credentials to access the dashboard</p>
          
          {loginError && <div className="login-error">{loginError}</div>}
          
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                required 
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required 
              />
            </div>
            <button type="submit" className="btn-login" disabled={loginLoading}>
              {loginLoading ? "Authenticating..." : "Sign In"}
            </button>
            <div className="auth-footer">
               <span className="link-text" onClick={() => setForgotPasswordStep(1)}>Forgot Password?</span>
               <div style={{ marginTop: "12px" }}>
                 New here? <span className="link-text" onClick={() => setAuthMode("register")}>Create a Workspace</span>
               </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      <header className="dashboard-header">
        <h1>Task Manager Dashboard</h1>
        <div className="header-right">
          {myPerformance && (
            <div className="header-performance">
              <span className="hp-score" title="Total Performance Points">🏆 {myPerformance.score}</span>
              <span className="hp-streak" title={`Current Streak: ${myPerformance.streak} days`}>🔥 {myPerformance.streak}</span>
              <span className="hp-badge">{myPerformance.badge}</span>
            </div>

          )}
          <span className="logged-in-user">👤 {loggedInEmail}</span>
          {myPerformance?.companyName && (
            <span className="company-badge">🏢 {myPerformance.companyName}</span>
          )}
          {currentUserRole && <span className="header-role-badge">{currentUserRole}</span>}

          <div className="notification-bell" onClick={() => setActiveTab('notifications')}>
             🔔 {notifications.filter(n => !n.read).length > 0 && <span className="notif-count">{notifications.filter(n => !n.read).length}</span>}
          </div>
          <button onClick={handleLogout} className="btn-logout">Logout</button>

        </div>
      </header>

      {/* Tab Navigation */}
      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'tasks' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          📋 Tasks
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'leaderboard' ? 'tab-active' : ''}`}
          onClick={() => setActiveTab('leaderboard')}
        >
          🏆 Leaderboard
        </button>
        {currentUserRole === 'ADMIN' && (
          <button 
            className={`tab-btn ${activeTab === 'admin' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('admin')}
          >
            📊 Admin Panel
          </button>
        )}
      </div>


      <main className="dashboard-content">
        {updateSuccess && (
          <div className="success-toast">
            ✓ {updateSuccess}
          </div>
        )}

        {/* Tasks Tab */}
        {activeTab === 'tasks' && (
          <TaskList 
            currentUserRole={currentUserRole} 
            loadMyPerformance={loadMyPerformance}
          />
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <>
            <UserList 
              users={users} 
              loading={loading} 
              error={error} 
              currentUserRole={currentUserRole}
              onDeleteSuccess={(deletedId) => {
                setUsers(users.filter(user => user.id !== deletedId));
                setUpdateSuccess("User deleted successfully!");
              }}
              onEdit={handleEdit}
            />

            {editingUser && (
              <EditUserForm
                user={editingUser}
                onSave={handleSaveUser}
                onClose={() => setEditingUser(null)}
              />
            )}
          </>
        )}

        {/* Leaderboard Tab */}
        {activeTab === 'leaderboard' && (
          <Leaderboard />
        )}

        {/* Admin Tab */}
        {activeTab === 'admin' && currentUserRole === 'ADMIN' && (
          <AdminPanel />
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <div className="notifications-tab">
            <h2>Notifications</h2>
            {notifications.length === 0 ? (
              <p>No notifications yet.</p>
            ) : (
              <div className="notif-list">
                {notifications.map(n => (
                  <div key={n.id} className={`notif-item ${n.read ? 'read' : 'unread'}`} onClick={() => {
                    import("./services/api").then(api => api.markNotificationRead(n.id));
                    setNotifications(notifications.map(notif => notif.id === n.id ? {...notif, read: true} : notif));
                  }}>
                    <div className="notif-content">
                      <span className="notif-type">[{n.type}]</span>
                      <p>{n.message}</p>
                      <small>{new Date(n.createdAt).toLocaleString()}</small>
                    </div>
                    {!n.read && <span className="unread-dot"></span>}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>



    </div>
  );
}

export default App;