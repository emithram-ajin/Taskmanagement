import mongoose from "mongoose";
import Task from "../../models/task.js";
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

export const getUserProjects = async (req, res) => {
  try {
    const projects = await Project.find().select("_id projectName");
    return res.status(200).json(projects);
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

