import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Team from "../models/Team.js";

// ── Helper: calculate progress stats for a list of projectIds ──
const getProgressMap = async (projectIds) => {
  const stats = await Task.aggregate([
    { $match: { project: { $in: projectIds } } },
    {
      $group: {
        _id: "$project",
        totalTasks:     { $sum: 1 },
        completedTasks: { $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] } },
        assignedTasks:  { $sum: { $cond: [{ $eq: ["$status", "assigned"]  }, 1, 0] } },
        progressTasks:  { $sum: { $cond: [{ $eq: ["$status", "progress"]  }, 1, 0] } },
        blockerTasks:   { $sum: { $cond: [{ $eq: ["$status", "blocker"]   }, 1, 0] } },
      },
    },
  ]);

  // Convert array → map keyed by projectId string
  const map = {};
  for (const s of stats) {
    const total = s.totalTasks || 0;
    map[s._id.toString()] = {
      totalTasks:     total,
      completedTasks: s.completedTasks,
      assignedTasks:  s.assignedTasks,
      progressTasks:  s.progressTasks,
      blockerTasks:   s.blockerTasks,
      progress:       total > 0 ? Math.round((s.completedTasks / total) * 100) : 0,
    };
  }
  return map;
};

export const createProject = async (req, res) => {
  const { projectName, description, startDate, endDate, assignedTeams, status } = req.body;
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
      status: status || "Assigned",
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
    const { status } = req.query;
    const query = {};
    if (status) {
      query.status = status;
    }
    const projects = await Project.find(query)
      .populate("assignedTeams", "teamName")
      .populate("createdBy", "name email");

    // Calculate progress for all projects in one DB call
    const projectIds = projects.map((p) => p._id);
    const progressMap = await getProgressMap(projectIds);

    const result = projects.map((p) => ({
      ...p.toObject(),
      ...(progressMap[p._id.toString()] || {
        totalTasks: 0, completedTasks: 0, assignedTasks: 0,
        progressTasks: 0, blockerTasks: 0, progress: 0,
      }),
    }));

    res.json(result);
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

    const progressMap = await getProgressMap([project._id]);
    const stats = progressMap[project._id.toString()] || {
      totalTasks: 0, completedTasks: 0, assignedTasks: 0,
      progressTasks: 0, blockerTasks: 0, progress: 0,
    };

    res.json({ ...project.toObject(), ...stats });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateProject = async (req, res) => {
  try {
    const { projectName, description, startDate, endDate, assignedTeams, status } = req.body;
    const project = await Project.findById(req.params.projectId);
    
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (projectName) project.projectName = projectName;
    if (description) project.description = description;
    if (startDate) project.startDate = startDate;
    if (endDate) project.endDate = endDate;
    if (Array.isArray(assignedTeams)) project.assignedTeams = assignedTeams;
    if (status) project.status = status;

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
    if (!project) return res.status(404).json({ message: "Project deleted" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ── GET /api/projects/:projectId/progress ───────────────────
export const getProjectProgress = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify project exists
    const project = await Project.findById(projectId).select("projectName status");
    if (!project) return res.status(404).json({ message: "Project not found" });

    const progressMap = await getProgressMap([project._id]);
    const stats = progressMap[project._id.toString()] || {
      totalTasks: 0, completedTasks: 0, assignedTasks: 0,
      progressTasks: 0, blockerTasks: 0, progress: 0,
    };

    res.json({
      projectId:      project._id,
      projectName:    project.projectName,
      projectStatus:  project.status,
      ...stats,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
