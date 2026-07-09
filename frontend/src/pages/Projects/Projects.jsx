import React, { useState, useEffect } from 'react';
import { FolderKanban, Pencil, Trash2 } from 'lucide-react';
import CreateProjectModal from '../../components/Modal/CreateProjectModal';
import apiServices from '../../services/apiServices';
import Loader from '../../components/Loader/Loader';

const Projects = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editProject, setEditProject] = useState(null);

  const [projects, setProjects] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [projectsData, teamsData] = await Promise.all([
        apiServices.getProjects(),
        apiServices.getTeams()
      ]);
      setProjects(projectsData);
      setAllTeams(teamsData);
    } catch (error) {
      console.error("Failed to fetch projects data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveProject = async (projectData, projectId) => {
    try {
      if (projectId) {
        await apiServices.updateProject(projectId, projectData);
      } else {
        await apiServices.createProject(projectData);
      }
      await fetchData();
      setIsModalOpen(false);
      setEditProject(null);
    } catch (error) {
      console.error("Failed to save project:", error);
      alert("Failed to save project");
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm("Are you sure you want to delete this project?")) return;
    try {
      await apiServices.deleteProject(projectId);
      setProjects(projects.filter(p => p._id !== projectId));
    } catch (error) {
      console.error("Failed to delete project:", error);
      alert("Failed to delete project");
    }
  };

  return (
    <div className="p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Project Management</h1>
          <p className="text-slate-500 mt-1">Create and track projects</p>
        </div>
        <button 
          onClick={() => {
            setEditProject(null);
            setIsModalOpen(true);
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          + Create Project
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Loading projects..." />
        </div>
      ) : (
      <div className="space-y-6">
        {projects.map(project => (
          <div key={project._id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0 mt-1">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">{project.projectName}</h3>
                  <p className="text-sm text-slate-600 mt-1">{project.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-slate-500">
                    <span className="flex items-center">
                      <svg className="w-4 h-4 mr-1.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex space-x-2 text-slate-400">
                <button 
                  onClick={() => {
                    setEditProject(project);
                    setIsModalOpen(true);
                  }}
                  className="hover:text-slate-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => handleDeleteProject(project._id)}
                  className="hover:text-rose-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="mt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Progress</span>
                <span className="text-sm font-medium text-indigo-600">{project.progress || 0}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div 
                  className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${project.progress || 0}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-6">
              {(project.assignedTeams || []).map((team, index) => (
                <span key={team._id || index} className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-medium rounded-full">
                  {team.teamName || 'Unknown Team'}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      )}

      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditProject(null);
        }} 
        onSave={handleSaveProject}
        allTeams={allTeams}
        project={editProject}
      />
    </div>
  );
};

export default Projects;
