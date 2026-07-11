import express from "express";
import {
  getMyTasks,
  postDependency,
  getDependencies,
  getDependencyById,
  getUserProjects,
  updateTaskStatus,
} from "../controllers/user/userController.js";
import {
  createScrum,
  getMyScrums,
  getScrumById,
  updateScrum,
  deleteScrum,
} from "../controllers/user/scrumController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ── Project routes ─────────────────────────────────────────
router.get("/projects", protect, getUserProjects);

// ── Task routes ────────────────────────────────────────────
router.get("/my-tasks", protect, getMyTasks);
router.patch("/my-tasks/status/:id", protect, updateTaskStatus);

// ── Dependency routes ──────────────────────────────────────
router.post("/dependency",     protect, postDependency);
router.get("/dependency",      protect, getDependencies);
router.get("/dependency/:id",  protect, getDependencyById);

// ── Scrum / Daily Standup routes ───────────────────────────
router.post("/scrum",          protect, createScrum);      
router.get("/scrum",           protect, getMyScrums);      
router.get("/scrum/:id",       protect, getScrumById);    
router.put("/scrum/:id",       protect, updateScrum);      
router.delete("/scrum/:id",    protect, deleteScrum);     

export default router;
