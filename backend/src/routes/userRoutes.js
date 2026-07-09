import express from "express";
import {
  getMyTasks,
  postDependency,
  getDependencies,
  getDependencyById,
} from "../controllers/user/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/my-tasks", protect, getMyTasks);
router.post("/dependency", protect, postDependency);
router.get("/dependency", protect, getDependencies);
router.get("/dependency/:id", protect, getDependencyById);

export default router;
