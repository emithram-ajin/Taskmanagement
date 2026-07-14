import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  User,
  FolderKanban, 
  CheckSquare, 
  KanbanSquare, 
  MessageSquare, 
  AlertCircle,
  LogOut,
  FolderGit2
} from 'lucide-react';

const Sidebar = ({ onLogout }) => {
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    if (onLogout) onLogout();
  };
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userInitials = user?.name ? user.name.charAt(0).toUpperCase() : 'A';

  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', path: '/' },
    { icon: Users, label: 'Teams', path: '/teams' },
    { icon: User, label: 'Members', path: '/members' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: CheckSquare, label: 'Tasks', path: '/tasks' },
    { icon: FolderGit2, label: 'Dependencies', path: '/dependencies' },
    { icon: KanbanSquare, label: 'Kanban Board', path: '/kanban' },
    { icon: MessageSquare, label: 'Scrum Updates', path: '/scrum' },
    { icon: AlertCircle, label: 'Blockers', path: '/blockers' },
  ];

  return (
    <>
    <aside className="w-64 bg-slate-900 h-full text-slate-300 flex flex-col font-sans shrink-0">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-semibold text-white tracking-tight">ProjectFlow</h1>
        <p className="text-xs text-slate-500 mt-1">IT Team Manager</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={index}
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                isActive 
                  ? 'bg-indigo-600 text-white' 
                  : 'hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Bottom user profile area placeholder */}
      <div className="p-4 border-t border-slate-800 shrink-0">
        <div className="flex items-center justify-between px-2 hover:bg-slate-800 p-2 rounded-lg transition-colors group">
          <div className="flex items-center space-x-3 truncate">
            <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold shrink-0">
              {userInitials}
            </div>
            <div className="text-sm font-medium text-white truncate pr-2">
              {user?.name || 'Admin User'}
            </div>
          </div>
          <button 
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
            className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-400/10 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
      
      {/* Logout confirmation modal — centered on screen, large, light theme */}
      {showLogoutConfirm && (
        <>
            {/* Soft backdrop dim, fades in behind the modal */}
            <div
                onClick={() => setShowLogoutConfirm(false)}
                className="fixed inset-0 bg-slate-900/40 z-[59] animate-[logout-backdrop-in_0.25s_ease-out]"
            />

            <div className="fixed inset-0 z-[60] flex items-center justify-center px-4 pointer-events-none">
                <div className="w-[480px] max-w-[92vw] pointer-events-auto animate-[logout-toast-in_0.35s_cubic-bezier(0.34,1.56,0.64,1)]">
                    <div className="bg-white border border-slate-200 rounded-2xl shadow-2xl px-8 py-8 flex flex-col gap-6">
                        <div className="flex items-start gap-4">
                            <div className="w-14 h-14 shrink-0 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center">
                                <LogOut size={26} />
                            </div>
                            <div>
                                <p className="text-xl font-bold text-slate-900">Log out?</p>
                                <p className="text-lg text-slate-500 mt-1.5 leading-relaxed">
                                    You'll need to sign in again.
                                </p>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowLogoutConfirm(false)}
                                className="px-5 py-2.5 rounded-xl text-md font-semibold text-slate-600 border border-slate-300 hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                                No
                            </button>
                            <button
                                onClick={confirmLogout}
                                className="px-5 py-2.5 rounded-xl text-md font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors cursor-pointer"
                            >
                                Yes, log out
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes logout-backdrop-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes logout-toast-in {
                    0% { opacity: 0; transform: scale(0.9); }
                    60% { opacity: 1; transform: scale(1.03); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
      )}
    </>
  );
};

export default Sidebar;
