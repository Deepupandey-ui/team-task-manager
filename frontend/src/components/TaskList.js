import React, { useState, useEffect, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from "@dnd-kit/core";
import { getTasks, deleteTask as deleteTaskApi, updateTaskStatus, getTaskStats, getActivities } from "../services/api";
import TaskColumn from "./TaskColumn";
import TaskCard from "./TaskCard";
import CreateTaskModal from "./CreateTaskModal";
import EditTaskModal from "./EditTaskModal";
import ConfirmModal from "./ConfirmModal";
import AnalyticsDashboard from "./AnalyticsDashboard";
import ActivityFeed from "./ActivityFeed";
import "./TaskList.css";

const STATUSES = ["TODO", "IN_PROGRESS", "DONE"];

function TaskList({ currentUserRole, loadMyPerformance }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState("");
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);

  // Drag state
  const [activeTask, setActiveTask] = useState(null);

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

  // DnD Sensors — activation distance prevents accidental drags
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([loadTasks(), loadStats(), loadActivities()]);
    setLoading(false);
  };

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
      setError(null);
      const res = await getTasks();
      setTasks(res.data);
    } catch (err) {
      console.error("Task loading error:", err);
      setError(err.response?.data?.error || "Failed to load tasks.");
    }
  };

  const loadStats = async () => {
    try {
      const res = await getTaskStats();
      setStats(res.data);
    } catch (err) {
      console.error("Stats error:", err);
    }
  };

  const loadActivities = async () => {
    try {
      const res = await getActivities();
      setActivities(res.data);
    } catch (err) {
      console.error("Activities error:", err);
    }
  };

  // Check if task is assigned to current user (ownership = assignment)
  const isTaskOwner = useCallback(
    (task) => task.assignedToEmail === loggedInEmail,
    [loggedInEmail]
  );

  // Can the current user edit this task?
  const canEdit = useCallback(
    (task) => isAdmin || isTaskOwner(task),
    [isAdmin, isTaskOwner]
  );

  // Can the current user delete this task?
  const canDelete = useCallback(
    (task) => isAdmin || isTaskOwner(task),
    [isAdmin, isTaskOwner]
  );

  // ─── CRUD Handlers ───────────────────────────

  const handleCreateSuccess = (newTask) => {
    setTasks((prev) => [newTask, ...prev]);
    setShowCreateModal(false);
    setSuccessMsg("Task created successfully!");
    loadStats();
    loadActivities();
  };

  const handleEditSuccess = (updatedTask) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
    );
    setEditingTask(null);
    setSuccessMsg("Task updated successfully!");
    loadStats();
    loadActivities();
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
      setTasks((prev) => prev.filter((t) => t.id !== deletingTaskId));
      setSuccessMsg("Task deleted successfully!");
      setDeletingTaskId(null);
      loadStats();
      loadActivities();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to delete task.");
      setDeletingTaskId(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ─── Drag & Drop Handlers ───────────────────

  const handleDragStart = (event) => {
    const { active } = event;
    const draggedTask = active.data.current?.task;
    if (draggedTask) {
      setActiveTask(draggedTask);
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const draggedTask = active.data.current?.task;
    if (!draggedTask) return;

    // Determine the target status from the droppable column
    const overData = over.data.current;
    let newStatus = null;

    if (overData?.status) {
      // Dropped directly on a column
      newStatus = overData.status;
    } else {
      // Dropped on another task — find which column that task is in
      const overTaskId = over.id.toString().replace("task-", "");
      const overTask = tasks.find((t) => t.id.toString() === overTaskId);
      if (overTask) {
        newStatus = overTask.status;
      }
    }

    if (!newStatus || newStatus === draggedTask.status) return;

    // Check permission
    if (!canEdit(draggedTask)) {
      setError("You can only move your own tasks.");
      return;
    }

    // Optimistic UI update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((t) =>
        t.id === draggedTask.id ? { ...t, status: newStatus } : t
      )
    );

    const statusLabels = {
      TODO: "To Do",
      IN_PROGRESS: "In Progress",
      DONE: "Done",
    };
    setSuccessMsg(`Moved to ${statusLabels[newStatus]}`);

    // API call
    try {
      await updateTaskStatus(draggedTask.id, newStatus, draggedTask);
      
    if (newStatus === "DONE") {
      const isEarly = draggedTask.dueDate && new Date(draggedTask.completedAt || new Date()) < new Date(draggedTask.dueDate);
      let msg = "🔥 +10 points earned";
      if (isEarly) msg += " | +5 bonus (early completion)";
      setSuccessMsg(msg);
    } else {
      setSuccessMsg(`Moved to ${statusLabels[newStatus]}`);
    }

      
      loadStats();
      loadActivities();
      loadMyPerformance && loadMyPerformance(); // Sync header if available
    } catch (err) {
      console.error("Failed to update task status:", err);
      // Revert on failure
      setTasks(previousTasks);
      setSuccessMsg("");
      setError("Failed to update task status. Reverted.");
    }
  };

  const handleDragCancel = () => {
    setActiveTask(null);
  };

  // ─── Filtering ───────────────────────────────

  const filteredTasks = tasks.filter((task) => {
    // 1. Search Filter (First pass)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      const matchesSearch = 
        (task.title && task.title.toLowerCase().includes(lower)) ||
        (task.description && task.description.toLowerCase().includes(lower)) ||
        (task.userEmail && task.userEmail.toLowerCase().includes(lower));
      if (!matchesSearch) return false;
    }

    // 2. Status/Time Filter
    if (statusFilter === "OVERDUE") {
      return task.overdue;
    }
    if (statusFilter === "DUE_TODAY") {
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const todayLocal = `${year}-${month}-${day}`;
      return task.dueDate && task.dueDate.startsWith(todayLocal);
    }
    if (statusFilter !== "All" && task.status !== statusFilter) {
      return false;
    }

    return true;
  });

  // Group tasks by status for columns
  const getColumnTasks = (status) =>
    filteredTasks.filter((t) => t.status === status);

  // Stats (from unfiltered tasks)
  const todoCount = tasks.filter((t) => t.status === "TODO").length;
  const progressCount = tasks.filter((t) => t.status === "IN_PROGRESS").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

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
    <div className="task-list-card kanban-wrapper">
      {/* Header */}
      <div className="task-list-header-row">
        <div>
          <h2 className="task-list-header">Tasks</h2>
          <span className="task-count">{filteredTasks.length} Tasks</span>
        </div>
        <button
          className="btn-add-task"
          onClick={() => setShowCreateModal(true)}
        >
          + New Task
        </button>
      </div>

      {/* Analytics & Activity Row */}
      <div className="dashboard-top-row">
        <AnalyticsDashboard stats={stats} />
        <ActivityFeed activities={activities} />
      </div>

      {/* Messages */}
      {successMsg && (
        <div className="inline-success-message">✓ {successMsg}</div>
      )}
      {error && (
        <div
          className="state-message error"
          style={{ padding: "12px", marginBottom: "16px" }}
        >
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
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Columns</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
            <option value="OVERDUE">⚠️ Overdue Tasks</option>
            <option value="DUE_TODAY">⏰ Due Today</option>
          </select>
        </div>
      </div>

      {/* Kanban Board */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="kanban-board">
          {STATUSES.filter(
            (s) => statusFilter === "All" || statusFilter === "OVERDUE" || statusFilter === "DUE_TODAY" || statusFilter === s
          ).map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={getColumnTasks(status)}
              canEdit={canEdit}
              canDelete={canDelete}
              isOwner={isTaskOwner}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              loggedInEmail={loggedInEmail}
            />
          ))}
        </div>

        {/* Drag Overlay — ghost card floating with cursor */}
        <DragOverlay dropAnimation={{
          duration: 250,
          easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)",
        }}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              canEdit={canEdit(activeTask)}
              canDelete={canDelete(activeTask)}
              isOwner={isTaskOwner(activeTask)}
              onEdit={() => {}}
              onDelete={() => {}}
              overlay
              loggedInEmail={loggedInEmail}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

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
          currentUserRole={currentUserRole}
        />
      )}

      {/* Edit Task Modal */}
      {editingTask && (
        <EditTaskModal
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSuccess={handleEditSuccess}
          currentUserRole={currentUserRole}
        />
      )}
    </div>
  );
}

export default TaskList;
