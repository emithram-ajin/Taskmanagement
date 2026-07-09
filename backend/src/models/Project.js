import mongoose from "mongoose";

const projectSchema = new mongoose.Schema({
  projectName: { type: String, required: true },
  description: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  assignedTeams: [{ type: mongoose.Schema.Types.ObjectId, ref: "Team" }],
  status: { type: String, enum: ["Assigned", "In Progress", "Completed"], default: "Assigned" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model("Project", projectSchema);
