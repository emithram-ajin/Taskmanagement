import React from 'react';
import Sidebar from '../components/Sidebar/Sidebar';
import Header from '../components/Header/Header';

const AdminLayout = ({ children, onLogout }) => {
  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar onLogout={onLogout} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
