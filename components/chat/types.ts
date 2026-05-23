export type ChatMessageRole = "user" | "assistant";
export type ChatMessageStatus = "sending" | "streaming" | "sent" | "error";
export type ChatFeedback = "like" | "dislike";

export interface ChatAttachment {
  id: string;
  name: string;
  mediaType: string;
  size: number;
  kind: "image" | "text" | "file";
  dataUrl?: string;
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: ChatMessageRole;
  content: string;
  createdAt: string;
  status: ChatMessageStatus;
  retryContent?: string;
  retryAttachments?: ChatAttachment[];
  attachments?: ChatAttachment[];
  feedback?: ChatFeedback;
}

export interface StoredConversation {
  id: string;
  audit_id?: string | null;
  title?: string | null;
  updated_at?: string;
}
