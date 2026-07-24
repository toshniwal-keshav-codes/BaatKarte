import { pluginRegistry, HookTypes } from "../core/plugins/plugin.registry.js";
import { eventBus, EventTopics } from "../core/events/event.bus.js";

/**
 * Socket Extension Registrar.
 * Extends Socket.io event handling with modular handlers for WebRTC signaling,
 * typing notifications, presence updates, and E2EE/moderation event pipelines.
 */
export function registerSocketExtensions(io, socket) {
  const userId = socket.data.userId;

  // Extension hook for connection
  pluginRegistry.executeParallel(HookTypes.ON_USER_CONNECT, { io, socket, userId });
  eventBus.safeEmit(EventTopics.USER_STATUS_CHANGED, { userId, isOnline: true });

  // WebRTC / Video Calls & Screen Sharing Signaling extension points
  socket.on("webrtc:offer", (payload) => {
    pluginRegistry.executeWaterfall(HookTypes.ON_MEDIA_SIGNAL, { type: "offer", payload, userId, socket });
  });

  socket.on("webrtc:answer", (payload) => {
    pluginRegistry.executeWaterfall(HookTypes.ON_MEDIA_SIGNAL, { type: "answer", payload, userId, socket });
  });

  socket.on("webrtc:ice-candidate", (payload) => {
    pluginRegistry.executeWaterfall(HookTypes.ON_MEDIA_SIGNAL, { type: "ice-candidate", payload, userId, socket });
  });

  // Receipt extension points (Delivered / Read)
  socket.on("receipt:delivered", (payload) => {
    eventBus.safeEmit(EventTopics.MESSAGE_DELIVERED, { payload, userId });
  });

  socket.on("receipt:read", (payload) => {
    eventBus.safeEmit(EventTopics.MESSAGE_READ, { payload, userId });
  });

  // On Disconnect extension hook
  socket.on("disconnect", () => {
    pluginRegistry.executeParallel(HookTypes.ON_USER_DISCONNECT, { io, socket, userId });
    eventBus.safeEmit(EventTopics.USER_STATUS_CHANGED, { userId, isOnline: false });
  });
}
