import React, { useState, useEffect } from "react";
import { getTasks, deleteTask as deleteTaskApi } from "../services/api";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import ConfirmModal from "./ConfirmModal";
import "./TaskList.css";

function TaskList({ currentUserRole }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [deletingTaskId, setDeletingTaskId] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  // Current logged-in user email (for ownership checks)
  const loggedInEmail = localStorage.getItem("email");
  const isAdmin = currentUserRole === "ADMIN";

  useEffect(() => {
    loadTasks();
  }, []);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => setSuccessMsg(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load tasks. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  // Check if current user owns the task
  const isTaskOwner = (task) => {
    return task.userEmail === loggedInEmail;
  };

  // Can the current user edit this task?
  const canEdit = (task) => {
    return isAdmin || isTaskOwner(task);
  };

  // Can the current user delete this task?
  const canDelete = (task) => {
    return isAdmin || isTaskOwner(task);
  };

  const handleCreateSuccess = (newTask) => {
    setTasks([newTask, ...tasks]);
    setShowCreateModal(false);
    setSuccessMsg("Task created successfully!");
  };

  const handleEditSuccess = (updatedTask) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    setEditingTask(null);
    setSuccessMsg("Task updated successfully!");
  };

  const handleEditClick = (task) => {
    if (!canEdit(task)) {
      setError("You can only edit your own tasks.");
      return;
    }
    setEditingTask(task);
  };

  const handleDeleteClick = (task) => {
    if (!canDelete(task)) {
      setError("You can only delete your own tasks.");
      return;
    }
    setDeletingTaskId(task.id);
  };

  const confirmDelete = async () => {
    if (!deletingTaskId) return;
    setDeleteLoading(true);
    try {
      await deleteTaskApi(deletingTaskId);
      setTasks(tasks.filter(t => t.id !== deletingTaskId));
      setSuccessMsg("Task deleted successfully!");
      setDeletingTaskId(null);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403) {
        setError("Access denied: You can only delete your own tasks.");
      } else {
        setError(err.response?.data?.error || "Failed to delete task.");
      }
      setDeletingTaskId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // Status badge helpers
  const getStatusClass = (status) => {
    switch (status) {
      case "TODO": return "status-todo";
      case "IN_PROGRESS": return "status-progress";
      case "DONE": return "status-done";
      default: return "";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "TODO": return "To Do";
      case "IN_PROGRESS": return "In Progress";
      case "DONE": return "Done";
      default: return status;
    }
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    if (statusFilter !== "All" && task.status !== statusFilter) return false;
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      return (
        (task.title && task.title.toLowerCase().includes(lower)) ||
        (task.description && task.description.toLowerCase().includes(lower)) ||
        (task.userEmail && task.userEmail.toLowerCase().includes(lower))
      );
    }
    return true;
  });

  // Stats
  const todoCount = tasks.filter(t => t.status === "TODO").length;
  const progressCount = tasks.filter(t => t.status === "IN_PROGRESS").length;
  const doneCount = tasks.filter(t => t.status === "DONE").length;

  if (loading) {
    return (
      <div className="task-list-card">
        <h2 className="task-list-header">Tasks</h2>
        <div className="state-message loading">
          <div className="spinner"></div>
          Loading tasks...
        </div>
      </div>
    );
  }

  return (
    <div className="task-list-card">
      {/* Header */}
      <div className="task-list-header-row">
        <div>
          <h2 className="task-list-header">Tasks</h2>
          <span className="task-count">{filteredTasks.length} Tasks</span>
        </div>
        <button className="btn-add-task" onClick={() => setShowCreateModal(true)}>
          + New Task
        </button>
      </div>

      {/* Stats Cards */}
      <div className="task-stats">
        <div className="stat-card stat-todo">
          <span className="stat-number">{todoCount}</span>
          <span className="stat-label">To Do</span>
        </div>
        <div className="stat-card stat-progress">
          <span className="stat-number">{progressCount}</span>
          <span className="stat-label">In Progress</span>
        </div>
        <div className="stat-card stat-done">
          <span className="stat-number">{doneCount}</span>
          <span className="stat-label">Done</span>
        </div>
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="inline-success-message">✓ {successMsg}</div>
      )}
      {error && (
        <div className="state-message error" style={{ padding: '12px', marginBottom: '16px' }}>
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Filters */}
      <div className="filter-search-container">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-box">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>

      {/* Task Cards */}
      {filteredTasks.length === 0 ? (
        <div className="state-message empty">
          {tasks.length === 0 ? "No tasks yet. Create your first task!" : "No tasks match your search."}
        </div>
      ) : (
        <div className="task-cards-grid">
          {filteredTasks.map(task => (
            <div key={task.id} className={`task-card fade-out-row ${isTaskOwner(task) ? 'task-own' : ''}`}>
              <div className="task-card-header">
                <span className={`status-badge ${getStatusClass(task.status)}`}>
                  {getStatusLabel(task.status)}
                </span>
                <span className="task-id">#{task.id}</span>
              </div>
              <h3 className="task-title">{task.title}</h3>
              {task.description && (
                <p className="task-description">{task.description}</p>
              )}
              <div className="task-card-footer">
                <div className="task-meta">
                  <span className="task-user" title={task.userEmail}>
                    👤 {task.userName || task.userEmail}
                    {isTaskOwner(task) && <span className="own-badge">You</span>}
                  </span>
                  {task.createdAt && (
                    <span className="task-date">
                      {new Date(task.createdAt).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'short', year: 'numeric'
                      })}
                    </span>
                  )}
                </div>
                <div className="task-actions">
                  {canEdit(task) && (
                    <button
                      className="btn-action btn-edit"
                      onClick={() => handleEditClick(task)}
                    >
                      Edit
                    </button>
                  )}
                  {canDelete(task) && (
                    <button
                      className="btn-action btn-delete"
                      onClick={() => handleDeleteClick(task)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation — Reusable ConfirmModal */}
      {deletingTaskId && (
        <ConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          loading={deleteLoading}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingTaskId(null)}
          variant="danger"
        />
      )}

      {/* Create Task Modal */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

export default TaskList;
