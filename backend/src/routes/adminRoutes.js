import express from "express";
import {getAllMembers} from "../controllers/authController.js";
import { createTeam, getTeams, addMemberToTeam, updateTeam, deleteTeam } from "../controllers/teamController.js";
import { adminGetDependencies, adminGetDependencyById, getDashboardStats, adminLoginAs } from "../controllers/adminController.js";
import { adminGetScrums, adminGetScrumById } from "../controllers/adminController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";

const router = express.Router();

// Dashboard stats & Login As
router.get("/dashboard-stats", protect, authorizeRoles("superadmin", "admin"), getDashboardStats);
router.post("/login-as/:userId", protect, authorizeRoles("superadmin", "admin"), adminLoginAs);

router.get("/members", protect, authorizeRoles("superadmin", "admin"), getAllMembers);

// Team routes
router.post("/team", protect, authorizeRoles("superadmin", "admin"), createTeam);
router.get("/teams", protect, authorizeRoles("superadmin", "admin"), getTeams);
router.post("/team/add-member", protect, authorizeRoles("superadmin", "admin"), addMemberToTeam);
router.put("/team/:teamId", protect, authorizeRoles("superadmin", "admin"), updateTeam);
router.delete("/team/:teamId", protect, authorizeRoles("superadmin", "admin"), deleteTeam);

// Dependency routes (admin only)
router.get("/dependencies",     protect, authorizeRoles("superadmin", "admin"), adminGetDependencies);
router.get("/dependencies/:id", protect, authorizeRoles("superadmin", "admin"), adminGetDependencyById);

// Scrum routes (admin only)
router.get("/scrums",     protect, authorizeRoles("superadmin", "admin"), adminGetScrums);
router.get("/scrums/:id", protect, authorizeRoles("superadmin", "admin"), adminGetScrumById);

export default router;
