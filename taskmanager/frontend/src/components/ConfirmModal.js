import React from "react";
import "./ConfirmModal.css";

/**
 * Reusable Confirmation Modal
 * Use for delete confirmations, dangerous actions, etc.
 * 
 * Props:
 *   title       - Modal heading (e.g. "Delete Task")
 *   message     - Confirmation message
 *   confirmText - Text for confirm button (default: "Delete")
 *   cancelText  - Text for cancel button (default: "Cancel")
 *   loading     - Whether action is in progress
 *   onConfirm   - Callback on confirm
 *   onCancel    - Callback on cancel
 *   variant     - "danger" | "warning" (default: "danger")
 */
function ConfirmModal({ 
  title = "Confirm Action",
  message = "Are you sure? This action cannot be undone.",
  confirmText = "Delete",
  cancelText = "Cancel",
  loading = false,
  onConfirm,
  onCancel,
  variant = "danger"
}) {
  const handleOverlayClick = (e) => {
    if (e.target.className === "confirm-modal-overlay" && !loading) {
      onCancel();
    }
  };

  return (
    <div className="confirm-modal-overlay" onClick={handleOverlayClick}>
      <div className="confirm-modal-content">
        <div className="confirm-modal-header">
          <h3>{title}</h3>
        </div>
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-footer">
          <button 
            className="btn-confirm-cancel" 
            onClick={onCancel} 
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className={`btn-confirm-action ${variant === 'danger' ? 'btn-danger' : 'btn-warning'}`}
            onClick={onConfirm} 
            disabled={loading}
          >
            {loading ? "Processing..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
