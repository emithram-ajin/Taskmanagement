import React, { useState, useEffect } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import CreateTaskModal from '../../components/Modal/CreateTaskModal';
import apiServices from '../../services/apiServices';
import Loader from '../../components/Loader/Loader';

const TaskList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);

  const [tasks, setTasks] = useState([]);
  const [allProjects, setAllProjects] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [tasksData, projectsData, membersData] = await Promise.all([
        apiServices.getTasks(),
        apiServices.getProjects(),
        apiServices.getAllMembers()
      ]);
      setTasks(tasksData);
      setAllProjects(projectsData);
      setAllMembers(membersData);
    } catch (error) {
      console.error("Failed to fetch task data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveTask = async (taskData, taskId) => {
    try {
      if (taskId) {
        await apiServices.updateTask(taskId, taskData);
      } else {
        await apiServices.createTask(taskData);
      }
      await fetchData();
      setIsModalOpen(false);
      setEditTask(null);
    } catch (error) {
      console.error("Failed to save task:", error);
      alert("Failed to save task");
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      await apiServices.deleteTask(taskId);
      setTasks(tasks.filter(t => t._id !== taskId));
    } catch (error) {
      console.error("Failed to delete task:", error);
      alert("Failed to delete task");
    }
  };

  const getStatusBadge = (status) => {
    switch(status?.toLowerCase()) {
      case 'completed': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium border border-emerald-200">Completed</span>;
      case 'progress': return <span className="px-2.5 py-1 bg-indigo-100 text-indigo-700 rounded text-xs font-medium border border-indigo-200">In Progress</span>;
      case 'assigned': return <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded text-xs font-medium border border-slate-200">To Do</span>;
      case 'blocker': return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded text-xs font-medium border border-rose-200">Blocker</span>;
      default: return null;
    }
  };

  const getPriorityBadge = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return <span className="px-2.5 py-1 bg-rose-100 text-rose-700 rounded text-xs font-medium border border-rose-200">High</span>;
      case 'medium': return <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium border border-amber-200">Medium</span>;
      case 'low': return <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 rounded text-xs font-medium border border-emerald-200">Low</span>;
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
          onClick={() => {
            setEditTask(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          + Create Task
        </button>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex-1 flex items-center justify-center">
          <Loader message="Loading tasks..." />
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1">
          <table className="min-w-full divide-y divide-slate-200">
            <tbody className="bg-white divide-y divide-slate-100">
            {tasks.map((task) => (
              <tr key={task._id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                <td className="px-6 py-4 flex items-center gap-6">
                  <div className="flex-1 min-w-[200px] max-w-[300px]">
                    <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{task.description}</p>
                  </div>
                  
                  <div className="flex-1 min-w-[150px]">
                    <div className="text-xs text-slate-500 mb-1">Project</div>
                    <div className="text-sm font-medium text-slate-700">{task.project?.projectName || 'Unknown'}</div>
                  </div>

                  <div className="w-40 shrink-0">
                    <div className="text-xs text-slate-500 mb-1">Assignee</div>
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-slate-600">
                        {task.assignee?.name?.charAt(0) || '?'}
                      </div>
                      <span className="text-sm font-medium text-slate-700">{task.assignee?.name || 'Unassigned'}</span>
                    </div>
                  </div>

                  <div className="w-32 shrink-0">
                    <div className="text-xs text-slate-500 mb-2">Status</div>
                    {getStatusBadge(task.status)}
                  </div>

                  <div className="w-24 shrink-0">
                    <div className="text-xs text-slate-500 mb-2">Priority</div>
                    {getPriorityBadge(task.priority)}
                  </div>

                  <div className="w-32 shrink-0">
                    <div className="text-xs text-slate-500 mb-1">Deadline</div>
                    <div className="text-sm font-medium text-slate-700">{task.deadline ? new Date(task.deadline).toLocaleDateString() : 'N/A'}</div>
                  </div>

                  <div className="w-20 flex justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => {
                        setEditTask(task);
                        setIsModalOpen(true);
                      }}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(task._id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      )}

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditTask(null);
        }} 
        onSave={handleSaveTask}
        allProjects={allProjects}
        allMembers={allMembers}
        task={editTask}
      />
    </div>
  );
};

export default TaskList;
