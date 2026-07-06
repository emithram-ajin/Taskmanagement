import React from 'react';

const UserLayout = ({ children, currentUser, onLogout }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6">
          <div className="flex items-center text-sm font-medium text-slate-900">
            ProjectFlow User Portal
          </div>
          <button 
            onClick={onLogout}
            className="text-sm text-slate-500 hover:text-slate-800"
          >
            Logout ({currentUser?.username})
          </button>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
};

export default UserLayout;
