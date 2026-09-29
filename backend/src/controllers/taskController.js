import Task from "../models/Task.js";
import User from "../models/User.js";
import { sendEmail } from "../services/emailService.js";
import { taskAssignedTemplate, taskAssignedText } from "../utils/taskEmailTemplate.js";

// Sends the assignment email in the background.
// A failed email is logged but never breaks the API response.
const notifyAssignee = (task, subjectPrefix) => {
  if (!task.assignee?.email) return;

  sendEmail({
    to: task.assignee.email,
    subject: `${subjectPrefix}: ${task.title}`,
    html: taskAssignedTemplate(task),
    text: taskAssignedText(task),
  }).catch((err) =>
    console.error("Task assignment email failed:", err.message)
  );
};

export const createTask = async (req, res) => {
  const { title, description, project, assignee, priority, status, deadline } = req.body;
  try {
    if (!title || !description || !project || !assignee || !deadline) {
      return res.status(400).json({ message: "Title, description, project, assignee and deadline are required" });
    }

    const task = await Task.create({
      title,
      description,
      project,
      assignee,
      priority: priority || "Medium",
      status: status || "assigned",
      deadline,
      createdBy: req.user._id,
    });

    const populatedTask = await Task.findById(task._id)
      .populate("project", "projectName")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email");

    notifyAssignee(populatedTask, "New Task Assigned");

    res.status(201).json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTasks = async (req, res) => {
  try {
    const { project, status, priority, department, assignee, page, limit } = req.query;
    const query = {};
    let sortQuery = { createdAt: -1 }; // Show last assigned/created first

    if (project) {
      query.project = project;
    }
    
    if (status) {
      if (status.toLowerCase() === 'overdue') {
        const startOfToday = new Date();
        startOfToday.setHours(0, 0, 0, 0);

        query.status = { $ne: 'completed' };
        query.deadline = { $lt: startOfToday };
        sortQuery = { deadline: 1 }; // Sort overdue tasks by deadline ascending (oldest first)
      } else {
        query.status = status;
      }
    }
    
    if (priority) {
      // Perform case-insensitive match for priority (e.g. 'high' matches 'High')
      query.priority = { $regex: new RegExp(`^${priority}$`, "i") };
    }

    if (department) {
      // Find all users in this department
      const users = await User.find({ department });
      const userIds = users.map(u => u._id);

      if (assignee) {
        // If both department and assignee are specified, ensure the assignee belongs to that department
        if (userIds.some(id => id.toString() === assignee)) {
          query.assignee = assignee;
        } else {
          // Assignee does not belong to the department: force empty result
          query.assignee = null;
        }
      } else {
        query.assignee = { $in: userIds };
      }
    } else if (assignee) {
      query.assignee = assignee;
    }

    // Pagination logic
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum = (pageNum - 1) * limitNum;

    // Get count of matching tasks
    const totalTasks = await Task.countDocuments(query);

    const tasks = await Task.find(query)
      .populate("project", "projectName")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email")
      .sort(sortQuery)
      .skip(skipNum)
      .limit(limitNum);

    res.json({
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limitNum),
      currentPage: pageNum,
      limit: limitNum
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate("project", "projectName")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email");

    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const { title, description, project, assignee, priority, status, deadline } = req.body;
    const task = await Task.findById(req.params.taskId);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Remember who was assigned before, to detect reassignment
    const previousAssignee = task.assignee.toString();

    if (title) task.title = title;
    if (description) task.description = description;
    if (project) task.project = project;
    if (assignee) task.assignee = assignee;
    if (priority) task.priority = priority;
    if (status) task.status = status;
    if (deadline) task.deadline = deadline;

    await task.save();

    const populatedTask = await Task.findById(task._id)
      .populate("project", "projectName")
      .populate("assignee", "name email department")
      .populate("createdBy", "name email");

    // Notify the new assignee only if the assignee actually changed
    if (assignee && String(assignee) !== previousAssignee) {
      notifyAssignee(populatedTask, "Task Assigned to You");
    }

    res.json(populatedTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};