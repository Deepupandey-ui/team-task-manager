import React, { useState, useEffect } from "react";
import { createTask, getUsers } from "../services/api";
import "./CreateTaskModal.css";

function CreateTaskModal({ onClose, onSuccess, currentUserRole }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "TODO",
    assignedToId: "",
    dueDate: "",
    difficulty: "MEDIUM",
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // Users list for "Assign To" dropdown
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const isAdmin = currentUserRole === "ADMIN";

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setUsersLoading(true);
    try {
      const res = await getUsers();
      setUsers(res.data);
      // Default: assign to self
      const loggedInEmail = localStorage.getItem("email");
      const self = res.data.find((u) => u.email === loggedInEmail);
      if (self) {
        setFormData((prev) => ({ ...prev, assignedToId: self.id.toString() }));
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setUsersLoading(false);
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.dueDate) {
      newErrors.dueDate = "Due date is required";
    } else {
      const selectedDate = new Date(formData.dueDate);
      if (selectedDate < new Date()) {
        newErrors.dueDate = "Due date cannot be in the past";
      }
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
      const payload = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        assignedToId: formData.assignedToId
          ? parseInt(formData.assignedToId)
          : null,
        dueDate: formData.dueDate || null,
        difficulty: formData.difficulty,
      };
      const res = await createTask(payload);
      onSuccess(res.data);
    } catch (err) {
      console.error("Error creating task:", err);
      setApiError(err.response?.data?.error || "Failed to create task.");
    } finally {
      setLoading(false);
    }
  };

  const loggedInEmail = localStorage.getItem("email");

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target.className === "modal-overlay" && onClose()}
    >
      <div className="modal-content create-modal">
        <div className="modal-header">
          <h3>Create New Task</h3>
          <button className="btn-close" onClick={onClose} disabled={loading}>
            &times;
          </button>
        </div>

        {apiError && <div className="modal-error">{apiError}</div>}

        <form onSubmit={handleSubmit} className="create-form">
          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Enter task title"
              disabled={loading}
              className={errors.title ? "input-error" : ""}
              autoFocus
            />
            {errors.title && (
              <span className="inline-error">{errors.title}</span>
            )}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the task..."
              disabled={loading}
              rows="3"
              style={{
                width: "100%",
                padding: "12px 16px",
                border: "1px solid #ced4da",
                borderRadius: "6px",
                fontSize: "15px",
                fontFamily: "inherit",
                resize: "vertical",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div className="form-row">
            <div className="form-group form-group-half">
              <label>Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div className="form-group form-group-half">
              <label>Difficulty</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                disabled={loading}
                className="difficulty-select"
              >
                <option value="EASY">🟢 EASY (x1)</option>
                <option value="MEDIUM">🟡 MEDIUM (x2)</option>
                <option value="HARD">🔴 HARD (x3)</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>
              Assign To{" "}
              {usersLoading && (
                <span className="field-loading">loading...</span>
              )}
            </label>
            <select
              name="assignedToId"
              value={formData.assignedToId}
              onChange={handleChange}
              disabled={loading || usersLoading}
              className="assign-select"
            >
              <option value="">— Assign to myself —</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name || user.email}
                  {user.email === loggedInEmail ? " (You)" : ""}
                  {user.role ? ` · ${user.role}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Due Date *</label>
            <input
              type="datetime-local"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              disabled={loading}
              className={errors.dueDate ? "input-error" : ""}
            />
            {errors.dueDate && (
              <span className="inline-error">{errors.dueDate}</span>
            )}
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
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? "Creating..." : "Create Task"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateTaskModal;
