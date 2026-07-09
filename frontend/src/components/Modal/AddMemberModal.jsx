import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import CustomDropdown from '../Dropdown/CustomDropdown';

const AddMemberModal = ({ isOpen, onClose, team, onSave, allMembers = [] }) => {
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only show users who are not already in the team
  const teamMemberIds = team?.members?.map(m => m._id || m) || [];
  const nonMembers = allMembers.filter(u => !teamMemberIds.includes(u._id));

  useEffect(() => {
    if (isOpen) {
      setSelectedMembers([]);
      setSelectedDepartment('');
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const toggleMember = (userId) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(m => m !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (team) {
      setIsSubmitting(true);
      await onSave({ 
        _id: team._id,
        teamName: team.teamName,
        description: team.description,
        members: [...teamMemberIds, ...selectedMembers] 
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Add Members to ${team?.name || 'Team'}`}>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <p className="text-sm text-slate-500 mb-4">Select the members you want to add to this team.</p>
          <div className="mb-2 mt-4">
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
          <div className="border border-slate-200 rounded-lg p-3 space-y-2 max-h-60 overflow-y-auto bg-white mb-3">
            {nonMembers.filter(u => selectedDepartment === '' || u.department === selectedDepartment).length === 0 && <p className="text-sm text-slate-400 italic">No users available.</p>}
            {nonMembers
              .filter(u => selectedDepartment === '' || u.department === selectedDepartment)
              .map(user => (
              <label key={user._id} className="flex items-center space-x-3 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 p-2 rounded transition-colors">
                <input 
                  type="checkbox" 
                  checked={selectedMembers.includes(user._id)}
                  onChange={() => toggleMember(user._id)}
                  className="rounded text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer" 
                />
                <span>{user.name}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="flex space-x-3 pt-4 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={selectedMembers.length === 0}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Add Selected Members
          </button>
          <button type="button" onClick={onClose} className="flex-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 py-2 rounded-lg text-sm font-medium transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default AddMemberModal;
