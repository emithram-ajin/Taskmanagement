import React, { useState, useEffect, useMemo } from 'react';
import Swal from "sweetalert2";
import { Clock, CheckCircle, AlertCircle, MessageSquare, Calendar, Check, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import userapiservicer from '../../services/userapiServices';

const STATUS_OPTIONS = [
  { key: 'assigned', label: 'To Do' },
  { key: 'progress', label: 'In Progress' },
  { key: 'blocker', label: 'Blocker' },
  { key: 'completed', label: 'Completed' },
];

const UserDashboard = () => {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [hasScrumToday, setHasScrumToday] = useState(false);
  const [loading, setLoading] = useState(true);
  const [openStatusId, setOpenStatusId] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch tasks
      const taskResponse = await userapiservicer.getMyTasks({ limit: 1000 });
      setTasks(taskResponse.tasks || []);

      // Fetch today's standup status
      const todayStr = new Date().toISOString().split('T')[0];
      const scrumResponse = await userapiservicer.getMyScrums({ date: todayStr });
      setHasScrumToday(scrumResponse.total > 0);

    } catch (err) {
      console.error("Error fetching user dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const todoList = useMemo(() => tasks.filter((t) => t.status === 'assigned'), [tasks]);
  const inProgressList = useMemo(() => tasks.filter((t) => t.status === 'progress'), [tasks]);
  const blockerList = useMemo(() => tasks.filter((t) => t.status === 'blocker'), [tasks]);
  const doneList = useMemo(() => tasks.filter((t) => t.status === 'completed'), [tasks]);

  const overdueList = useMemo(() => {
    const now = new Date();
    return tasks.filter((t) => t.deadline && new Date(t.deadline) < now && t.status !== 'completed');
  }, [tasks]);

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
    { label: 'Overdue', value: overdueList.length, icon: AlertCircle, iconBg: 'bg-red-100', iconColor: 'text-red-600' },
  ];

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await userapiservicer.updateTaskStatus(taskId, newStatus);
      // Reload tasks list
      const taskResponse = await userapiservicer.getMyTasks({ limit: 1000 });
      setTasks(taskResponse.tasks || []);
      setOpenStatusId(null);
    } catch (err) {
      console.error("Failed to update status:", err);
      Swal.fire({ title: "Error", text: "Failed to update task status", icon: "error", confirmButtonColor: "#4f46e5" });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading dashboard details...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 w-full">
      {/* Page heading */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">My Tasks</h1>
        <p className="text-slate-500 text-sm mt-1">Your assignments and upcoming deadlines</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 mb-6 sm:mb-8 ">
        {stats.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
          <div
            key={label}
            className="bg-white rounded-2xl border border-slate-200/60 shadow-xs p-6 flex items-center justify-between min-w-0"
          >
            <div className="flex flex-col gap-2 sm:gap-3.5 items-start">
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
                <Icon size={16} className={`sm:w-[18px] sm:h-[18px] ${iconColor}`} />
              </div>
              <p className="text-slate-600 text-sm font-semibold">{label}</p>
            </div>
            <span className="text-3xl sm:text-4xl font-semibold text-slate-900 pr-1 sm:pr-2">{value}</span>
          </div>
        ))}
      </div>

      {/* Info panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-9">
        {/* Overdue Tasks */}
        <div className="bg-red-50 border border-red-200 min-h-[180px] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                <AlertCircle size={18} className="text-red-500" />
              </div>
              <h3 className="font-semibold text-red-900 text-lg">Overdue Tasks</h3>
            </div>
            <div className="space-y-2">
              {overdueList.length > 0 ? (
                overdueList.slice(0, 2).map((task) => (
                  <div key={task._id} className="flex items-center justify-between gap-5 border-b border-red-100/50 pb-1.5 last:border-0 last:pb-0">
                    <span className="text-[#A90836] font-semibold text-sm truncate max-w-[180px]">{task.title}</span>
                    <span className="text-[#C70036] text-xs shrink-0">{task.project?.projectName || 'No Project'}</span>
                  </div>
                ))
              ) : (
                <p className="text-red-600/70 text-sm">Great job! No overdue tasks.</p>
              )}
            </div>
          </div>
          {overdueList.length > 2 && (
            <button
              onClick={() => navigate('/taskDetails?filter=due')}
              className="text-red-700 font-bold text-sm hover:underline cursor-pointer flex items-center mt-4 self-start"
            >
              Click more →
            </button>
          )}
        </div>

        {/* Active Blockers */}
        <div className="bg-amber-50 border border-amber-100 min-h-[180px] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <AlertCircle size={18} className="text-amber-500" />
              </div>
              <h3 className="font-semibold text-amber-900 text-lg">Active Blockers</h3>
            </div>
            <div className="space-y-2">
              {blockerList.length > 0 ? (
                blockerList.slice(0, 2).map((task) => (
                  <div key={task._id} className="border-b border-amber-200/50 pb-1.5 last:border-0 last:pb-0">
                    <p className="text-amber-950 font-semibold text-sm truncate">{task.title}</p>
                    <p className="text-amber-600 text-xs mt-0.5">{task.project?.projectName || 'No Project'}</p>
                  </div>
                ))
              ) : (
                <p className="text-amber-700/70 text-sm">No tasks currently blocked.</p>
              )}
            </div>
          </div>
          {blockerList.length > 2 && (
            <button
              onClick={() => navigate('/taskDetails?status=blocker')}
              className="text-amber-700 font-bold text-sm hover:underline cursor-pointer flex items-center mt-4 self-start"
            >
              Click more →
            </button>
          )}
        </div>

        {/* Daily Scrum */}
      <div className="bg-indigo-50 border border-indigo-100 min-h-[180px] rounded-2xl p-6 flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center">
              <MessageSquare size={18} className="text-indigo-500" />
            </div>
            <h3 className="font-semibold text-indigo-900 text-lg">Daily Scrum</h3>
          </div>
          <p className="text-indigo-700 font-medium text-sm leading-normal">
            {hasScrumToday 
              ? "You have already submitted today's standup update." 
              : "You haven't submitted today's scrum update yet."
            }
          </p>
        </div>
        {!hasScrumToday && (
          <button 
            onClick={() => navigate('/daily-scrum')}
            className="text-indigo-700 font-bold text-sm hover:underline cursor-pointer flex items-center mt-4 self-start"
          >
            Submit Now →
          </button>
        )}
      </div>
      </div>

      {/* Upcoming Deadlines */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 sm:p-8 mb-6 sm:mb-8">
        <h3 className="font-bold text-slate-900 text-lg sm:text-xl mb-4 sm:mb-6">Upcoming Deadlines</h3>
        <div className="divide-y divide-slate-100">
          {tasks.length > 0 ? (
            tasks.slice(0, 5).map(({ _id, title, project, priority, deadline, status }) => (
              <div key={_id} className="py-5 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-slate-950 text-base">{title}</p>
                    <p className="text-slate-500 text-sm mt-0.5">{project?.projectName || 'No Project'}</p>
                    <button
                      onClick={() => setOpenStatusId(openStatusId === _id ? null : _id)}
                      className="text-indigo-600 font-semibold text-sm mt-2.5 hover:text-indigo-700 hover:underline cursor-pointer flex items-center gap-0.5"
                    >
                      Quick status update →
                    </button>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className={`px-2.5 py-0.5 rounded text-xs font-semibold uppercase ${
                      priority?.toLowerCase() === 'high' 
                        ? 'bg-rose-100 text-rose-700' 
                        : priority?.toLowerCase() === 'medium'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {priority || 'Medium'}
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-sm font-medium">
                      <Calendar size={14} />
                      {formatDate(deadline)}
                    </span>
                  </div>
                </div>

                {/* Segmented status control */}
                {openStatusId === _id && (
                  <div className="mt-4 grid grid-cols-4 rounded-lg overflow-hidden border border-slate-200">
                    {STATUS_OPTIONS.map((opt) => {
                      const isActive = status === opt.key;
                      return (
                        <button
                          key={opt.key}
                          onClick={() => handleStatusChange(_id, opt.key)}
                          className={`flex items-center justify-center gap-1.5 py-2.5 text-xs font-semibold transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-indigo-100 text-indigo-900'
                              : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border-r border-slate-200 last:border-r-0'
                          }`}
                        >
                          {isActive && <Check size={12} />}
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-slate-500 text-sm py-4">No upcoming tasks assigned.</p>
          )}
        </div>
      </div>

      {/* Quick status row: In Progress / To Do / My Productivity */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* In Progress quick list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 text-lg mb-4">In Progress</h3>
          {inProgressList.length > 0 ? (
            <ul className="space-y-4">
              {inProgressList.map(({ _id, title, project }) => (
                <li key={_id} className="flex items-start gap-2.5 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0 mt-1.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{project?.projectName || 'No Project'}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No tasks in progress</p>
          )}
        </div>

        {/* To Do quick list */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="font-semibold text-slate-900 text-lg mb-4">To Do</h3>
          {todoList.length > 0 ? (
            <ul className="space-y-4">
              {todoList.map(({ _id, title, project }) => (
                <li key={_id} className="flex items-start gap-2.5 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="w-2 h-2 rounded-full bg-slate-400 shrink-0 mt-1.5" />
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{project?.projectName || 'No Project'}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-400 text-sm">No tasks to do</p>
          )}
        </div>

        {/* My Productivity */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
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