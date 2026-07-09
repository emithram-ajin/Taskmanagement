import express from "express";
import {getAllMembers} from "../controllers/authController.js";
import { createTeam, getTeams, addMemberToTeam, updateTeam, deleteTeam } from "../controllers/teamController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.get("/members", protect, authorizeRoles("superadmin", "admin"), getAllMembers);

// Team routes
router.post("/team", protect, authorizeRoles("superadmin", "admin"), createTeam);
router.get("/teams", protect, authorizeRoles("superadmin", "admin"), getTeams);
router.post("/team/add-member", protect, authorizeRoles("superadmin", "admin"), addMemberToTeam);
router.put("/team/:teamId", protect, authorizeRoles("superadmin", "admin"), updateTeam);
router.delete("/team/:teamId", protect, authorizeRoles("superadmin", "admin"), deleteTeam);

export default router;