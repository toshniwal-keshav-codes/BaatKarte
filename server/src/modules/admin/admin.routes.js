import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { requireAdmin } from "../../middleware/admin.js";
import {
  getDashboardStats,
  getUsers,
  getUserProfile,
  updateUserRole,
  deleteUser,
  getConversations,
  deleteConversation,
  getMessages,
  deleteMessages,
  getAuditLogs,
  setupInitialAdmin,
} from "./admin.controller.js";

const router = Router();

// All admin routes require authentication
router.use(requireAuth);

// Helper route to setup first admin if zero admins exist in database
router.post("/setup-initial-admin", setupInitialAdmin);

// All subsequent routes require Admin role privileges
router.use(requireAdmin);

// Dashboard Overview Stats
router.get("/stats", getDashboardStats);

// User Management
router.get("/users", getUsers);
router.get("/users/:id", getUserProfile);
router.patch("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

// Conversation Management
router.get("/conversations", getConversations);
router.delete("/conversations/:id", deleteConversation);

// Message Management
router.get("/messages", getMessages);
router.delete("/messages", deleteMessages);

// Audit Logging
router.get("/audit-logs", getAuditLogs);

export default router;
