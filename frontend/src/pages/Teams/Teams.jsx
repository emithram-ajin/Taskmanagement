import React, { useState } from 'react';
import { Users, Pencil, Trash2 } from 'lucide-react';
import CreateTeamModal from '../../components/Modal/CreateTeamModal';

const Teams = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const teams = [
    { id: 1, name: 'Frontend Team', desc: 'Responsible for UI/UX development', date: 'Jan 15, 2026', members: ['Sarah Chen', 'Marcus Rodriguez'] },
    { id: 2, name: 'Backend Team', desc: 'API and database development', date: 'Jan 15, 2026', members: ['Priya Patel', 'James Kim'] },
    { id: 3, name: 'Marketing Team', desc: 'Product marketing and content', date: 'Feb 1, 2026', members: ['Emma Watson'] }
  ];

  return (
    <div className="p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 mt-1">Create and manage teams</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          + Create Team
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teams.map(team => (
          <div key={team.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900">{team.name}</h3>
                  <p className="text-xs text-slate-400">Created {team.date}</p>
                </div>
              </div>
              <div className="flex space-x-2 text-slate-400">
                <button className="hover:text-slate-600 transition-colors"><Pencil className="w-4 h-4" /></button>
                <button className="hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-6 flex-1">{team.desc}</p>
            
            <div>
              <p className="text-xs font-medium text-slate-500 mb-3">Team Members ({team.members.length})</p>
              <div className="space-y-2">
                {team.members.map((member, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700 font-medium">{member}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <CreateTeamModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
};

export default Teams;
