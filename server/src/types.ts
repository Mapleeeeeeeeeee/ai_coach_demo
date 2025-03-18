/**
 * The available chat contexts
 */
export type ChatContext = 'A' | 'B' | 'C';

/**
 * Chat message from the user or AI
 */
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

/**
 * Chat session data
 */
export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: Date;
}

/**
 * Request body for sending a prompt
 */
export interface SendPromptRequest {
  prompt: string;
  context?: ChatContext;
  sessionId?: string;
}

/**
 * Response for sending a prompt
 */
export interface SendPromptResponse {
  response: string;
  sessionId: string;
}

/**
 * Response for creating a new chat
 */
export interface NewChatResponse {
  sessionId: string;
}

/**
 * Response for uploading a file
 */
export interface UploadFileResponse {
  success: boolean;
  fileId: string;
  originalName: string;
  mimetype: string;
  size: number;
  path: string;
  url: string;
}

/**
 * Server status response
 */
export interface ServerStatusResponse {
  status: string;
  timestamp: Date;
  activeSessions: number;
}
