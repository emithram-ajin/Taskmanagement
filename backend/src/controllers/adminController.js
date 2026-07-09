import ProjectDependency from "../models/ProjectDependency.js";

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
