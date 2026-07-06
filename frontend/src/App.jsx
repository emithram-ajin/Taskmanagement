import React, { useState } from 'react';
import Login from './pages/Auth/Login';
import AdminLayout from './layouts/AdminLayout';
import UserLayout from './layouts/UserLayout';
import AppRoutes from './routes/AppRoutes';

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
    <UserLayout currentUser={currentUser} onLogout={handleLogout}>
      <div className="p-8 max-w-7xl mx-auto">Standard User View</div>
    </UserLayout>
  );
}

export default App;
