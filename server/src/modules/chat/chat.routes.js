import { Router } from "express";
import { requireAuth } from "../../middleware/auth.js";
import { validate } from "../../middleware/validate.js";
import {
  searchUser,
  createOrOpenConversation,
  getConversations,
  getMessages,
  sendMessage,
  deleteConversation,
} from "./chat.controller.js";
import { createConversationSchema, sendMessageSchema } from "./chat.schemas.js";

const router = Router();

// All chat routes require authentication
router.use(requireAuth);

// User search
router.get("/users/search", searchUser);

// Conversations
router.post("/conversations", validate(createConversationSchema), createOrOpenConversation);
router.get("/conversations", getConversations);
router.delete("/conversations/:id", deleteConversation);

// Messages
router.get("/conversations/:id/messages", getMessages);
router.post("/conversations/:id/messages", validate(sendMessageSchema), sendMessage);

export default router;
