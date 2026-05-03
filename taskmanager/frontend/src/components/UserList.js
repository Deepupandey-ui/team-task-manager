import React, { useState, useEffect } from "react";
import { deleteUser } from "../services/api";
import CreateUserModal from "./CreateUserModal";
import ConfirmModal from "./ConfirmModal";
import "./UserList.css";

function UserList({ users, loading, error, currentUserRole, onEdit }) {
  const [localUsers, setLocalUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [loadingDelete, setLoadingDelete] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [permissionError, setPermissionError] = useState("");

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("All");

  // Helper function for smart permission checking
  const handleProtectedAction = (actionCallback) => {
    if (currentUserRole !== 'ADMIN') {
      setPermissionError("Access Denied: Only Administrators have permission to modify data.");
      setTimeout(() => setPermissionError(""), 3500);
      return;
    }
    actionCallback();
  };

  // Sync local users with props (so it works independently)
  useEffect(() => {
    setLocalUsers(users);
  }, [users]);

  // Clear success message after 3 seconds
  useEffect(() => {
    if (deleteSuccess) {
      const timer = setTimeout(() => setDeleteSuccess(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [deleteSuccess]);

  const handleCreateSuccess = (newUser) => {
    setLocalUsers([...localUsers, newUser]);
    setShowCreateModal(false);
    setDeleteSuccess("User created successfully!");
  };

  const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setDeleteError("");
    setDeleteSuccess("");
  };

  const cancelDelete = () => {
    setSelectedUserId(null);
    setDeleteError("");
  };

  const confirmDelete = async () => {
    if (!selectedUserId) return;
    
    setLoadingDelete(true);
    setDeleteError("");
    
    try {
      await deleteUser(selectedUserId);
      setLocalUsers(localUsers.filter(user => user.id !== selectedUserId));
      setDeleteSuccess("User deleted successfully!");
      setSelectedUserId(null);
    } catch (err) {
      console.error("Error deleting user:", err);
      setDeleteError("Failed to delete user. Please try again.");
    } finally {
      setLoadingDelete(false);
    }
  };

  // Filter logic
  const filteredUsers = localUsers.filter((user) => {
    // 1. Role filter
    const userRole = user.role || 'USER'; // fallback if role is missing
    if (selectedRole !== "All" && userRole !== selectedRole) {
      return false;
    }
    // 2. Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      const matchName = user.name && user.name.toLowerCase().includes(lowerSearch);
      const matchEmail = user.email && user.email.toLowerCase().includes(lowerSearch);
      return matchName || matchEmail;
    }
    return true;
  });

  console.log("ROLE:", currentUserRole);
  
  if (loading) {
    return (
      <div className="user-list-card">
        <h2 className="user-list-header">Users Management</h2>
        <div className="state-message loading">
          <div className="spinner"></div>
          Loading users...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-card">
        <h2 className="user-list-header">Users Management</h2>
        <div className="state-message error">
          <span>⚠️</span> {error}
        </div>
      </div>
    );
  }

  return (
    <div className="user-list-card">
      <div className="user-list-header-row">
        <div>
          <h2 className="user-list-header">Users Management</h2>
          <span className="user-count">{filteredUsers.length} Users</span>
        </div>
        <button 
          className="btn-add-user" 
          onClick={() => handleProtectedAction(() => setShowCreateModal(true))}
          style={{ opacity: currentUserRole !== 'ADMIN' ? 0.7 : 1 }}
        >
          + Add User
        </button>
      </div>
      
      {permissionError && (
        <div className="state-message error" style={{ marginBottom: '16px', padding: '10px', fontSize: '14px', backgroundColor: '#fff5f5', color: '#e03131', border: '1px solid #ffc9c9', borderRadius: '6px' }}>
          <span>🚫</span> {permissionError}
        </div>
      )}

      {deleteSuccess && (
        <div className="inline-success-message">
          ✓ {deleteSuccess}
        </div>
      )}

      {/* Search and Filter Controls */}
      <div className="filter-search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)}>
            <option value="All">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </div>
      
      {localUsers.length === 0 ? (
        <div className="state-message empty">
          No users found in the system.
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="state-message empty">
          No users match your search criteria.
        </div>
      ) : (
        <div className="table-wrapper">
          <table className="user-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className="fade-out-row">
                  <td className="cell-id">#{user.id}</td>
                  <td className="font-semibold">{user.name}</td>
                  <td className="cell-email">{user.email || 'N/A'}</td>
                  <td>
                    <span className={`role-badge ${user.role === 'ADMIN' ? 'role-admin' : 'role-user'}`}>
                      {user.role || 'USER'}
                    </span>
                  </td>
                  <td className="cell-actions text-right">
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleProtectedAction(() => onEdit && onEdit(user))}
                      style={{ opacity: currentUserRole !== 'ADMIN' ? 0.6 : 1 }}
                    >
                      Edit
                    </button>
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleProtectedAction(() => handleDeleteClick(user.id))}
                      style={{ opacity: currentUserRole !== 'ADMIN' ? 0.6 : 1 }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {selectedUserId && (
        <ConfirmModal
          title="Delete User"
          message="Are you sure you want to delete this user? This action cannot be undone."
          confirmText="Delete"
          loading={loadingDelete}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          variant="danger"
        />
      )}

      {/* Create User Modal */}
      {showCreateModal && (
        <CreateUserModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={handleCreateSuccess} 
        />
      )}
    </div>
  );
}

export default UserList;