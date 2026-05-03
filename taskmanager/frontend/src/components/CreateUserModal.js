import React, { useState, useEffect, useRef } from "react";
import { createUser } from "../services/api";
import "./CreateUserModal.css";

function CreateUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  const handleOutsideClick = (e) => {
    if (e.target.className === "modal-overlay") {
      onClose();
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 4) {
      newErrors.password = "Password must be at least 4 characters";
    }
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: "" });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await createUser(formData);
      onSuccess(res.data);
    } catch (err) {
      console.error("Error creating user:", err);
      if (err.response?.status === 403) {
        setApiError("Access denied. Only ADMIN users can create new users. Please login with an ADMIN account.");
      } else if (err.response?.status === 401) {
        setApiError("Session expired. Please logout and login again.");
      } else {
        setApiError(err.response?.data?.message || err.response?.data?.error || "Failed to create user. Email might already exist.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOutsideClick}>
      <div className="modal-content create-modal">
        <div className="modal-header">
          <h3>Create New User</h3>
          <button className="btn-close" onClick={onClose} disabled={loading}>&times;</button>
        </div>
        
        {apiError && <div className="modal-error">{apiError}</div>}
        
        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              ref={nameInputRef}
              disabled={loading}
              className={errors.name ? "input-error" : ""}
            />
            {errors.name && <span className="inline-error">{errors.name}</span>}
          </div>
          
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={loading}
              className={errors.email ? "input-error" : ""}
            />
            {errors.email && <span className="inline-error">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={loading}
              className={errors.password ? "input-error" : ""}
            />
            {errors.password && <span className="inline-error">{errors.password}</span>}
          </div>
          
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={formData.role} onChange={handleChange} disabled={loading}>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn-cancel" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-create" 
              disabled={loading}
            >
              {loading ? "Creating..." : "Create User"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateUserModal;
