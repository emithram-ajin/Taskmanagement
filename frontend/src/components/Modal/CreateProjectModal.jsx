import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const CreateProjectModal = ({ isOpen, onClose, onSave, allTeams = [], project = null }) => {
  const [projectName, setProjectName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [assignedTeams, setAssignedTeams] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (project) {
        setProjectName(project.projectName || '');
        setDescription(project.description || '');
        setStartDate(project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '');
        setEndDate(project.endDate ? new Date(project.endDate).toISOString().split('T')[0] : '');
        setAssignedTeams(project.assignedTeams ? project.assignedTeams.map(t => t._id || t) : []);
      } else {
        setProjectName('');
        setDescription('');
        setStartDate('');
        setEndDate('');
        setAssignedTeams([]);
      }
      setIsSubmitting(false);
    }
  }, [isOpen, project]);

  const toggleTeam = (teamId) => {
    if (assignedTeams.includes(teamId)) {
      setAssignedTeams(assignedTeams.filter(t => t !== teamId));
    } else {
      setAssignedTeams([...assignedTeams, teamId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave({ projectName, description, startDate, endDate, assignedTeams }, project?._id);
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={project ? "Edit Project" : "Create Project"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project Name</label>
          <input type="text" required value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows="3" required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"></textarea>
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Start Date</label>
            <input type="date" required value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">End Date</label>
            <input type="date" required value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Assigned Teams</label>
          <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
            {allTeams.length === 0 && <p className="text-sm text-slate-400 italic">No teams available</p>}
            {allTeams.map(team => (
              <label key={team._id} className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                <input type="checkbox" checked={assignedTeams.includes(team._id)} onChange={() => toggleTeam(team._id)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                <span>{team.teamName}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex space-x-3 pt-4">
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {isSubmitting ? 'Saving...' : (project ? 'Update Project' : 'Create Project')}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateProjectModal;
