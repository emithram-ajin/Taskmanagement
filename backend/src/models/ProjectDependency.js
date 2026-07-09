import mongoose from "mongoose";


const keyValueSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const projectDependencySchema = new mongoose.Schema(
  {
    projectName: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
    },
    dependencyName: {
      type: String,
      required: [true, "Dependency name is required"],
      trim: true,
    },
    // Array of key-value pairs — can add multiple
    attributes: {
      type: [keyValueSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.ProjectDependency ||
  mongoose.model("ProjectDependency", projectDependencySchema);
