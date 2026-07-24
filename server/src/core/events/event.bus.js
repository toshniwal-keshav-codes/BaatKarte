import { EventEmitter } from "events";

/**
 * System Event Bus for server-side decoupled event emission.
 * Used to broadcast decoupled events across modules (e.g. notifications, analytics, audit).
 */
export const EventTopics = {
  USER_REGISTERED: "user.registered",
  USER_LOGGED_IN: "user.logged_in",
  USER_STATUS_CHANGED: "user.status_changed",
  MESSAGE_SENT: "message.sent",
  MESSAGE_DELIVERED: "message.delivered",
  MESSAGE_READ: "message.read",
  CONVERSATION_CREATED: "conversation.created",
  CONVERSATION_UPDATED: "conversation.updated",
  MEDIA_CALL_INITIATED: "media.call_initiated",
  AI_MODERATION_FLAGGED: "ai.moderation_flagged",
  PUSH_NOTIFICATION_QUEUED: "notification.push_queued",
};

class SystemEventBus extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(50);
  }

  /**
   * Safe emit wrapper that catches listener errors.
   */
  safeEmit(topic, data) {
    try {
      this.emit(topic, data);
    } catch (err) {
      console.error(`[event-bus] Error emitting event "${topic}":`, err.message);
    }
  }
}

export const eventBus = new SystemEventBus();
