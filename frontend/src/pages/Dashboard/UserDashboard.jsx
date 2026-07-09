import React, { useState, useMemo } from 'react';
import { Clock, CheckCircle, AlertCircle, MessageSquare, Calendar, Check } from 'lucide-react';

const STATUS_OPTIONS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'done', label: 'Done' },
];

const UserDashboard = () => {
  // Single source of truth for the two tracked tasks — status changes here
  // ripple out to Upcoming Deadlines, In Progress, To Do, and Productivity.
  const [tasks, setTasks] = useState([
    { id: 1, task: 'API endpoint optimization', project: 'Dashboard Redesign', priority: 'medium', date: 'Apr 25', status: 'in-progress' },
    { id: 2, task: 'Push notification service', project: 'Mobile App Launch', priority: 'medium', date: 'May 1', status: 'todo' },
  ]);

  const [openStatusId, setOpenStatusId] = useState(null);

  const overdueTasks = ['API endpoint optimization', 'Push notification service'];
  const overdueProjects = ['Dashboard Redesign', 'Mobile App Launch'];
  const activeBlockers = ['Missing database credentials for production migration'];
  const blockerProjects = ['Database migration'];

  const inProgressList = tasks.filter((t) => t.status === 'in-progress');
  const todoList = tasks.filter((t) => t.status === 'todo');
  const doneList = tasks.filter((t) => t.status === 'done');

  const productivity = useMemo(() => {
    const total = tasks.length;
    const completed = doneList.length;
    const active = total - completed;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, active, rate };
  }, [tasks, doneList.length]);

  const stats = [
    { label: 'To Do', value: todoList.length, icon: Clock, iconBg: 'bg-slate-100', iconColor: 'text-slate-500' },
    { label: 'In Progress', value: inProgressList.length, icon: Clock, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
    { label: 'Completed', value: doneList.length, icon: CheckCircle, iconBg: 'bg-emerald-100', iconColor: 'text-emerald-600' },
    { label: 'Overdue', value: 2, icon: AlertCircle, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  ];

  const handleStatusChange = (id, status) => {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
    setOpenStatusId(null);
  };

  return (
    <div className="pl-6 pr-10 py-8 w-full">
      {/* Page heading */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
        <p className="text-slate-500 text-sm mt-1">Your assignments and upcoming deadlines</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 ">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6 flex items-center justify-between min-w-0"
          >
            <div className="flex flex-col gap-3.5 items-start">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon size={18} className={iconColor} />
              </div>
              <p className="text-slate-600 text-md font-semibold">{label}</p>
            </div>
            <span className="text-4xl font-semibold text-slate-900 pr-2">{value}</span>
          </div>
        ))}
      </div>

      {/* Info panels */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-9">
        {/* Overdue Tasks */}
       <div className="bg-red-50 border border-red-200 h-45 rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-red-500" />
            </div>
            <h3 className="font-medium text-red-900 text-xl">Overdue Tasks</h3>
          </div>
          <div className="space-y-2">
            {overdueTasks.map((task, i) => (
              <div key={task} className="flex items-center justify-between gap-5">
                <span className="text-[#A90836] font-semibold text-[16px]">{task}</span>
                <span className="text-[#C70036] text-[13px]">{overdueProjects[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Active Blockers */}
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <AlertCircle size={18} className="text-amber-500" />
            </div>
            <h3 className="font-medium text-amber-900 text-xl">Active Blockers</h3>
          </div>
          <div className="space-y-5">
            {activeBlockers.map((blocker, i) => (
              <div key={blocker}>
                <p className="text-amber-900 font-semibold text-[16px] leading-normal">{blocker}</p>
                <p className="text-amber-600 text-xs mt-0.5">{blockerProjects[i]}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Scrum */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <MessageSquare size={18} className="text-indigo-500" />
            </div>
            <h3 className="font-medium text-indigo-900 text-xl">Daily Scrum</h3>
          </div>
          <p className="text-indigo-700 font-normal text-md leading-normal">
            You haven't submitted today's scrum update yet.
          </p>
          <button className="text-indigo-700 font-semibold text-sm mt-5 hover:underline cursor-pointer flex items-center">
            Submit Now →
          </button>
        </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-8">
        <h3 className="font-bold text-slate-900 text-xl mb-6">Upcoming Deadlines</h3>
        <div className="divide-y divide-slate-100">
          {tasks.map(({ id, task, project, priority, date, status }) => (
            <div key={id} className="py-7 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900 text-base">{task}</p>
                  <p className="text-slate-500 text-sm mt-0.5">{project}</p>
                  <button
                    onClick={() => setOpenStatusId(openStatusId === id ? null : id)}
                    className="text-indigo-600 font-semibold text-sm mt-3 hover:underline cursor-pointer"
                  >
                    Quick status update →
                  </button>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="px-3 py-1 rounded-md bg-amber-100 text-amber-700 text-xs font-semibold capitalize">
                    {priority}
                  </span>
                  <span className="flex items-center gap-1 text-red-600 text-sm font-medium">
                    <Calendar size={14} />
                    {date}
                  </span>
                </div>
              </div>

              {/* Segmented status control */}
              {openStatusId === id && (
                <div className="mt-4 grid grid-cols-3 rounded-lg overflow-hidden border border-slate-200">
                    {STATUS_OPTIONS.map((opt) => {
                        const isActive = status === opt.key;
                        return (
                            <button
                                key={opt.key}
                                onClick={() => handleStatusChange(id, opt.key)}
                                className={`flex items-center justify-center gap-1.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                                    isActive
                                        ? 'bg-indigo-200 text-indigo-900'
                                        : 'bg-slate-50 text-slate-600 hover:bg-slate-100'
                                }`}
                            >
                                {isActive && <Check size={14} />}
                                {opt.label}
                            </button>
                        );
                    })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick status row: In Progress / To Do / My Productivity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* In Progress quick list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 text-lg mb-4">In Progress</h3>
          {inProgressList.length > 0 ? (
            <ul className="space-y-4">
              {inProgressList.map(({ id, task, project }) => (
                <li key={id} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <div>
                    <p className="text-[16px] font-semibold text-slate-900">{task}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{project}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No tasks in progress</p>
          )}
        </div>

        {/* To Do quick list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 text-lg mb-4">To Do</h3>
          {todoList.length > 0 ? (
            <ul className="space-y-4">
              {todoList.map(({ id, task, project }) => (
                <li key={id} className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <div>
                    <p className="text-[16px] font-semibold text-slate-900">{task}</p>
                    <p className="text-sm text-slate-500 mt-0.5">{project}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No tasks to do</p>
          )}
        </div>

        {/* My Productivity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-900 text-lg mb-4">My Productivity</h3>
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-500 text-sm font-medium">Completion Rate</span>
            <span className="text-emerald-600 text-sm font-bold">{productivity.rate}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden mb-5">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${productivity.rate}%` }}
            />
          </div>

          <div className="space-y-3 pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between pt-3">
              <span className="text-slate-500 text-sm">Total Tasks</span>
              <span className="text-slate-900 text-sm font-bold">{productivity.total}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Completed</span>
              <span className="text-emerald-600 text-sm font-bold">{productivity.completed}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500 text-sm">Active</span>
              <span className="text-indigo-600 text-sm font-bold">{productivity.active}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;