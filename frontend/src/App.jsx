import React, { useState, useEffect } from 'react';
import Login from './pages/Auth/Login';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AppRoutes from './routes/AppRoutes';
import { Route, Routes } from 'react-router-dom';

import UserDashboard from './pages/Dashboard/UserDashboard';

import DailyScrum from './pages/Scrum-User/DailyScrum';
import TaskDetails from './pages/Task Details-User/TaskDetails';
import TaskBoard from './pages/kanban-User/kanban';
import BlockerTracking from './pages/Report-User/BlockerTracking';
import Dependencies from './pages/Task Details-User/Dependencies';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const userString = localStorage.getItem('user');
    if (userString) {
      setCurrentUser(JSON.parse(userString));
    }
    setIsInitializing(false);
  }, []);

  const handleLogin = (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', user.token);
    localStorage.setItem('role', user.role);
    setCurrentUser(user);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setCurrentUser(null);
  };

  if (isInitializing) return null;

  if (!currentUser) {
    return <Login onLogin={handleLogin} />;
  }

  // Admin / Superadmin View
  if (currentUser.role === 'admin' || currentUser.role === 'superadmin') {
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
          <Route path="/daily-scrum" element={<DailyScrum />} />
          <Route path="/blocker-tracking" element={<BlockerTracking />} />
          <Route path="/taskDetails/dependencies" element={<Dependencies />} />
        </Routes>
      </UserLayout>
    </>
  );
}

export default App;
