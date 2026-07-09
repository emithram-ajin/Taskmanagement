import mongoose from "mongoose";

const scrumSchema = new mongoose.Schema(
  {
    // What did you do yesterday?
    doYesterday: {
      type: String,
      required: [true, "Please describe what you did yesterday."],
      trim: true,
    },

    // What will you do today?
    doToday: {
      type: String,
      required: [true, "Please describe what you plan to do today."],
      trim: true,
    },

    // Any blockers / impediments?
    blockers: {
      type: String,
      trim: true,
      default: "None",
    },

    // The user who submitted this standup
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Project this standup is linked to
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: [true, "Project is required."],
    },


    // Date of the standup entry (defaults to today)
    date: {
      type: Date,
      default: () => new Date().setHours(0, 0, 0, 0), // midnight of today
    },
  },
  { timestamps: true }
);

export default mongoose.models.Scrum || mongoose.model("Scrum", scrumSchema);
