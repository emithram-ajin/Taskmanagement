import React, { useState } from 'react';
import { Users, Pencil, Trash2, UserPlus } from 'lucide-react';
import CreateTeamModal from '../../components/Modal/CreateTeamModal';
import EditTeamModal from '../../components/Modal/EditTeamModal';
import AddMemberModal from '../../components/Modal/AddMemberModal';

const Teams = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [expandedTeams, setExpandedTeams] = useState({});

  const toggleTeamExpand = (teamId) => {
    setExpandedTeams(prev => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const [teams, setTeams] = useState([
    { id: 1, name: 'Frontend Team', desc: 'Responsible for UI/UX development', date: 'Jan 15, 2026', members: ['Sarah Chen', 'Marcus Rodriguez'] },
    { id: 2, name: 'Backend Team', desc: 'API and database development', date: 'Jan 15, 2026', members: ['Priya Patel', 'James Kim'] },
    { id: 3, name: 'Marketing Team', desc: 'Product marketing and content', date: 'Feb 1, 2026', members: ['Emma Watson'] }
  ]);

  return (
    <div className="p-8 w-full h-full flex flex-col animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Team Management</h1>
          <p className="text-slate-500 mt-1">Create and manage teams</p>
        </div>
        <button 
          onClick={() => setIsCreateModalOpen(true)}
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
                <button 
                  onClick={() => { setTeamToEdit(team); setIsEditModalOpen(true); }}
                  className="hover:text-slate-600 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button className="hover:text-rose-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            
            <p className="text-sm text-slate-600 mb-6">{team.desc}</p>
            
            <div>
              <div className="flex justify-between items-center mb-3">
                <p className="text-xs font-medium text-slate-500">Team Members ({team.members.length})</p>
                <button 
                  onClick={() => { setTeamToEdit(team); setIsAddMemberModalOpen(true); }}
                  className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded transition-colors flex items-center shadow-sm"
                  title="Add Member"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="space-y-2">
                {team.members.slice(0, expandedTeams[team.id] ? team.members.length : 2).map((member, i) => (
                  <div key={i} className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0">
                    <span className="text-slate-700 font-medium">{member}</span>
                  </div>
                ))}
              </div>
              {team.members.length > 2 && (
                <button 
                  onClick={() => toggleTeamExpand(team.id)}
                  className="w-full mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 py-2 rounded transition-colors"
                >
                  {expandedTeams[team.id] ? 'Show less' : `View all ${team.members.length} members`}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <CreateTeamModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} />
      
      <EditTeamModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        team={teamToEdit}
        onSave={(updatedTeam) => {
          setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
          setIsEditModalOpen(false);
        }}
      />

      <AddMemberModal 
        isOpen={isAddMemberModalOpen} 
        onClose={() => setIsAddMemberModalOpen(false)} 
        team={teamToEdit}
        onSave={(updatedTeam) => {
          setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
          setIsAddMemberModalOpen(false);
        }}
      />
    </div>
  );
};

export default Teams;
