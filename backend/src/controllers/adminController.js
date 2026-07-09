import ProjectDependency from "../models/ProjectDependency.js";
import Scrum from "../models/Scrum.js";


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
