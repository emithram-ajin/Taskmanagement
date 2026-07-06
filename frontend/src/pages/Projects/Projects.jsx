import React, { useState } from 'react';
import { FolderKanban, Pencil, Trash2 } from 'lucide-react';
import CreateProjectModal from '../../components/Modal/CreateProjectModal';

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const projects = [
    { 
      id: 1, 
      name: 'Dashboard Redesign', 
      desc: 'Modernize the admin dashboard with new analytics', 
      dateRange: 'Mar 1 - May 30, 2026', 
      tasks: '1/4',
      progress: 25,
      teams: ['Frontend Team', 'Backend Team']
    },
    { 
      id: 2, 
      name: 'Mobile App Launch', 
      desc: 'Release iOS and Android applications', 
      dateRange: 'Apr 1 - Jul 15, 2026', 
      tasks: '0/2',
      progress: 0,
      teams: ['Frontend Team', 'Backend Team']
    }
  ];

  return (
    <div className="p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 mt-1">Create and track projects</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          + Create Project
        </button>
      </div>

      <div className="space-y-6">
        {projects.map(project => (
          <div key={project.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{project.name}</h3>
                  <p className="text-sm text-slate-600 mt-1">{project.desc}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {project.dateRange}
                    </span>
                    <span>Tasks: {project.tasks}</span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 text-slate-400">
                <button className="hover:text-slate-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button className="hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-sm font-medium text-indigo-600">{project.progress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              {project.teams.map((team, index) => (
                <span key={index} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                  {team}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <CreateProjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Projects;
