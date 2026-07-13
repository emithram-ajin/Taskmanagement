import React, { useState, useEffect } from 'react';
import { Folder, Users, CheckCircle2, AlertCircle, Loader2, ArrowLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import apiServices from '../../services/apiServices';

const MetricCard = ({ title, value, icon: Icon, colorClass, iconBgClass }) => (
  <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-start justify-between">
      <div className={`p-3 rounded-lg ${iconBgClass}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
      <div className="text-3xl font-bold text-slate-800">{value}</div>
    </div>
    <div className="mt-4 text-sm font-medium text-slate-500">{title}</div>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeProjects: 0,
    totalTeams: 0,
    taskCompletion: 0,
    activeBlockers: 0,
    totalTasks: 0,
    completedTasks: 0,
    assignedTasks: 0,
    progressTasks: 0
  });

  const [projectData, setProjectData] = useState([]);
  const [recentBlockers, setRecentBlockers] = useState([]);
  const [delayedCount, setDelayedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Quick Login As states
  const [departments, setDepartments] = useState([]);
  const [selectedDept, setSelectedDept] = useState(null);
  const [deptUsers, setDeptUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        // Fetch dashboard counts
        const statsData = await apiServices.getDashboardStats();
        setStats(statsData);

        // Fetch projects progress
        const projects = await apiServices.getProjects();
        const formattedProjects = projects.map(p => ({
          name: p.projectName,
          value: p.progress || 0,
          fill: '#4f46e5'
        }));
        setProjectData(formattedProjects);

        // Fetch tasks to filter blockers and delayed tasks
        const tasksResponse = await apiServices.getTasks({ limit: 1000 });
        const allTasks = tasksResponse.tasks || [];

        // 1. Recent Blockers
        const blockers = allTasks.filter(t => t.status === 'blocker');
        setRecentBlockers(blockers.slice(0, 5)); // Keep top 5

        // 2. Delayed Tasks (past deadline and not completed)
        const now = new Date();
        const delayed = allTasks.filter(t => {
          return t.deadline && new Date(t.deadline) < now && t.status !== 'completed';
        });
        setDelayedCount(delayed.length);

        // Fetch Departments for Quick Login As
        const deptResponse = await apiServices.getDepartments();
        setDepartments(deptResponse.departments || []);

      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Fetch users when department is clicked
  const handleDepartmentClick = async (dept) => {
    try {
      setLoadingUsers(true);
      setSelectedDept(dept);
      const users = await apiServices.getAllMembers(dept);
      setDeptUsers(users || []);
    } catch (err) {
      console.error("Error fetching department users:", err);
    } finally {
      setLoadingUsers(false);
    }
  };

  // Perform actual user switcher
  const handleQuickLogin = async (userId) => {
    try {
      const data = await apiServices.adminLoginAs(userId);
      localStorage.setItem('user', JSON.stringify(data));
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      window.location.href = '/'; // Reload to mount user layout
    } catch (err) {
      console.error("Login as failed:", err);
      alert("Failed to switch user session");
    }
  };

  // Format Task Distribution data for chart
  const taskData = [
    { name: 'To Do', value: stats.assignedTasks, fill: '#94a3b8' },
    { name: 'In Progress', value: stats.progressTasks, fill: '#4f46e5' },
    { name: 'Done', value: stats.completedTasks, fill: '#10b981' },
    { name: 'Blocker', value: stats.activeBlockers, fill: '#ef4444' }
  ];

  if (loading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[500px] gap-3">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-slate-500 font-medium text-sm">Loading overview data...</p>
      </div>
    );
  }

  return (
    <div className="p-8 w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Overview</h1>
        <p className="text-slate-500 mt-1">Key metrics and system status</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard 
          title="Active Projects" 
          value={stats.activeProjects} 
          icon={Folder} 
          colorClass="text-indigo-600" 
          iconBgClass="bg-indigo-50" 
        />
        <MetricCard 
          title="Total Teams" 
          value={stats.totalTeams} 
          icon={Users} 
          colorClass="text-purple-600" 
          iconBgClass="bg-purple-50" 
        />
        <MetricCard 
          title="Task Completion" 
          value={`${stats.taskCompletion}%`} 
          icon={CheckCircle2} 
          colorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50" 
        />
        <MetricCard 
          title="Active Blockers" 
          value={stats.activeBlockers} 
          icon={AlertCircle} 
          colorClass="text-rose-600" 
          iconBgClass="bg-rose-50" 
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Distribution */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Task Distribution</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={taskData} margin={{ top: 20, right: 30, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={60}>
                  {
                    taskData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))
                  }
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Project Completion Rate */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Project Completion Rate</h2>
          <div className="h-64">
            {projectData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={projectData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13}} width={150} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={32} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">
                No active projects found
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Delayed Tasks Alert */}
      {delayedCount > 0 && (
        <div className="mt-6 bg-rose-50 border border-rose-100 rounded-xl p-5 flex items-start space-x-4">
          <div className="bg-rose-100 p-2 rounded-full text-rose-600 mt-0.5">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-rose-700">Delayed Tasks</h3>
            <p className="text-rose-600">{delayedCount} task(s) past deadline</p>
          </div>
        </div>
      )}

      {/* Bottom Grid */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blockers */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col lg:col-span-2">
          <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Blockers</h2>
          <div className="space-y-4 flex-1">
            {recentBlockers.length > 0 ? (
              recentBlockers.map((task, idx) => (
                <div key={task._id || idx} className={`flex justify-between items-start ${idx < recentBlockers.length - 1 ? 'border-b border-slate-100 pb-4' : ''}`}>
                  <div className="flex space-x-3 items-start">
                    <div className="text-rose-500 mt-0.5">
                      <AlertCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-slate-900">{task.title}</h4>
                      <p className="text-xs text-slate-500">
                        {task.assignee?.name || 'Unassigned'} · {task.project?.projectName || 'No Project'}
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-slate-400">
                    {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm py-8">
                No active blocker tasks found
              </div>
            )}
          </div>
        </div>

        {/* Quick Login As */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-800 mb-1">Quick Login As</h2>
            <p className="text-sm text-slate-500">View any team member's dashboard</p>
          </div>
          
          <div className="space-y-3 flex-1">
            {!selectedDept ? (
              // 1. Show Departments
              departments.length > 0 ? (
                departments.map((dept, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleDepartmentClick(dept)}
                    className="w-full flex items-center justify-between p-3.5 rounded-xl bg-slate-50 hover:bg-indigo-50/50 hover:border-indigo-100 border border-slate-100 transition-all group text-left cursor-pointer"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-semibold group-hover:bg-indigo-100 transition-colors">
                        {dept.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold text-slate-700 group-hover:text-indigo-700 transition-colors">
                        {dept}
                      </span>
                    </div>
                    <ChevronRight size={16} className="text-slate-400 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5 duration-150" />
                  </button>
                ))
              ) : (
                <div className="text-slate-400 text-sm py-4 text-center">No departments available</div>
              )
            ) : (
              // 2. Show Users inside selected department
              <div className="flex flex-col h-full">
                <button
                  onClick={() => { setSelectedDept(null); setDeptUsers([]); }}
                  className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 mb-4 self-start cursor-pointer hover:-translate-x-0.5 transition-transform"
                >
                  <ArrowLeft size={14} /> Back to Departments
                </button>

                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {selectedDept} Department
                </div>

                {loadingUsers ? (
                  <div className="flex items-center justify-center py-8 gap-2">
                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                    <span className="text-xs text-slate-400">Loading users...</span>
                  </div>
                ) : deptUsers.length > 0 ? (
                  <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                    {deptUsers.map((user, idx) => (
                      <button
                        key={user._id || idx}
                        onClick={() => handleQuickLogin(user._id)}
                        className="w-full flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-indigo-50/50 transition-colors border border-transparent group text-left cursor-pointer"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                            {user.name?.charAt(0) || '?'}
                          </div>
                          <span className="text-sm font-medium text-slate-700">{user.name}</span>
                        </div>
                        <div className="text-slate-400 group-hover:text-indigo-600 transition-colors">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="text-slate-400 text-sm py-4 text-center">No users in this department</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
