/**
 * Feature Extension Contracts & Interface Declarations for BaatKarte.
 * Defines extension points for future feature modules:
 *
 * 1. Profile Picture & Bio
 * 2. User Status & Presence
 * 3. Last Seen Tracker
 * 4. Typing Indicator Service
 * 5. Delivered & Read Receipts
 * 6. Internal & Push Notifications
 * 7. Pinned & Archived Chats
 * 8. Blocked Users & Privacy Manager
 * 9. Groups & Channels
 * 10. Voice Messages & File Attachments
 * 11. Video Calls, Screen Sharing & WebRTC Signaling
 * 12. End-to-End Encryption (E2EE) Provider
 * 13. AI Content Moderation Provider
 */

export const ExtensionCategories = {
  USER_PROFILE: "user_profile",
  USER_PRESENCE: "user_presence",
  TYPING_INDICATOR: "typing_indicator",
  DELIVERY_RECEIPTS: "delivery_receipts",
  NOTIFICATIONS: "notifications",
  CHAT_ORGANIZER: "chat_organizer",
  PRIVACY: "privacy",
  GROUPS_CHANNELS: "groups_channels",
  RICH_MEDIA: "rich_media",
  WEBRTC_SIGNALING: "webrtc_signaling",
  SECURITY_E2EE: "security_e2ee",
  AI_MODERATION: "ai_moderation",
};

/**
 * Base Abstract Contract Class for Server Extensions.
 * Any future feature plugin should inherit or conform to these lifecycle methods.
 */
export class BaseExtensionContract {
  constructor(name, category) {
    this.name = name;
    this.category = category;
    this.enabled = false;
  }

  async initialize() {
    this.enabled = true;
    console.log(`[extension-contract] Initialized extension: ${this.name} (${this.category})`);
  }

  async shutdown() {
    this.enabled = false;
    console.log(`[extension-contract] Shutdown extension: ${this.name}`);
  }

  getStatus() {
    return { name: this.name, category: this.category, enabled: this.enabled };
  }
}
