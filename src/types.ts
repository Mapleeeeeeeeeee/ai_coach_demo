/**
 * Represents a chat message
 */
export interface ChatMessage {
  /** The content of the message */
  content: string;
  
  /** Whether the message is from the user (true) or AI (false) */
  isUser: boolean;
  
  /** The timestamp when the message was created */
  timestamp: Date;
  
  /** Optional inner activity data (AI's inner thoughts) */
  innerActivity?: string;
}

/**
 * Represents a chat context/scene - keeping for backward compatibility
 */
export type ChatContext = 'A' | 'B' | 'C';

/**
 * LLM choices available for the system
 */
export type LLMChoice = 'openai' | 'claude' | 'gemini';

/**
 * Character information from the backend
 */
export interface CharacterInfo {
  /** Character's name */
  姓名: string;
  
  /** Character's age */
  年齡?: number | string;
  
  /** Character's background */
  背景?: string;
  
  /** Character's personality */
  個性?: string;
  
  /** Additional character traits or information */
  [key: string]: any;
}

/**
 * Chat session information
 */
export interface SessionInfo {
  /** Unique session ID */
  sessionId: string;
  
  /** Complete character information */
  characterInfo: CharacterInfo;
  
  /** Current stage number */
  currentStage: number;
  
  /** Description of the current stage */
  stageDescription: string;
}

/**
 * Chat response from the AI system
 */
export interface ChatResponse {
  /** The AI's response text */
  responseText: string;
  
  /** The AI's inner thought process */
  innerActivity: string;
  
  /** The complete conversation history */
  conversation: string;
  
  /** Current stage number */
  currentStage: number;
  
  /** Description of the current stage */
  stageDescription: string;
  
  /** Whether this interaction has passed the current stage */
  isPass: boolean;
  
  /** Whether the conversation has finished (all stages passed) */
  finished: boolean;
}

/**
 * Represents a tool in the tools menu
 */
export interface Tool {
  /** The ID of the tool */
  id: string;
  
  /** The name of the tool */
  name: string;
  
  /** The description of the tool */
  description: string;
  
  /** Whether the tool is active */
  active: boolean;
  
  /** The icon SVG code for the tool */
  icon: string;
}

/**
 * Represents an upload option
 */
export interface UploadOption {
  /** The ID of the upload option */
  id: string;
  
  /** The name of the upload option */
  name: string;
  
  /** The accepted file types */
  accept: string;
  
  /** The icon SVG code for the upload option */
  icon: string;
}
