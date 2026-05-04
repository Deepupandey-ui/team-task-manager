import React, { useState } from "react";
import { createUser } from "../services/api";

function UserForm() {
  const [user, setUser] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER"
  });

  const handleChange = (e) => {
    setUser({ ...user, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    createUser(user).then(() => {
      alert("User Created!");
      window.location.reload();
    });
  };

  return (
    <div>
      <h2>Create User</h2>

      <input name="name" placeholder="Name" onChange={handleChange} />
      <input name="email" placeholder="Email" onChange={handleChange} />
      <input name="password" placeholder="Password" onChange={handleChange} />

      <button onClick={handleSubmit}>Create</button>
    </div>
  );
}

export default UserForm;