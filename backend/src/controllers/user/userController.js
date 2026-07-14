import mongoose from "mongoose";
import User from "../../models/User.js";
import Task from "../../models/Task.js";
import ProjectDependency from "../../models/ProjectDependency.js";
import Team from "../../models/Team.js";
import Project from "../../models/Project.js";

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const { status, priority, deadlineFrom, deadlineTo, sortBy, page, limit } = req.query;

    const query = { assignee: userId };

    // Status filter
    if (status) query.status = status;

    // Priority filter
    if (priority) query.priority = priority;

    // Deadline date-range filter
    if (deadlineFrom || deadlineTo) {
      query.deadline = {};
      if (deadlineFrom) query.deadline.$gte = new Date(deadlineFrom);
      if (deadlineTo)   query.deadline.$lte = new Date(deadlineTo);
    }

    // Pagination
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum  = (pageNum - 1) * limitNum;

    // Sort options: deadline (default) | createdAt | priority
    const sortOptions = {
      deadline:  { deadline: 1 },
      createdAt: { createdAt: -1 },
      priority:  { priority: 1 },
    };
    const sort = sortOptions[sortBy] || { deadline: 1 };

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email")
      .sort(sort)
      .skip(skipNum)
      .limit(limitNum);

    res.json({
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limitNum),
      currentPage: pageNum,
      limit: limitNum,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getBlockedTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const blockedTasks = await Task.find({
      assignee: userId,
      status: "blocker", 
    })
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email")
      .sort({ deadline: 1 });

    res.status(200).json(blockedTasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBlockerAssignee = async (req, res) => {
  try {
    const { id } = req.params;
    const { blockerReason, blockerAssignee } = req.body;

    if (!blockerReason || !blockerReason.trim()) {
      return res.status(400).json({
        message: "Blocker reason is required.",
      });
    }

    if (!blockerAssignee) {
      return res.status(400).json({
        message: "Blocker assignee (user ID) is required.",
      });
    }

    const task = await Task.findById(id);

    if (!task) {
      return res.status(404).json({
        message: "Task not found.",
      });
    }

    if (task.assignee.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Unauthorized. Only the task assignee can set a blocker.",
      });
    }

    task.blockerReason = blockerReason;
    task.blockerAssignee = blockerAssignee;
    await task.save();

    const updated = await Task.findById(id)
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("blockerAssignee", "name email department")
      .populate("createdBy", "name email");

    res.status(200).json({
      message: "Blocker assignee updated successfully.",
      task: updated,
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};


export const getMyBlockers = async (req, res) => {
  try {
    const userId = req.user._id;

    const blockers = await Task.find({
      blockerAssignee: userId,
      status: "blocker",
    })
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("blockerAssignee", "name email department")
      .populate("createdBy", "name email")
      .sort({ deadline: 1 });

    res.status(200).json(blockers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getMyDepartmentMembers = async (req, res) => {
  try {
    const department = req.user.department;
    if (!department) {
      return res.status(400).json({ message: "User does not belong to any department." });
    }
    const members = await User.find({ 
      department,
      _id: { $ne: req.user._id }
    }).select("_id name email department");
    res.status(200).json(members);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const postDependency = async (req, res) => {
  try {
    const { projectName, dependencyName, attributes } = req.body;

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({ message: "Project name is required." });
    }
    if (!dependencyName || !dependencyName.trim()) {
      return res.status(400).json({ message: "Dependency name is required." });
    }

    // Validate attributes array (optional, but if provided must contain valid pairs)
    if (attributes !== undefined) {
      if (!Array.isArray(attributes)) {
        return res
          .status(400)
          .json({ message: "Attributes must be an array of { key, value } objects." });
      }

      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];
        if (!attr.key || !attr.key.trim()) {
          return res
            .status(400)
            .json({ message: `Attribute at index ${i} is missing a 'key'.` });
        }
        if (attr.value === undefined || attr.value === null) {
          return res
            .status(400)
            .json({ message: `Attribute at index ${i} is missing a 'value'.` });
        }
      }
    }

    // --- Create & save document ---
    const dependency = new ProjectDependency({
      projectName: projectName.trim(),
      dependencyName: dependencyName.trim(),
      attributes: attributes || [],
      createdBy: req.user._id,
    });

    const saved = await dependency.save();

    return res.status(201).json({
      message: "Dependency created successfully.",
      dependency: saved,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getDependencies = async (req, res) => {
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
      .populate("createdBy", "name email")
      .sort({ createdAt: -1 })   // newest first
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

export const getDependencyById = async (req, res) => {
  try {
    const dependency = await ProjectDependency.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!dependency) {
      return res.status(404).json({ message: "Dependency not found." });
    }

    return res.status(200).json({ dependency });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteDependency = async (req, res) => {
  try {
    const dependency = await ProjectDependency.findByIdAndDelete(req.params.id);

    if (!dependency) {
      return res.status(404).json({ message: "Dependency not found." });
    }

    return res.status(200).json({
      message: "Dependency deleted successfully."
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message
    });
  }
};

export const updateDependency = async (req, res) => {
  try {
    const { projectName, dependencyName, attributes } = req.body;

    const dependency = await ProjectDependency.findById(req.params.id);

    if (!dependency) {
      return res.status(404).json({ message: "Dependency not found." });
    }

    if (!projectName || !projectName.trim()) {
      return res.status(400).json({ message: "Project name is required." });
    }

    if (!dependencyName || !dependencyName.trim()) {
      return res.status(400).json({ message: "Dependency name is required." });
    }

    // Validate attributes
    if (attributes !== undefined) {
      if (!Array.isArray(attributes)) {
        return res.status(400).json({
          message: "Attributes must be an array of { key, value } objects.",
        });
      }

      for (let i = 0; i < attributes.length; i++) {
        const attr = attributes[i];

        if (!attr.key || !attr.key.trim()) {
          return res.status(400).json({
            message: `Attribute at index ${i} is missing a 'key'.`,
          });
        }

        if (attr.value === undefined || attr.value === null) {
          return res.status(400).json({
            message: `Attribute at index ${i} is missing a 'value'.`,
          });
        }
      }
    }

    // Update fields
    dependency.projectName = projectName.trim();
    dependency.dependencyName = dependencyName.trim();
    dependency.attributes = attributes || [];

    const updatedDependency = await dependency.save();

    return res.status(200).json({
      message: "Dependency updated successfully.",
      dependency: updatedDependency,
    });
  } catch (err) {
    return res.status(500).json({
      message: err.message,
    });
  }
};

export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find().select("_id projectName");
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

// ── Update task status (drag-and-drop) ─────────────────────
export const updateTaskStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const VALID_STATUSES = ["assigned", "blocker", "progress", "completed"];
    if (!VALID_STATUSES.includes(status)) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`,
      });
    }

    // Only allow the assignee of the task to update it
    const task = await Task.findOne({ _id: id, assignee: req.user._id });
    if (!task) {
      return res.status(404).json({ message: "Task not found or not assigned to you." });
    }

    task.status = status;
    await task.save();

    const updated = await Task.findById(id)
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email");

    return res.status(200).json({ message: "Status updated successfully.", task: updated });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

