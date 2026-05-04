import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import "./TaskCard.css";

function TaskCard({ task, canEdit, canDelete, isOwner, onEdit, onDelete, overlay, loggedInEmail }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: `task-${task.id}`,
    data: { task },
  });

  const style = overlay
    ? {}
    : {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        transition: isDragging ? "none" : "transform 200ms ease, box-shadow 200ms ease",
      };

  const getStatusLabel = (status) => {
    switch (status) {
      case "TODO": return "To Do";
      case "IN_PROGRESS": return "In Progress";
      case "DONE": return "Done";
      default: return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "TODO": return "tc-status-todo";
      case "IN_PROGRESS": return "tc-status-progress";
      case "DONE": return "tc-status-done";
      default: return "";
    }
  };

  // Check if task is assigned to the logged-in user
  const isAssignedToMe = task.assignedToEmail === loggedInEmail;
  // Check if task was created by the logged-in user
  const isCreatedByMe = task.userEmail === loggedInEmail;

  // Generate initials for avatar
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // Generate a consistent color from name
  const getAvatarColor = (name) => {
    if (!name) return "#868e96";
    const colors = [
      "#3b5bdb", "#e64980", "#f76707", "#0ca678",
      "#7048e8", "#1098ad", "#d6336c", "#5c940d",
      "#e8590c", "#0b7285", "#5f3dc4", "#2b8a3e",
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const isOverdue = task.overdue;
  const isDueSoon = !isOverdue && task.dueDate && task.status !== "DONE" && (new Date(task.dueDate) - new Date()) < 24 * 60 * 60 * 1000;
  
  const getPerformanceBadge = () => {
    if (task.status !== "DONE" || !task.completedAt || !task.dueDate) return null;
    const completed = new Date(task.completedAt);
    const due = new Date(task.dueDate);
    
    if (completed < new Date(due.getTime() - 24 * 60 * 60 * 1000)) {
      return { text: "⚡ Completed Early", class: "perf-early" };
    } else if (completed <= due) {
      return { text: "✅ On Time", class: "perf-ontime" };
    } else {
      return { text: "⚠️ Completed Late", class: "perf-late" };
    }
  };
  
  const perfBadge = getPerformanceBadge();
  const assignedName = task.assignedToName || task.assignedToEmail || "Unassigned";
  const creatorName = task.userName || task.userEmail;

  return (
    <div
      ref={!overlay ? setNodeRef : undefined}
      className={`task-card-dnd ${isAssignedToMe ? "tc-own" : ""} ${isDragging ? "tc-dragging" : ""} ${overlay ? "tc-overlay" : ""} ${isOverdue ? "tc-overdue" : ""} ${isDueSoon ? "tc-due-soon" : ""}`}
      style={style}
      {...(!overlay ? listeners : {})}
      {...(!overlay ? attributes : {})}
    >
      {/* Top Row: drag grip + status + ID */}
      <div className="tc-drag-handle">
        <span className="tc-grip">⠿</span>
        <span className={`tc-status-badge ${getStatusClass(task.status)}`}>
          {getStatusLabel(task.status)}
        </span>
        {isOverdue && <span className="tc-urgency-badge tc-urgency-overdue">⚠️ OVERDUE</span>}
        {isDueSoon && <span className="tc-urgency-badge tc-urgency-soon">⏰ DUE SOON</span>}
        {perfBadge && <span className={`tc-perf-badge ${perfBadge.class}`}>{perfBadge.text}</span>}
        <span className={`tc-difficulty-badge diff-${task.difficulty?.toLowerCase() || 'medium'}`}>
          {task.difficulty || 'MEDIUM'}
        </span>
        <span className="tc-id">#{task.id}</span>
      </div>

      {/* Title */}
      <h4 className="tc-title">{task.title}</h4>

      {/* Description */}
      {task.description && (
        <p className="tc-description">{task.description}</p>
      )}

      {/* Assigned To — Primary user display */}
      <div className="tc-assigned-row">
        <div
          className="tc-avatar"
          style={{ backgroundColor: getAvatarColor(assignedName) }}
          title={task.assignedToEmail}
        >
          {getInitials(assignedName)}
        </div>
        <div className="tc-assigned-info">
          <span className="tc-assigned-name">
            {assignedName}
            {isAssignedToMe && <span className="tc-you-badge">YOU</span>}
          </span>
          {creatorName && creatorName !== assignedName && (
            <span className="tc-created-by">
              Created by {creatorName}
              {isCreatedByMe && " (You)"}
            </span>
          )}
        </div>
      </div>

      {/* Due Date Row */}
      {task.dueDate && (
        <div className={`tc-due-row ${isOverdue ? "tc-due-overdue" : ""} ${isDueSoon ? "tc-due-soon-text" : ""}`}>
          <span className="tc-due-label">Due: </span>
          <span className="tc-due-value">
            {new Date(task.dueDate).toLocaleString("en-IN", {
              day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
            })}
          </span>
        </div>
      )}

      {/* Footer: date + actions */}
      <div className="tc-footer">
        <div className="tc-meta">
          {task.createdAt && (
            <span className="tc-date">
              {new Date(task.createdAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className="tc-actions" onPointerDown={(e) => e.stopPropagation()}>
          {canEdit && (
            <button className="tc-btn tc-btn-edit" onClick={() => onEdit(task)}>
              ✏️ Edit
            </button>
          )}
          {canDelete && (
            <button className="tc-btn tc-btn-delete" onClick={() => onDelete(task)}>
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default TaskCard;
