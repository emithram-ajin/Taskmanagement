import express from "express";
import { createTask, getTasks, getTaskById, updateTask, deleteTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Task routes
router.post("/", protect, createTask);
router.get("/", protect, getTasks);
router.get("/:taskId", protect, getTaskById);
router.put("/:taskId", protect, updateTask);
router.delete("/:taskId", protect, deleteTask);

export default router;
