import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, CheckSquare, KanbanSquare, MessageSquare, AlertCircle, LogOut, X, Menu } from 'lucide-react';

// isOpen and onToggle are controlled by the parent layout so the
// content area can react when the sidebar opens or closes.
const UserSidebar = ({ isOpen, onToggle }) => {
    const location = useLocation();
    const navigate = useNavigate();

    const navItems = [
        { label: 'My Tasks', icon: LayoutGrid, path: '/' },
        { label: 'Task Details', icon: CheckSquare, path: '/taskDetails' },
        { label: 'Kanban Board', icon: KanbanSquare, path: '/kanban' },
        { label: 'Daily Scrum', icon: MessageSquare, path: '/Dailyscrum' },
        { label: 'Report Blockers', icon: AlertCircle, path: '/BlockerTracking' },
    ];

    return (
        <>
            {/* Sidebar */}
            <div
                className={`fixed top-0 left-0 h-screen w-72 bg-slate-900 flex flex-col text-slate-200 font-sans z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Close button - sits inside the sidebar, top right */}
                <button
                    onClick={() => onToggle(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    <X size={16} className="text-white" />
                </button>

                {/* Header */}
                <div className="px-6 pt-6 pb-5">
                    <h1 className="text-2xl font-bold text-white">ProjectFlow</h1>
                    <p className="text-sm text-slate-400 mt-0.5">IT Team Manager</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map(({ label, icon: Icon, path }) => {
                        const active = location.pathname === path;
                        return (
                            <button
                                key={label}
                                onClick={() => navigate(path)}
                                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors cursor-pointer ${active
                                        ? 'bg-indigo-600 text-white'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`}
                            >
                                <Icon size={20} />
                                <span>{label}</span>
                            </button>
                        );
                    })}
                </nav>

                {/* Footer / logout */}
                <div className="px-4 py-4 border-t border-slate-800">
                    <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer">
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </div>

            {/* Open button - shown only when sidebar is closed */}
            {!isOpen && (
                <button
                    onClick={() => onToggle(true)}
                    className="fixed top-4 left-4 w-9 h-9 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-slate-200 hover:bg-slate-800 z-50 transition-colors cursor-pointer"
                >
                    <Menu size={18} />
                </button>
            )}
        </>
    );
};

export default UserSidebar;