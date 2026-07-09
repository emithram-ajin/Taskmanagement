import Team from "../models/Team.js";

export const createTeam = async (req, res) => {
  const { teamName, description, members } = req.body;
  try {
    if (!teamName || !description) {
      return res.status(400).json({ message: "Team name and description are required" });
    }

    const team = await Team.create({
      teamName,
      description,
      members: members || [],
      createdBy: req.user._id,
    });

    res.status(201).json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTeams = async (req, res) => {
  try {
    const teams = await Team.find({}).populate("members", "name email").populate("createdBy", "name");
    res.json(teams);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addMemberToTeam = async (req, res) => {
  const { teamId, memberId } = req.body;
  try {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (!team.members.includes(memberId)) {
      team.members.push(memberId);
      await team.save();
    }

    res.json(team);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTeam = async (req, res) => {
  const { teamId } = req.params;
  const { teamName, description, members } = req.body;

  try {
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    if (teamName) team.teamName = teamName;
    if (description) team.description = description;
    if (Array.isArray(members)) team.members = members;

    await team.save();

    const updatedTeam = await Team.findById(teamId).populate("members", "name email").populate("createdBy", "name");
    res.json(updatedTeam);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const { teamId } = req.params;
    const team = await Team.findByIdAndDelete(teamId);
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.json({ message: "Team deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
