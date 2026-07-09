import Scrum from "../../models/Scrum.js";

export const createScrum = async (req, res) => {
  try {
    const { doYesterday, doToday, blockers } = req.body;

    // --- Validation ---
    if (!doYesterday || !doYesterday.trim()) {
      return res
        .status(400)
        .json({ message: "Please describe what you did yesterday (doYesterday)." });
    }
    if (!doToday || !doToday.trim()) {
      return res
        .status(400)
        .json({ message: "Please describe what you plan to do today (doToday)." });
    }

    // Prevent duplicate submission for the same day
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayEnd = new Date();
    todayEnd.setHours(23, 59, 59, 999);

    const existing = await Scrum.findOne({
      submittedBy: req.user._id,
      date: { $gte: todayStart, $lte: todayEnd },
    });

    if (existing) {
      return res.status(409).json({
        message: "You have already submitted a scrum for today. Use PUT to update it.",
        scrumId: existing._id,
      });
    }

    const scrum = await Scrum.create({
      doYesterday: doYesterday.trim(),
      doToday: doToday.trim(),
      blockers: blockers ? blockers.trim() : "None",
      submittedBy: req.user._id,
    });

    return res.status(201).json({
      message: "Scrum standup submitted successfully.",
      scrum,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const getMyScrums = async (req, res) => {
  try {
    const { date, page, limit } = req.query;

    const query = { submittedBy: req.user._id };

    // Filter by a specific date if provided
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      query.date = { $gte: dayStart, $lte: dayEnd };
    }

    // Pagination
    const pageNum  = parseInt(page)  || 1;
    const limitNum = parseInt(limit) || 10;
    const skipNum  = (pageNum - 1) * limitNum;

    const total = await Scrum.countDocuments(query);

    const scrums = await Scrum.find(query)
      .populate("submittedBy", "name email department")
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


export const getScrumById = async (req, res) => {
  try {
    const scrum = await Scrum.findById(req.params.id).populate(
      "submittedBy",
      "name email department"
    );

    if (!scrum) {
      return res.status(404).json({ message: "Scrum entry not found." });
    }

    // Only the owner can view their own scrum via this user route
    if (scrum.submittedBy._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Not your scrum entry." });
    }

    return res.status(200).json({ scrum });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const updateScrum = async (req, res) => {
  try {
    const scrum = await Scrum.findById(req.params.id);

    if (!scrum) {
      return res.status(404).json({ message: "Scrum entry not found." });
    }

    // Only the owner can update
    if (scrum.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Not your scrum entry." });
    }

    const { doYesterday, doToday, blockers } = req.body;

    // Update only provided fields
    if (doYesterday !== undefined) {
      if (!doYesterday.trim()) {
        return res.status(400).json({ message: "doYesterday cannot be empty." });
      }
      scrum.doYesterday = doYesterday.trim();
    }
    if (doToday !== undefined) {
      if (!doToday.trim()) {
        return res.status(400).json({ message: "doToday cannot be empty." });
      }
      scrum.doToday = doToday.trim();
    }
    if (blockers !== undefined) {
      scrum.blockers = blockers.trim() || "None";
    }

    const updated = await scrum.save();

    return res.status(200).json({
      message: "Scrum entry updated successfully.",
      scrum: updated,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const deleteScrum = async (req, res) => {
  try {
    const scrum = await Scrum.findById(req.params.id);

    if (!scrum) {
      return res.status(404).json({ message: "Scrum entry not found." });
    }

    // Only the owner can delete
    if (scrum.submittedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Access denied. Not your scrum entry." });
    }

    await scrum.deleteOne();

    return res.status(200).json({ message: "Scrum entry deleted successfully." });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};
