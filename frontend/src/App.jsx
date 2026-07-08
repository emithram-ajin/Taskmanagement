import React, { useState } from 'react';
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
          <Route path="/Dailyscrum" element={<DailyScrum />} />
          <Route path="/BlockerTracking" element={<BlockerTracking />} />
          <Route path="/taskDetails/dependencies" element={<Dependencies />} />
        </Routes>
      </UserLayout>
    </>
  );
}

export default App;
