import type {
  FileAttachment,
  MediaCallSession,
  EncryptionHeader,
  ModerationResult,
  NotificationPayload,
} from "@/types/extensions";

/**
 * Client Extension Registry.
 * Modular registration point for future UI components, media renderers,
 * security encryption pipelines, and notifications.
 */

export interface MessageTransformerPlugin {
  name: string;
  transformOutgoing?: (content: string, headers?: EncryptionHeader) => Promise<{ content: string; headers?: EncryptionHeader }>;
  transformIncoming?: (content: string, headers?: EncryptionHeader) => Promise<{ content: string }>;
}

export interface MediaHandlerPlugin {
  name: string;
  handleFileSelect?: (file: File) => Promise<FileAttachment>;
  handleVoiceRecord?: (audioBlob: Blob) => Promise<FileAttachment>;
}

export interface SignalingHandlerPlugin {
  name: string;
  onCallSessionUpdate?: (session: MediaCallSession) => void;
}

class ClientExtensionRegistry {
  private messageTransformers: MessageTransformerPlugin[] = [];
  private mediaHandlers: MediaHandlerPlugin[] = [];
  private signalingHandlers: SignalingHandlerPlugin[] = [];

  registerMessageTransformer(plugin: MessageTransformerPlugin) {
    this.messageTransformers.push(plugin);
  }

  registerMediaHandler(plugin: MediaHandlerPlugin) {
    this.mediaHandlers.push(plugin);
  }

  registerSignalingHandler(plugin: SignalingHandlerPlugin) {
    this.signalingHandlers.push(plugin);
  }

  async processOutgoingMessage(content: string): Promise<{ content: string; headers?: EncryptionHeader }> {
    let currentContent = content;
    let headers: EncryptionHeader | undefined = undefined;

    for (const plugin of this.messageTransformers) {
      if (plugin.transformOutgoing) {
        const res = await plugin.transformOutgoing(currentContent, headers);
        currentContent = res.content;
        if (res.headers) headers = res.headers;
      }
    }

    return { content: currentContent, headers };
  }

  async processIncomingMessage(content: string, headers?: EncryptionHeader): Promise<string> {
    let currentContent = content;

    for (const plugin of this.messageTransformers) {
      if (plugin.transformIncoming) {
        const res = await plugin.transformIncoming(currentContent, headers);
        currentContent = res.content;
      }
    }

    return currentContent;
  }
}

export const clientExtensionRegistry = new ClientExtensionRegistry();
