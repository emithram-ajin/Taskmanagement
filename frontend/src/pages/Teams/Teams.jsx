import React, { useState, useEffect } from "react";
import { Users, Pencil, Trash2, UserPlus } from "lucide-react";
import CreateTeamModal from "../../components/Modal/CreateTeamModal";
import EditTeamModal from "../../components/Modal/EditTeamModal";
import AddMemberModal from "../../components/Modal/AddMemberModal";
import apiServices from "../../services/apiServices";
import Loader from "../../components/Loader/Loader";

const Teams = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddMemberModalOpen, setIsAddMemberModalOpen] = useState(false);
  const [teamToEdit, setTeamToEdit] = useState(null);
  const [expandedTeams, setExpandedTeams] = useState({});

  const toggleTeamExpand = (teamId) => {
    setExpandedTeams((prev) => ({ ...prev, [teamId]: !prev[teamId] }));
  };

  const [teams, setTeams] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [teamsData, membersData] = await Promise.all([
        apiServices.getTeams(),
        apiServices.getAllMembers(),
      ]);
      setTeams(teamsData);
      setAllMembers(membersData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (teamData) => {
    try {
      const newTeam = await apiServices.createTeam(teamData);
      // Backend returns minimal team on create without populated members array, so we refetch
      await fetchData();
      setIsCreateModalOpen(false);
    } catch (error) {
      console.error("Failed to create team:", error);
      alert("Failed to create team");
    }
  };

  const handleUpdateTeam = async (teamData) => {
    try {
      await apiServices.updateTeam(teamData._id, teamData);
      await fetchData();
      setIsEditModalOpen(false);
      setIsAddMemberModalOpen(false);
    } catch (error) {
      console.error("Failed to update team:", error);
      alert("Failed to update team");
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (!window.confirm("Are you sure you want to delete this team?")) return;
    try {
      await apiServices.deleteTeam(teamId);
      setTeams(teams.filter((t) => t._id !== teamId));
    } catch (error) {
      console.error("Failed to delete team:", error);
      alert("Failed to delete team");
    }
  };

  return (
    <div className="p-8 w-full h-full overflow-y-auto animate-in fade-in duration-300">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            Team Management
          </h1>
          <p className="text-slate-500 mt-1">Create and manage teams</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-sm"
        >
          + Create Team
        </button>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader message="Loading teams..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-4">
          {teams.map((team) => (
            <div
              key={team._id}
              className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col transition-all hover:shadow-md"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900">
                      {team.teamName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      Created {new Date(team.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex space-x-2 text-slate-400">
                  <button
                    onClick={() => {
                      setTeamToEdit(team);
                      setIsEditModalOpen(true);
                    }}
                    className="hover:text-slate-600 transition-colors"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteTeam(team._id)}
                    className="hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-sm text-slate-600 mb-6">{team.description}</p>

              <div>
                <div className="flex justify-between items-center mb-3">
                  <p className="text-xs font-medium text-slate-500">
                    Team Members ({team.members.length})
                  </p>
                  <button
                    onClick={() => {
                      setTeamToEdit(team);
                      setIsAddMemberModalOpen(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-700 bg-indigo-50 hover:bg-indigo-100 p-1 rounded transition-colors flex items-center shadow-sm"
                    title="Add Member"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-2">
                  {team.members
                    .slice(0, expandedTeams[team._id] ? team.members.length : 2)
                    .map((member, i) => (
                      <div
                        key={member._id || i}
                        className="flex justify-between items-center text-sm py-2 border-b border-slate-50 last:border-0"
                      >
                        <span className="text-slate-700 font-medium">
                          {member.name || "Unknown"}
                        </span>
                      </div>
                    ))}
                </div>
                {team.members.length > 2 && (
                  <button
                    onClick={() => toggleTeamExpand(team._id)}
                    className="w-full mt-3 text-xs font-medium text-indigo-600 hover:text-indigo-700 bg-indigo-50/50 hover:bg-indigo-50 py-2 rounded transition-colors"
                  >
                    {expandedTeams[team._id]
                      ? "Show less"
                      : `View all ${team.members.length} members`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <CreateTeamModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSave={handleCreateTeam}
        allMembers={allMembers}
      />

      <EditTeamModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        team={teamToEdit}
        onSave={handleUpdateTeam}
        allMembers={allMembers}
      />

      <AddMemberModal
        isOpen={isAddMemberModalOpen}
        onClose={() => setIsAddMemberModalOpen(false)}
        team={teamToEdit}
        onSave={handleUpdateTeam}
        allMembers={allMembers}
      />
    </div>
  );
};

export default Teams;
