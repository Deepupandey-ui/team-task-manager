import axios from "axios";

const API = "http://localhost:8080/users";

export const getUsers = () => axios.get(API);
export const createUser = (data) => axios.post(API + "/create", data);
export const updateUser = (id, data) => axios.put(API + "/" + id, data);
export const deleteUser = (id) => axios.delete(API + "/" + id);