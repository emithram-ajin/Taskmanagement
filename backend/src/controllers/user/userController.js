import Task from "../../models/task.js";

export const getMyTasks = async (req, res) => {
  try {
    const userId = req.user._id;

    const { status, priority, page, limit } = req.query;
    const query = { assignee: userId };

    if (status) query.status = status;
    if (priority) query.priority = priority;

    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("project", "projectName status")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email")
      .sort({ deadline: 1 }) // earliest deadline first
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
