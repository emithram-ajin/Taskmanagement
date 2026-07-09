import express from "express";
import { getMyTasks } from "../controllers/user/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Get tasks assigned to the logged-in user
router.get("/my-tasks", protect, getMyTasks);

export default router;
