import React, { useState } from 'react';
import { Flag, User } from 'lucide-react';

const KanbanBoard = () => {
  const [columns, setColumns] = useState([
    {
      title: 'TO DO',
      color: 'slate',
      tasks: [
        { id: 1, title: 'Database migration', desc: 'Migrate analytics data to new schema', date: 'Apr 30', project: 'Dashboard Redesign', assignee: 'James' },
        { id: 2, title: 'Push notification service', desc: 'Implement push notifications for iOS and Android', date: 'May 1', project: 'Mobile App Launch', assignee: 'Priya' }
      ]
    },
    {
      title: 'IN PROGRESS',
      color: 'indigo',
      tasks: [
        { id: 3, title: 'Implement analytics charts', desc: 'Build interactive charts using Recharts library', date: 'Apr 20', project: 'Dashboard Redesign', assignee: 'Sarah' },
        { id: 4, title: 'API endpoint optimization', desc: 'Improve response times for dashboard APIs', date: 'Apr 25', project: 'Dashboard Redesign', assignee: 'Priya' },
        { id: 5, title: 'Mobile UI components', desc: 'Build reusable component library for mobile app', date: 'Apr 15', project: 'Mobile App Launch', assignee: 'Marcus' }
      ]
    },
    {
      title: 'COMPLETED',
      color: 'emerald',
      tasks: [
        { id: 6, title: 'Design new dashboard layout', desc: 'Create wireframes and mockups for the new dashboard', date: 'Mar 15', project: 'Dashboard Redesign', assignee: 'Sarah' },
        { id: 7, title: 'Content strategy document', desc: 'Define messaging and content calendar for Q2', date: 'Apr 5', project: 'Q2 Campaign', assignee: 'Emma' }
      ]
    }
  ]);

  const [activeCol, setActiveCol] = useState(null);

  const handleDragStart = (e, taskId, sourceColTitle) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColTitle', sourceColTitle);
    e.dataTransfer.effectAllowed = 'move';

    setTimeout(() => {
      e.target.classList.add('opacity-40');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-40');
    setActiveCol(null);
  };

  const handleDragOver = (e, colTitle) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeCol !== colTitle) {
      setActiveCol(colTitle);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, targetColTitle) => {
    e.preventDefault();
    setActiveCol(null);

    const taskId = parseInt(e.dataTransfer.getData('taskId'));
    const sourceColTitle = e.dataTransfer.getData('sourceColTitle');

    if (!taskId || !sourceColTitle || sourceColTitle === targetColTitle) return;

    setColumns(prev => {
      const newCols = prev.map(c => ({ ...c, tasks: [...c.tasks] }));
      const sourceCol = newCols.find(c => c.title === sourceColTitle);
      const targetCol = newCols.find(c => c.title === targetColTitle);

      const taskIndex = sourceCol.tasks.findIndex(t => t.id === taskId);
      const [task] = sourceCol.tasks.splice(taskIndex, 1);
      targetCol.tasks.push(task);

      return newCols;
    });
  };

  const getColorClasses = (color, isActive) => {
    const activeClass = isActive ? 'ring-2 ring-offset-2 scale-[1.02] shadow-md transition-all' : 'transition-all';
    switch (color) {
      case 'indigo': return `border-indigo-200 bg-indigo-50/50 ${activeClass} ${isActive ? 'ring-indigo-400' : ''}`;
      case 'emerald': return `border-emerald-200 bg-emerald-50/50 ${activeClass} ${isActive ? 'ring-emerald-400' : ''}`;
      default: return `border-slate-200 bg-slate-50 ${activeClass} ${isActive ? 'ring-slate-400' : ''}`;
    }
  };

  const getHeaderClasses = (color) => {
    switch (color) {
      case 'indigo': return 'text-indigo-700';
      case 'emerald': return 'text-emerald-700';
      default: return 'text-slate-700';
    }
  };

  const getBadgeClasses = (color) => {
    switch (color) {
      case 'indigo': return 'bg-indigo-100 text-indigo-700';
      case 'emerald': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  return (
    <div className="p-8 w-full flex-1 flex flex-col animate-in fade-in duration-300">

      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Task Board</h1>
          <p className="text-slate-500 mt-1">Drag tasks between columns to update status</p>
        </div>
        <select className="px-4 py-2 border border-slate-300 rounded-lg text-sm text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm transition-shadow hover:shadow-md cursor-pointer">
          <option>All Projects</option>
          <option>Dashboard Redesign</option>
          <option>Mobile App Launch</option>
        </select>
      </div>

      {/* Kanban Board Area - flex-auto allows growing with content to avoid internal scrollbars while stretching when empty */}
      <div className="flex-auto overflow-x-auto flex pb-4">
        <div className="flex gap-6 min-w-max items-stretch w-full">

          {columns.map((col, idx) => (
            <div
              key={idx}
              className={`flex-1 min-w-[320px] flex flex-col rounded-xl border ${getColorClasses(col.color, activeCol === col.title)}`}
              onDragOver={(e) => handleDragOver(e, col.title)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.title)}
            >
              <div className="p-4 flex justify-between items-center border-b border-transparent shrink-0">
                <h3 className={`font-semibold text-sm tracking-wide ${getHeaderClasses(col.color)}`}>{col.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClasses(col.color)}`}>
                  {col.tasks.length}
                </span>
              </div>

              <div className="p-4 space-y-4">
                {col.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task.id, col.title)}
                    onDragEnd={handleDragEnd}
                    className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing transform hover:-translate-y-1"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-slate-900 text-sm leading-tight">{task.title}</h4>
                      <Flag className="w-4 h-4 text-rose-500 shrink-0 ml-2" />
                    </div>
                    <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.desc}</p>

                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <div className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {task.date}
                      </div>
                      <div className="flex items-center bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">
                        <User className="w-3 h-3 mr-1" />
                        {task.assignee}
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100">
                      <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{task.project}</span>
                    </div>
                  </div>
                ))}

                {col.tasks.length === 0 && (
                  <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm font-medium">
                    Drop tasks here
                  </div>
                )}
              </div>
            </div>
          ))}

        </div>
      </div>
    </div>
  );
};

export default KanbanBoard;
