import React from 'react';
import { Folder, Users, CheckCircle2, AlertCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

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
  // Mock data for charts
  const taskData = [
    { name: 'To Do', value: 2, fill: '#94a3b8' },      // Slate
    { name: 'In Progress', value: 4, fill: '#4f46e5' }, // Indigo
    { name: 'Done', value: 2, fill: '#10b981' },      // Emerald
  ];

  const projectData = [
    { name: 'Dashboard Redesign', value: 75, fill: '#4f46e5' },
    { name: 'Mobile App Launch', value: 40, fill: '#4f46e5' },
    { name: 'Q2 Campaign', value: 15, fill: '#4f46e5' },
  ];

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
          value="3" 
          icon={Folder} 
          colorClass="text-indigo-600" 
          iconBgClass="bg-indigo-50" 
        />
        <MetricCard 
          title="Total Teams" 
          value="3" 
          icon={Users} 
          colorClass="text-purple-600" 
          iconBgClass="bg-purple-50" 
        />
        <MetricCard 
          title="Task Completion" 
          value="25%" 
          icon={CheckCircle2} 
          colorClass="text-emerald-600" 
          iconBgClass="bg-emerald-50" 
        />
        <MetricCard 
          title="Active Blockers" 
          value="2" 
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
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={projectData} layout="vertical" margin={{ top: 20, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#475569', fontSize: 13}} width={150} />
                <Tooltip cursor={{fill: '#f8fafc'}} />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Delayed Tasks Alert */}
      <div className="mt-6 bg-rose-50 border border-rose-100 rounded-xl p-5 flex items-start space-x-4">
        <div className="bg-rose-100 p-2 rounded-full text-rose-600 mt-0.5">
          <AlertCircle className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-rose-700">Delayed Tasks</h3>
          <p className="text-rose-600">6 task(s) past deadline</p>
        </div>
      </div>

      {/* Blockers */}
      <div className="mt-6 bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-800 mb-6">Recent Blockers</h2>
        <div className="space-y-4">
          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
            <div className="flex space-x-3 items-start">
              <div className="text-rose-500 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Missing database credentials for production migration</h4>
                <p className="text-xs text-slate-500">Priya Patel · Database migration</p>
              </div>
            </div>
            <div className="text-xs text-slate-400">4/9/2026</div>
          </div>
          <div className="flex justify-between items-start">
            <div className="flex space-x-3 items-start">
              <div className="text-rose-500 mt-0.5">
                <AlertCircle className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Apple Developer account approval pending</h4>
                <p className="text-xs text-slate-500">James Kim · Push notification service</p>
              </div>
            </div>
            <div className="text-xs text-slate-400">4/8/2026</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
