import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Sidebar/Sidebar';

const AdminLayout = ({ children, onLogout }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar 
        onLogout={onLogout} 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between bg-white border-b border-slate-200 px-4 py-3 shrink-0">
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-xl font-bold text-slate-900">ProjectFlow</h1>
          </div>
        </div>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
