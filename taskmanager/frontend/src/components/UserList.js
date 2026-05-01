import React, { useEffect, useState } from "react";
import { getUsers, deleteUser } from "../services/api";

function UserList() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    getUsers().then((res) => setUsers(res.data));
  };

  const handleDelete = (id) => {
    deleteUser(id).then(() => {
      alert("Deleted!");
      loadUsers();
    });
  };

  return (
    <div>
      <h2>User List</h2>

      {users.map((u) => (
        <div key={u.id}>
          {u.name} - {u.email}
          <button onClick={() => handleDelete(u.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}

export default UserList;