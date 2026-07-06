import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  FolderKanban, 
  CheckSquare, 
  KanbanSquare, 
  MessageSquare, 
  AlertCircle 
} from 'lucide-react';

const Sidebar = () => {
  const navItems = [
    { icon: LayoutDashboard, label: 'Overview', active: true },
    { icon: Users, label: 'Teams' },
    { icon: FolderKanban, label: 'Projects' },
    { icon: CheckSquare, label: 'Tasks' },
    { icon: KanbanSquare, label: 'Kanban Board' },
    { icon: MessageSquare, label: 'Scrum Updates' },
    { icon: AlertCircle, label: 'Blockers' },
  ];

  return (
    <aside className="w-64 bg-slate-900 h-screen text-slate-300 flex flex-col font-sans">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-2xl font-semibold text-white tracking-tight">ProjectFlow</h1>
        <p className="text-xs text-slate-500 mt-1">IT Team Manager</p>
      </div>



      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        {navItems.map((item, index) => (
          <a
            key={index}
            href="#"
            className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
              item.active 
                ? 'bg-indigo-600 text-white' 
                : 'hover:bg-slate-800 hover:text-white'
            }`}
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </a>
        ))}
      </nav>
      
      {/* Bottom user profile area placeholder */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3 px-2">
          <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center text-white font-semibold">
            A
          </div>
          <div>
            <div className="text-sm font-medium text-white">Admin User</div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
