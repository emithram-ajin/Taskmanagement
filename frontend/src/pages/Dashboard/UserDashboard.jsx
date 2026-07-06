import React from 'react';

const UserDashboard = () => {
  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col items-center justify-center">
      <h1 className="text-3xl font-bold text-slate-900 tracking-tight">User Dashboard</h1>
      <p className="text-slate-500 mt-2">Welcome to the standard user view.</p>
      <div className="mt-8 p-6 bg-white rounded-xl border border-slate-200 shadow-sm max-w-lg text-center">
        <p className="text-slate-600">This area will contain tasks and projects assigned specifically to the logged-in user.</p>
      </div>
    </div>
  );
};

export default UserDashboard;
