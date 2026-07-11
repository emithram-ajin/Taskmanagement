import React from 'react';
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
            onClick={() => {
              if (window.confirm("Are you sure you want to log out?")) {
                onLogout();
              }
            }}
            title="Logout"
            className="text-slate-400 hover:text-rose-400 transition-colors p-1.5 rounded-lg hover:bg-rose-400/10 shrink-0 opacity-0 group-hover:opacity-100 focus:opacity-100"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
