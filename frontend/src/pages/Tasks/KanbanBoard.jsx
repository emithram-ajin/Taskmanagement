import React, { useState, useEffect, useCallback } from 'react';
import { Flag, User, Loader2 } from 'lucide-react';
import apiServices from '../../services/apiServices';
import Loader from '../../components/Loader/Loader';
import CustomDropdown from '../../components/Dropdown/CustomDropdown';

const COLUMNS = [
  { id: 'assigned', title: 'TO DO', color: 'slate' },
  { id: 'progress', title: 'IN PROGRESS', color: 'indigo' },
  { id: 'blocker', title: 'BLOCKER', color: 'rose' },
  { id: 'completed', title: 'COMPLETED', color: 'emerald' }
];

const PAGE_LIMIT = 10;

function makeColState() {
  return { tasks: [], nextFetchPage: 1, total: 0, loading: true, loadingMore: false };
}

const KanbanBoard = () => {
  const [colData, setColData] = useState(() => {
    const init = {};
    COLUMNS.forEach(c => init[c.id] = makeColState());
    return init;
  });

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [activeColId, setActiveColId] = useState(null);

  const setCol = useCallback((colId, patch) => {
    setColData(prev => ({
      ...prev,
      [colId]: { ...prev[colId], ...(typeof patch === 'function' ? patch(prev[colId]) : patch) }
    }));
  }, []);

  const fetchColPage = useCallback(async (colId, pageToFetch, limitToFetch, projectId, append = false) => {
    try {
      const params = {
        status: colId,
        page: pageToFetch,
        limit: limitToFetch
      };
      if (projectId) {
        params.project = projectId;
      }

      const data = await apiServices.getTasks(params);
      
      setCol(colId, prev => {
        const newTasks = append ? [...prev.tasks, ...(data.tasks || data)] : (data.tasks || data);
        const uniqueTasks = Array.from(new Map(newTasks.map(t => [t._id, t])).values());

        const nextFetchPage = (pageToFetch === 1 && limitToFetch === 20) ? 3 : pageToFetch + 1;

        return {
          tasks: uniqueTasks,
          nextFetchPage,
          total: data.totalTasks !== undefined ? data.totalTasks : uniqueTasks.length,
          loading: false,
          loadingMore: false
        };
      });
    } catch (err) {
      console.error(`Failed to fetch tasks for column ${colId}`, err);
      setCol(colId, { loading: false, loadingMore: false });
    }
  }, [setCol]);

  useEffect(() => {
    let isMounted = true;
    const loadProjects = async () => {
      setIsProjectsLoading(true);
      try {
        const projData = await apiServices.getProjects();
        if (isMounted) {
          setProjects(Array.isArray(projData) ? projData : projData.projects || []);
        }
      } catch (err) {
        console.error("Failed to load projects:", err);
      } finally {
        if (isMounted) setIsProjectsLoading(false);
      }
    };
    loadProjects();
    return () => { isMounted = false; };
  }, []);

  useEffect(() => {
    const init = {};
    COLUMNS.forEach(c => init[c.id] = makeColState());
    setColData(init);

    COLUMNS.forEach(col => {
      fetchColPage(col.id, 1, 20, selectedProjectId, false);
    });
  }, [selectedProjectId, fetchColPage]);

  const handleShowMore = useCallback((colId) => {
    const state = colData[colId];
    if (state.loadingMore || state.tasks.length >= state.total) return;
    setCol(colId, { loadingMore: true });
    fetchColPage(colId, state.nextFetchPage, 10, selectedProjectId, true);
  }, [colData, selectedProjectId, fetchColPage, setCol]);

  const handleDragStart = (e, taskId, sourceColId) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.setData('sourceColId', sourceColId);
    e.dataTransfer.effectAllowed = 'move';
    setTimeout(() => {
      e.target.classList.add('opacity-40');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('opacity-40');
    setActiveColId(null);
  };

  const handleDragOver = (e, colId) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeColId !== colId) {
      setActiveColId(colId);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
  };

  const handleDrop = async (e, targetColId) => {
    e.preventDefault();
    setActiveColId(null);
    const taskId = e.dataTransfer.getData('taskId');
    const sourceColId = e.dataTransfer.getData('sourceColId');

    if (!taskId || !sourceColId || sourceColId === targetColId) return;

    const sourceCol = colData[sourceColId];
    const targetCol = colData[targetColId];
    const taskToMove = sourceCol.tasks.find(t => t._id === taskId);
    if (!taskToMove) return;

    const updatedTask = { ...taskToMove, status: targetColId };

    setCol(sourceColId, prev => ({
      tasks: prev.tasks.filter(t => t._id !== taskId),
      total: Math.max(0, prev.total - 1)
    }));
    setCol(targetColId, prev => ({
      tasks: [updatedTask, ...prev.tasks], // Drop at top
      total: prev.total + 1
    }));

    try {
      await apiServices.updateTaskStatus(taskId, targetColId);
    } catch (error) {
      console.error("Failed to update task status:", error);
      setCol(sourceColId, prev => ({
        tasks: [taskToMove, ...prev.tasks],
        total: prev.total + 1
      }));
      setCol(targetColId, prev => ({
        tasks: prev.tasks.filter(t => t._id !== taskId),
        total: Math.max(0, prev.total - 1)
      }));
    }
  };

  const getColorClasses = (color, isActive) => {
    const activeClass = isActive ? 'ring-2 ring-offset-2 scale-[1.02] shadow-md transition-all' : 'transition-all';
    switch (color) {
      case 'indigo': return `border-indigo-200 bg-indigo-50/50 ${activeClass} ${isActive ? 'ring-indigo-400' : ''}`;
      case 'emerald': return `border-emerald-200 bg-emerald-50/50 ${activeClass} ${isActive ? 'ring-emerald-400' : ''}`;
      case 'rose': return `border-rose-200 bg-rose-50/50 ${activeClass} ${isActive ? 'ring-rose-400' : ''}`;
      default: return `border-slate-200 bg-slate-50 ${activeClass} ${isActive ? 'ring-slate-400' : ''}`;
    }
  };

  const getHeaderClasses = (color) => {
    switch (color) {
      case 'indigo': return 'text-indigo-700';
      case 'emerald': return 'text-emerald-700';
      case 'rose': return 'text-rose-700';
      default: return 'text-slate-700';
    }
  };

  const getBadgeClasses = (color) => {
    switch (color) {
      case 'indigo': return 'bg-indigo-100 text-indigo-700';
      case 'emerald': return 'bg-emerald-100 text-emerald-700';
      case 'rose': return 'bg-rose-100 text-rose-700';
      default: return 'bg-slate-200 text-slate-700';
    }
  };

  const getFlagColor = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'low': return 'text-emerald-500';
      case 'medium': return 'text-amber-500';
      case 'high': return 'text-rose-500';
      default: return 'text-slate-400';
    }
  };

  const isLoading = Object.values(colData).some(c => c.loading) || isProjectsLoading;

  return (
    <div className="p-8 w-full flex-1 flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-center mb-8 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Task Board</h1>
          <p className="text-slate-500 mt-1">Drag tasks between columns to update status</p>
        </div>
        <CustomDropdown 
          value={selectedProjectId}
          onChange={e => setSelectedProjectId(e.target.value)}
          placeholder="All Projects"
          className="min-w-[200px]"
          options={[
            { value: '', label: 'All Projects' },
            ...projects.map(p => ({ value: p._id, label: p.projectName }))
          ]}
        />
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Loading tasks..." />
        </div>
      ) : (
        <div className="flex-auto overflow-x-auto flex pb-4">
          <div className="flex gap-6 min-w-max items-stretch w-full">
            {COLUMNS.map((col) => {
              const state = colData[col.id];
              return (
                <div
                  key={col.id}
                  className={`flex-1 min-w-[300px] flex flex-col rounded-xl border ${getColorClasses(col.color, activeColId === col.id)}`}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                >
                  <div className="p-4 flex justify-between items-center border-b border-transparent shrink-0">
                    <h3 className={`font-semibold text-sm tracking-wide ${getHeaderClasses(col.color)}`}>{col.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${getBadgeClasses(col.color)}`}>
                      {state.total}
                    </span>
                  </div>

                  <div className="p-4 space-y-4">
                    {state.tasks.map(task => (
                      <div
                        key={task._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, task._id, col.id)}
                        onDragEnd={handleDragEnd}
                        className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-grab active:cursor-grabbing transform hover:-translate-y-1"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-semibold text-slate-900 text-sm leading-tight">{task.title}</h4>
                          <Flag className={`w-4 h-4 shrink-0 ml-2 ${getFlagColor(task.priority)}`} />
                        </div>
                        <p className="text-xs text-slate-500 mb-4 line-clamp-2">{task.description}</p>

                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <div className="flex items-center">
                            <svg className="w-3.5 h-3.5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}
                          </div>
                          <div className="flex items-center bg-slate-100 px-2 py-1 rounded-full text-slate-600 font-medium">
                            <User className="w-3 h-3 mr-1" />
                            {task.assignee?.name || 'Unassigned'}
                          </div>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-100">
                          <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-md">{task.project?.projectName || 'Unknown Project'}</span>
                        </div>
                      </div>
                    ))}

                    {state.tasks.length === 0 && !state.loadingMore && (
                      <div className="h-24 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 text-sm font-medium">
                        Drop tasks here
                      </div>
                    )}
                    
                    {state.tasks.length < state.total && (
                      <button
                        onClick={() => handleShowMore(col.id)}
                        disabled={state.loadingMore}
                        className="w-full py-2.5 mt-2 bg-white border border-slate-200 text-slate-600 font-medium rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors flex items-center justify-center shadow-sm"
                      >
                        {state.loadingMore ? (
                          <div className="flex items-center text-indigo-600">
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Loading...
                          </div>
                        ) : (
                          "Show More"
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
