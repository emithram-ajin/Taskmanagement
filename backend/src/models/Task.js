import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
  assignee: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  priority: { type: String, enum: ["High", "Medium", "Low"], default: "Medium" },
  status: { type: String, enum: ["assigned", "blocker", "progress", "completed"], default: "assigned" },
  deadline: { type: Date, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
