import React, { useState } from 'react';
import Login from './pages/Auth/Login';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AppRoutes from './routes/AppRoutes';
import { Route, Routes } from 'react-router-dom';
import TaskDetails from './pages/Task Details/TaskDetails';
import UserDashboard from './pages/Dashboard/UserDashboard';
import TaskBoard from './pages/kanban/kanban';

function App() {
  const [currentUser, setCurrentUser] = useState(null);

  const handleLogout = () => {
    setCurrentUser(null);
  };

  if (!currentUser) {
    return <Login onLogin={setCurrentUser} />;
  }

  // Admin View
  if (currentUser.role === 'admin') {
    return (
      <AdminLayout onLogout={handleLogout}>
        <AppRoutes />
      </AdminLayout>
    );
  }

  // User View
  return (
    <>
      <UserLayout currentUser={currentUser} onLogout={handleLogout}>
        <Routes>
          <Route path="/" element={<UserDashboard />} />
          <Route path="/taskDetails" element={<TaskDetails />} />
          <Route path="/kanban" element={<TaskBoard />} />
        </Routes>
      </UserLayout>
    </>
  );
}

export default App;
