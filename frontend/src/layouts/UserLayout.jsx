import React, { useState } from 'react';
import UserSidebar from '../components/Sidebar/UserSidebar';
import UserDashboard from '../pages/Dashboard/UserDashboard';

const UserLayout = ({ children, currentUser, onLogout }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar */}
      <UserSidebar isOpen={isSidebarOpen} onToggle={setIsSidebarOpen} onLogout={onLogout} />

      {/* Right side container */}
      <div
        className={`flex-1 flex flex-col min-h-screen overflow-y-auto transition-all duration-300 ${
          isSidebarOpen ? 'ml-72' : 'ml-0'
        }`}
      >
        {/* Header bar */}
        <header className="sticky top-0 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 z-40 w-full shrink-0">
          <div
            className={`flex items-center text-sm font-medium text-slate-900 transition-all duration-300 ${
              isSidebarOpen ? 'pl-0' : 'pl-12'
            }`}
          >
            ProjectFlow User Portal
          </div>
          <div
            title={currentUser?.username ? currentUser.username : 'User'}
            className="w-9 h-9 rounded-full bg-indigo-500 flex items-center justify-center text-white text-sm font-semibold select-none"
          >
            PP
          </div>
        </header>

        {/* Dynamic page content */}
        <main className="flex-1">
          {children || <UserDashboard currentUser={currentUser} onLogout={onLogout} />}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;