import React from "react";
import { useDroppable } from "@dnd-kit/core";
import TaskCard from "./TaskCard";
import "./TaskColumn.css";

const COLUMN_CONFIG = {
  TODO: { title: "To Do", icon: "📋", colorClass: "col-todo" },
  IN_PROGRESS: { title: "In Progress", icon: "⚡", colorClass: "col-progress" },
  DONE: { title: "Done", icon: "✅", colorClass: "col-done" },
};

function TaskColumn({ status, tasks, canEdit, canDelete, isOwner, onEdit, onDelete, loggedInEmail }) {
  const config = COLUMN_CONFIG[status];
  const { isOver, setNodeRef } = useDroppable({
    id: `column-${status}`,
    data: { status },
  });

  return (
    <div className={`kanban-column ${config.colorClass} ${isOver ? "col-drop-active" : ""}`}>
      {/* Column Header */}
      <div className="col-header">
        <div className="col-header-left">
          <span className="col-icon">{config.icon}</span>
          <h3 className="col-title">{config.title}</h3>
          <span className={`col-count ${config.colorClass}-count`}>{tasks.length}</span>
        </div>
      </div>

      {/* Drop Zone */}
      <div ref={setNodeRef} className={`col-drop-zone ${isOver ? "col-zone-active" : ""}`}>
        {tasks.length === 0 ? (
          <div className="col-empty">
            <span className="col-empty-icon">📂</span>
            <p>Drop tasks here</p>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              canEdit={canEdit(task)}
              canDelete={canDelete(task)}
              isOwner={isOwner(task)}
              onEdit={onEdit}
              onDelete={onDelete}
              loggedInEmail={loggedInEmail}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default TaskColumn;
