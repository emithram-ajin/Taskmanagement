import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomDropdown from '../Dropdown/CustomDropdown';

const CreateTaskModal = ({ isOpen, onClose, onSave, allProjects = [], allMembers = [], task = null }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [assignee, setAssignee] = useState('');
  const [status, setStatus] = useState('assigned');
  const [priority, setPriority] = useState('Medium');
  const [deadline, setDeadline] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title || '');
        setDescription(task.description || '');
        setProject(task.project?._id || task.project || '');
        setSelectedDepartment(task.assignee?.department || '');
        setAssignee(task.assignee?._id || task.assignee || '');
        setStatus(task.status || 'assigned');
        setPriority(task.priority || 'Medium');
        setDeadline(task.deadline ? new Date(task.deadline).toISOString().split('T')[0] : '');
      } else {
        setTitle('');
        setDescription('');
        setProject('');
        setSelectedDepartment('');
        setAssignee('');
        setStatus('assigned');
        setPriority('Medium');
        setDeadline('');
      }
      setIsSubmitting(false);
    }
  }, [isOpen, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!project || !assignee) {
      alert("Please select a project and an assignee");
      return;
    }
    setIsSubmitting(true);
    await onSave({ title, description, project, assignee, status, priority, deadline }, task?._id);
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={task ? "Edit Task" : "Create Task"}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Task Name</label>
          <input type="text" required value={title} onChange={e => setTitle(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows="3" required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Project</label>
          <CustomDropdown 
            required 
            value={project} 
            onChange={e => setProject(e.target.value)} 
            placeholder="Select a project"
            options={allProjects.map(p => ({ value: p._id, label: p.projectName }))}
          />
        </div>
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
            <CustomDropdown 
              value={selectedDepartment} 
              onChange={e => setSelectedDepartment(e.target.value)} 
              placeholder="All Departments"
              options={[
                { value: '', label: 'All Departments' },
                { value: 'HR', label: 'HR' },
                { value: 'IT', label: 'IT' },
                { value: 'Sales', label: 'Sales' },
                { value: 'Marketing', label: 'Marketing' }
              ]}
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-slate-700 mb-1">Assignee</label>
            <CustomDropdown 
              required 
              value={assignee} 
              onChange={e => setAssignee(e.target.value)} 
              placeholder="Select an assignee"
              options={allMembers
                .filter(m => selectedDepartment === '' || m.department === selectedDepartment)
                .map(m => ({ value: m._id, label: m.name }))
              }
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
          <CustomDropdown 
            required 
            value={priority} 
            onChange={e => setPriority(e.target.value)} 
            placeholder="Select priority"
            options={[
              { value: 'Low', label: 'Low' },
              { value: 'Medium', label: 'Medium' },
              { value: 'High', label: 'High' }
            ]}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Deadline</label>
          <input type="date" required value={deadline} onChange={e => setDeadline(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" />
        </div>
        <div className="flex space-x-3 pt-4">
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {isSubmitting ? 'Saving...' : (task ? 'Update Task' : 'Create Task')}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTaskModal;
