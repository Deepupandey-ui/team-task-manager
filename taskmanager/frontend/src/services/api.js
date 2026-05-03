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

// Task APIs
export const getTasks = () => API.get("/tasks");
export const createTask = (data) => API.post("/tasks", data);
export const updateTask = (id, data) => API.put(`/tasks/${id}`, data);
export const deleteTask = (id) => API.delete(`/tasks/${id}`);

export default API;