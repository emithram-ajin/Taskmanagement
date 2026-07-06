import React, { useState } from 'react';
import Login from './pages/Auth/Login';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AdminDashboard from './pages/Dashboard/AdminDashboard';
import UserDashboard from './pages/Dashboard/UserDashboard';

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
        <AdminDashboard />
      </AdminLayout>
    );
  }

  // User View
  return (
    <UserLayout currentUser={currentUser} onLogout={handleLogout}>
      <UserDashboard />
    </UserLayout>
  );
}

export default App;
