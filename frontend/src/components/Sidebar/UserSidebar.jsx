import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { LayoutGrid, CheckSquare, KanbanSquare, MessageSquare, AlertCircle, LogOut, X, Menu, ChevronDown, GitBranch } from 'lucide-react';

// isOpen and onToggle are controlled by the parent layout so the
// content area can react when the sidebar opens or closes.
// onLogout is called only after the user confirms via the Yes/No prompt.
const UserSidebar = ({ isOpen, onToggle, onLogout }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const [expandedItem, setExpandedItem] = useState(null);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

    const navItems = [
        { label: 'My Tasks', icon: LayoutGrid, path: '/' },
        {
            label: 'Task Details',
            icon: CheckSquare,
            path: '/taskDetails',
            subItems: [
                { label: 'Dependencies', path: '/taskDetails/dependencies' },
            ],
        },
        { label: 'Kanban Board', icon: KanbanSquare, path: '/kanban' },
        { label: 'Daily Scrum', icon: MessageSquare, path: '/daily-scrum' },
        { label: 'Report Blockers', icon: AlertCircle, path: '/blocker-tracking' },
    ];

    const handleNavClick = (item) => {
        if (item.subItems) {
            setExpandedItem(expandedItem === item.label ? null : item.label);
        }
        navigate(item.path);
    };

    const confirmLogout = () => {
        setShowLogoutConfirm(false);
        onLogout?.();
    };

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
                    {navItems.map((item) => {
                        const { label, icon: Icon, path, subItems } = item;
                        const active = location.pathname === path;
                        const isExpanded = expandedItem === label;

                        return (
                            <div key={label}>
                                <button
                                    onClick={() => handleNavClick(item)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold transition-colors cursor-pointer ${active
                                            ? 'bg-indigo-600 text-white'
                                            : 'text-slate-300 hover:bg-slate-800'
                                        }`}
                                >
                                    <Icon size={20} />
                                    <span className="flex-1 text-left">{label}</span>
                                    {subItems && (
                                        <ChevronDown
                                            size={16}
                                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                        />
                                    )}
                                </button>

                                {subItems && isExpanded && (
                                    <div className="mt-1 ml-4 pl-4 border-l border-slate-800 space-y-1">
                                        {subItems.map((sub) => {
                                            const subActive = location.pathname === sub.path;
                                            return (
                                                <button
                                                    key={sub.label}
                                                    onClick={() => navigate(sub.path)}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${subActive
                                                            ? 'bg-indigo-600/20 text-indigo-300'
                                                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                                                        }`}
                                                >
                                                    <GitBranch size={14} />
                                                    <span>{sub.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </nav>

                {/* Footer / logout */}
                <div className="px-4 py-4 border-t border-slate-800">
                    <button
                        onClick={() => setShowLogoutConfirm(true)}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-base font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition-colors cursor-pointer"
                    >
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
                                            You'll need to sign in again to continue using ProjectFlow.
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

export default UserSidebar;