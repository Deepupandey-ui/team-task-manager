import React from "react";
import UserForm from "../components/UserForm";
import UserList from "../components/UserList";

function Dashboard() {
  return (
    <div>
      <h1>User Dashboard</h1>
      <UserForm />
      <UserList />
    </div>
  );
}

export default Dashboard;