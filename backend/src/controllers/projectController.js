import Project from "../models/Project.js";
import Team from "../models/Team.js";

export const createProject = async (req, res) => {
  const { projectName, description, startDate, endDate, assignedTeams } = req.body;
  try {
    if (!projectName || !description || !startDate || !endDate) {
      return res.status(400).json({ message: "Project name, description, start date and end date are required" });
    }

    const project = await Project.create({
      projectName,
      description,
      startDate,
      endDate,
      assignedTeams: assignedTeams || [],
      createdBy: req.user._id,
    });

    const populatedProject = await Project.findById(project._id).populate("assignedTeams", "teamName").populate("createdBy", "name email");
    res.status(201).json(populatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({})
      .populate("assignedTeams", "teamName")
      .populate("createdBy", "name email");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId)
      .populate("assignedTeams", "teamName")
      .populate("createdBy", "name email");
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectName, description, startDate, endDate, assignedTeams } = req.body;
    const project = await Project.findById(req.params.projectId);
    
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (Array.isArray(assignedTeams)) project.assignedTeams = assignedTeams;

    await project.save();
    const populatedProject = await Project.findById(project._id).populate("assignedTeams", "teamName").populate("createdBy", "name email");
    res.json(populatedProject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
