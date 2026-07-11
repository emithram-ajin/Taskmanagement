import express from "express";
import { createProject, getProjects, getProjectById, updateProject, deleteProject, getProjectProgress } from "../controllers/projectController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Project routes
router.post("/",                                         protect, authorizeRoles("superadmin", "admin"), createProject);
router.get("/",                                          protect, getProjects);
router.get("/progress/:projectId/",                       protect, getProjectProgress);
router.get("/:projectId",                                protect, getProjectById);
router.put("/:projectId",                                protect, authorizeRoles("superadmin", "admin"), updateProject);
router.delete("/:projectId",                             protect, authorizeRoles("superadmin", "admin"), deleteProject);

export default router;
