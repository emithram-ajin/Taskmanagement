import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import CreateTaskModal from '../../components/Modal/CreateTaskModal';

const TaskList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tasks = [
    { id: 1, title: 'Design new dashboard layout', desc: 'Create wireframes and mockups for the new dashboard', project: 'Dashboard Redesign', assignee: 'Sarah Chen', status: 'completed', priority: 'high', deadline: 'Mar 15, 2026' },
    { id: 2, title: 'Implement analytics charts', desc: 'Build interactive charts using Recharts library', project: 'Dashboard Redesign', assignee: 'Sarah Chen', status: 'In progress', priority: 'high', deadline: 'Apr 20, 2026' },
    { id: 3, title: 'API endpoint optimization', desc: 'Improve response times for dashboard APIs', project: 'Dashboard Redesign', assignee: 'Priya Patel', status: 'In progress', priority: 'medium', deadline: 'Apr 25, 2026' },
    { id: 4, title: 'Database migration', desc: 'Migrate analytics data to new schema', project: 'Dashboard Redesign', assignee: 'James Kim', status: 'todo', priority: 'high', deadline: 'Apr 30, 2026' },
    { id: 5, title: 'Mobile UI components', desc: 'Build reusable component library for mobile app', project: 'Mobile App Launch', assignee: 'Marcus Rodriguez', status: 'In progress', priority: 'high', deadline: 'Apr 15, 2026' }
  ];

  const getStatusBadge = (status) => {
    switch(status.toLowerCase()) {
      case 'completed': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium border border-emerald-200">completed</span>;
      case 'in progress': return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium border border-indigo-200">In progress</span>;
      case 'todo': return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200">todo</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority.toLowerCase()) {
      case 'high': return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded text-xs font-medium border border-rose-200">high</span>;
      case 'medium': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium border border-amber-200">medium</span>;
      default: return null;
    }
  };

  return (
    <div className="p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Task Management</h1>
          <p className="text-slate-500 mt-1">Create and manage tasks</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          + Create Task
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Task</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Project</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Assignee</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Status</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Priority</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Deadline</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-slate-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="text-sm font-semibold text-slate-900">{task.title}</div>
                  <div className="text-xs text-slate-500 mt-1">{task.desc}</div>
                </td>
                <td className="px-6 py-4 text-sm text-slate-600">{task.project}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{task.assignee}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(task.status)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getPriorityBadge(task.priority)}</td>
                <td className="px-6 py-4 text-sm text-slate-600 whitespace-nowrap">{task.deadline}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-3 text-slate-400">
                    <button className="hover:text-slate-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                    <button className="hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <CreateTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default TaskList;
