import React, { useState, useEffect } from 'react';
import Modal from './Modal';

const EditTeamModal = ({ isOpen, onClose, team, onSave }) => {
  const [name, setName] = useState('');
  const [desc, setDesc] = useState('');
  const [members, setMembers] = useState([]);
  const [selectedNewMember, setSelectedNewMember] = useState('');

  const allUsers = ['Sarah Chen', 'Marcus Rodriguez', 'Priya Patel', 'James Kim', 'Emma Watson'];

  useEffect(() => {
    if (team && isOpen) {
      setName(team.name || '');
      setDesc(team.desc || '');
      setMembers(team.members || []);
    }
  }, [team, isOpen]);

  const toggleMember = (user) => {
    if (members.includes(user)) {
      setMembers(members.filter(m => m !== user));
    } else {
      setMembers([...members, user]);
    }
  };

  const nonMembers = allUsers.filter(u => !members.includes(u));

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({ ...team, name, desc, members });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Edit Team">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Team Name</label>
          <input 
            type="text" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea 
            rows="3" 
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
          ></textarea>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Team Members</label>
          <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-40 overflow-y-auto bg-white mb-3">
            {members.length === 0 && <p className="text-sm text-slate-400 italic">No members yet</p>}
            {members.map(user => (
              <label key={user} className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                <input 
                  type="checkbox" 
                  checked={true}
                  onChange={() => toggleMember(user)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" 
                />
                <span>{user}</span>
              </label>
            ))}
          </div>


        </div>
        <div className="flex space-x-3 pt-4">
          <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg text-sm font-medium transition-colors">
            Update Team
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default EditTeamModal;
