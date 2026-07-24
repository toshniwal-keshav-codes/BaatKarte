/**
 * Centralized Plugin & Extension Registry for BaatKarte Server.
 * Allows decoupling optional features (e.g. AI Moderation, Push Notifications,
 * File Processing, E2EE validation, Media Signaling) into modular hooks.
 */

export const HookTypes = {
  BEFORE_MESSAGE_SEND: "beforeMessageSend",
  AFTER_MESSAGE_SEND: "afterMessageSend",
  ON_USER_CONNECT: "onUserConnect",
  ON_USER_DISCONNECT: "onUserDisconnect",
  ON_MEDIA_SIGNAL: "onMediaSignal",
  ON_MODERATION_CHECK: "onModerationCheck",
  ON_NOTIFICATION_TRIGGER: "onNotificationTrigger",
  ON_GROUP_EVENT: "onGroupEvent",
};

class PluginRegistry {
  constructor() {
    this.hooks = new Map();
    // Initialize hooks
    Object.values(HookTypes).forEach((type) => {
      this.hooks.set(type, []);
    });
  }

  /**
   * Register a hook handler.
   * @param {string} hookType - Member of HookTypes
   * @param {string} pluginName - Unique identifier for the plugin
   * @param {Function} handler - Async or sync callback function
   */
  register(hookType, pluginName, handler) {
    if (!this.hooks.has(hookType)) {
      this.hooks.set(hookType, []);
    }
    this.hooks.get(hookType).push({ pluginName, handler });
  }

  /**
   * Execute pipeline hooks sequentially. Allows mutation of payload (e.g. moderation, encryption headers).
   * @param {string} hookType
   * @param {Object} context
   * @returns {Promise<Object>} Modified context
   */
  async executeWaterfall(hookType, context) {
    const registered = this.hooks.get(hookType) || [];
    let currentContext = { ...context };

    for (const { pluginName, handler } of registered) {
      try {
        const result = await handler(currentContext);
        if (result && typeof result === "object") {
          currentContext = { ...currentContext, ...result };
        }
      } catch (err) {
        console.error(`[plugin-registry] Error in plugin "${pluginName}" during hook "${hookType}":`, err.message);
      }
    }

    return currentContext;
  }

  /**
   * Broadcast execution to all handlers without waiting for payload mutations.
   * @param {string} hookType
   * @param {Object} context
   */
  async executeParallel(hookType, context) {
    const registered = this.hooks.get(hookType) || [];
    const promises = registered.map(({ pluginName, handler }) =>
      Promise.resolve()
        .then(() => handler(context))
        .catch((err) => {
          console.error(`[plugin-registry] Parallel error in "${pluginName}" during "${hookType}":`, err.message);
        }),
    );
    await Promise.allSettled(promises);
  }
}

export const pluginRegistry = new PluginRegistry();
