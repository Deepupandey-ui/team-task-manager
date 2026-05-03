import React, { useState } from "react";
import { updateTask } from "../services/api";
import "./CreateTaskModal.css";

function EditTaskModal({ task, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: task.title || "",
    description: task.description || "",
    status: task.status || "TODO"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
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
      const res = await updateTask(task.id, formData);
      onSuccess(res.data);
    } catch (err) {
      console.error("Error updating task:", err);
      if (err.response?.status === 403) {
        setApiError("Access denied: You can only edit your own tasks.");
      } else {
        setApiError(err.response?.data?.error || "Failed to update task.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && onClose()}>
      <div className="modal-content create-modal">
        <div className="modal-header">
          <h3>Edit Task #{task.id}</h3>
          <button className="btn-close" onClick={onClose} disabled={loading}>&times;</button>
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
              disabled={loading}
              className={errors.title ? "input-error" : ""}
              autoFocus
            />
            {errors.title && <span className="inline-error">{errors.title}</span>}
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={loading}
              rows="4"
              style={{
                width: '100%',
                padding: '12px 16px',
                border: '1px solid #ced4da',
                borderRadius: '6px',
                fontSize: '15px',
                fontFamily: 'inherit',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div className="form-group">
            <label>Status</label>
            <select name="status" value={formData.status} onChange={handleChange} disabled={loading}>
              <option value="TODO">To Do</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="DONE">Done</option>
            </select>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-create" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditTaskModal;
