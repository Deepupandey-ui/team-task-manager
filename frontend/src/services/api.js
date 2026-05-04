import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8080",
});

// Interceptor to add JWT token to requests
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Auth APIs
export const login = (data) => API.post("/auth/login", data);
export const forgotPassword = (data) => API.post("/auth/forgot-password", data);
export const resetPassword = (data) => API.post("/auth/reset-password", data);

// User APIs
export const getUsers = () => API.get("/users");
export const createUser = (data) => API.post("/users/create", data);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const deleteUser = (id) => API.delete(`/users/${id}`);
export const getLeaderboard = () => API.get("/users/leaderboard");
export const getMyPerformance = () => API.get("/users/performance");

// Task APIs
export const getTasks = () => API.get("/tasks");
export const getTaskStats = () => API.get("/tasks/stats");
export const getOverdueTasks = () => API.get("/tasks/overdue");
export const getTodayTasks = () => API.get("/tasks/today");
export const createTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const updateTaskStatus = (id, status, task) =>
  API.put(`/tasks/${id}`, {
    title: task.title,
    description: task.description || "",
    status,
    assignedToId: task.assignedToId || null,
    dueDate: task.dueDate || null,
  });
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

// Activity APIs
export const getActivities = () => API.get("/activities");

export default API;