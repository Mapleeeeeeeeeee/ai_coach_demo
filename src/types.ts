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
}

/**
 * Represents a chat context/scene
 */
export type ChatContext = 'A' | 'B' | 'C';

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
