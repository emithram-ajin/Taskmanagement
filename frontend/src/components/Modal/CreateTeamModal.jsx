import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const CreateTeamModal = ({ isOpen, onClose, onSave, allMembers = [] }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTeamName('');
      setDescription('');
      setMembers([]);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const toggleMember = (userId) => {
    if (members.includes(userId)) {
      setMembers(members.filter(m => m !== userId));
    } else {
      setMembers([...members, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    await onSave({ teamName, description, members });
    setIsSubmitting(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Team">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
          <input type="text" required value={teamName} onChange={e => setTeamName(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea rows="3" required value={description} onChange={e => setDescription(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Team Members</label>
          <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto">
            {allMembers.map(user => (
              <label key={user._id} className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                <input type="checkbox" checked={members.includes(user._id)} onChange={() => toggleMember(user._id)} className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex space-x-3 pt-4">
          <button type="submit" disabled={isSubmitting} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            {isSubmitting ? 'Creating...' : 'Create Team'}
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default CreateTeamModal;
