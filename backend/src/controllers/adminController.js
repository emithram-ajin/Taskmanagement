import ProjectDependency from "../models/ProjectDependency.js";
import Scrum from "../models/Scrum.js";
import Project from "../models/Project.js";
import Task from "../models/Task.js";
import Team from "../models/Team.js";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

// ── POST /api/admin/login-as/:userId ───────────────────────
export const adminLoginAs = async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate token for the selected user
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    return res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ── GET /api/admin/dashboard-stats ─────────────────────────
export const getDashboardStats = async (req, res) => {
  try {
    const [
      activeProjects,
      totalTeams,
      totalTasks,
      completedTasks,
      activeBlockers,
      assignedTasks,
      progressTasks,
    ] = await Promise.all([
      // Active Projects = projects NOT in "Completed" status
      Project.countDocuments({ status: { $ne: "Completed" } }),

      // Total Teams
      Team.countDocuments(),

      // Total Tasks across all projects
      Task.countDocuments(),

      // Completed Tasks
      Task.countDocuments({ status: "completed" }),

      // Active Blockers = tasks currently stuck as blocker
      Task.countDocuments({ status: "blocker" }),

      // Assigned Tasks (To Do)
      Task.countDocuments({ status: "assigned" }),

      // Progress Tasks (In Progress)
      Task.countDocuments({ status: "progress" }),
    ]);

    // Task Completion % = (completedTasks / totalTasks) * 100
    const taskCompletion =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return res.status(200).json({
      activeProjects,
      totalTeams,
      taskCompletion,   // e.g. 25  → show as "25%"
      activeBlockers,
      // raw counts for extra detail
      totalTasks,
      completedTasks,
      assignedTasks,
      progressTasks,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const adminGetDependencies = async (req, res) => {
  try {
    const { projectName, dependencyName, page, limit } = req.query;

    const query = {};

    // Optional partial-match filters
    if (projectName) {
      query.projectName = { $regex: projectName, $options: "i" };
    }
    if (dependencyName) {
      query.dependencyName = { $regex: dependencyName, $options: "i" };
    }

    // Pagination
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum  = (pageNum - 1) * limitNum;

    const total = await ProjectDependency.countDocuments(query);

    const dependencies = await ProjectDependency.find(query)
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 }) // newest first
      .skip(skipNum)
      .limit(limitNum);

    return res.status(200).json({
      dependencies,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const adminGetDependencyById = async (req, res) => {
  try {
    const dependency = await ProjectDependency.findById(req.params.id).populate(
      "createdBy",
      "name email role"
    );

    if (!dependency) {
      return res.status(404).json({ message: "Dependency not found." });
    }

    return res.status(200).json({ dependency });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const adminGetScrums = async (req, res) => {
  try {
    const { project, date, userId, page, limit } = req.query;

    const query = {};

    // Filter by project ID — core requirement
    if (project) {
      query.project = project;
    }

    // Filter by a specific date
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dayStart, $lte: dayEnd };
    }

    // Filter by a specific team member
    if (userId) {
      query.submittedBy = userId;
    }

    // Pagination
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum  = (pageNum - 1) * limitNum;

    const total = await Scrum.countDocuments(query);

    const scrums = await Scrum.find(query)
      .populate("submittedBy", "name email department role")
      .populate("project", "projectName status startDate endDate")
      .sort({ date: -1 }) // most recent first
      .skip(skipNum)
      .limit(limitNum);

    return res.status(200).json({
      scrums,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const adminGetScrumById = async (req, res) => {
  try {
    const scrum = await Scrum.findById(req.params.id)
      .populate("submittedBy", "name email department role")
      .populate("project", "projectName status startDate endDate");

    if (!scrum) {
      return res.status(404).json({ message: "Scrum entry not found." });
    }

    return res.status(200).json({ scrum });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const adminGetBlockedTasks = async (req, res) => {
  try {
    const query = { status: "blocker" };
    const { project, assignee } = req.query;

    if (project) query.project = project;
    if (assignee) query.assignee = assignee;

    const blockedTasks = await Task.find(query)
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("blockerAssignee", "name email department")
      .populate("createdBy", "name email")
      .sort({ updatedAt: -1 });

    return res.status(200).json(blockedTasks);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const adminResetTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found." });
    }

    task.status = "assigned";
    task.blockerReason = "";
    task.blockerAssignee = null;
    await task.save();

    const updated = await Task.findById(id)
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("blockerAssignee", "name email department")
      .populate("createdBy", "name email");

    return res.status(200).json({
      message: "Task status changed to assigned successfully.",
      task: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
