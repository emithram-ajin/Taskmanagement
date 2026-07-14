import express from "express";
import { register, login, deleteUser, getDepartments,getMyProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";
import { authorizeRoles } from "../middleware/rbacMiddleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", protect, getMyProfile);

// Superadmin only
router.get("/superadmin", protect, authorizeRoles("superadmin"), (req, res) => {
  res.json({ message: "Welcome Superadmin" });
});

// Admin and Superadmin
router.get("/admin", protect, authorizeRoles("superadmin", "admin"), (req, res) => {
  res.json({ message: "Welcome Admin" });
});

// Member, Admin and Superadmin
router.get("/member", protect, authorizeRoles("superadmin", "admin", "member"), (req, res) => {
  res.json({ message: "Welcome Member" });
});

// Delete user (Superadmin and Admin only)
router.delete("/:userId", protect, authorizeRoles("superadmin", "admin"), deleteUser);

// Get all departments (any authenticated user)
router.get("/departments", protect, getDepartments);


export default router;
