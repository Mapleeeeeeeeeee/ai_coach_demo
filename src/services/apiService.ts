/**
 * API Service for handling communication with the backend
 */
export class ApiService {
  private baseUrl: string;
  private sessionId: string | null = null;

  /**
   * Initialize ApiService with the base URL
   * @param baseUrl - The base URL for the API
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Start a new session with the character AI
   * @param llmChoice - The choice of LLM (e.g., "openai", "claude", "gemini")
   * @returns Promise with session information
   */
  async startSession(llmChoice: string = 'openai'): Promise<{
    sessionId: string;
    characterInfo: any;
    currentStage: number;
    stageDescription: string;
  }> {
    try {
      // Ensure we're using the correct endpoint
      console.log(`Connecting to: ${this.baseUrl}/start`);
      const response = await fetch(`${this.baseUrl}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          llm_choice: llmChoice,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      this.sessionId = data.session_id;
      return {
        sessionId: data.session_id,
        characterInfo: data.character_info,
        currentStage: data.current_stage,
        stageDescription: data.stage_description,
      };
    } catch (error) {
      console.error('Failed to start session:', error);
      throw error;
    }
  }

  /**
   * Send a chat message to the character AI
   * @param userInput - The user's message
   * @param sessionId - Optional session ID (uses stored session ID if not provided)
   * @returns Promise with the chat response
   */
  async sendChat(userInput: string, sessionId?: string): Promise<{
    responseText: string;
    innerActivity: string;
    conversation: string;
    currentStage: number;
    stageDescription: string;
    isPass: boolean;
    finished: boolean;
  }> {
    try {
      const activeSessionId = sessionId || this.sessionId;
      if (!activeSessionId) {
        throw new Error('No active session. Call startSession first.');
      }

      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: activeSessionId,
          user_input: userInput,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return {
        responseText: data.response_text,
        innerActivity: data.inner_activity,
        conversation: data.conversation,
        currentStage: data.current_stage,
        stageDescription: data.stage_description,
        isPass: data.is_pass,
        finished: data.finished,
      };
    } catch (error) {
      console.error('Failed to send chat:', error);
      throw error;
    }
  }

  /**
   * End the current chat session
   * @param sessionId - Optional session ID (uses stored session ID if not provided)
   * @returns Promise indicating success
   */
  async endSession(sessionId?: string): Promise<{ detail: string }> {
    try {
      const activeSessionId = sessionId || this.sessionId;
      if (!activeSessionId) {
        throw new Error('No active session to end.');
      }

      const response = await fetch(`${this.baseUrl}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          session_id: activeSessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      // Clear the stored session ID if we're ending the active session
      if (activeSessionId === this.sessionId) {
        this.sessionId = null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to end session:', error);
      throw error;
    }
  }

  /**
   * Get the current session ID
   * @returns The current session ID or null if no active session
   */
  getSessionId(): string | null {
    return this.sessionId;
  }

  // Keep the original methods for backward compatibility
  /**
   * @deprecated Use startSession and sendChat instead
   */
  async sendPrompt(prompt: string, context: string = 'A'): Promise<string> {
    console.warn('sendPrompt is deprecated. Use startSession and sendChat instead.');
    try {
      if (!this.sessionId) {
        await this.startSession();
      }
      const response = await this.sendChat(prompt);
      return response.responseText;
    } catch (error) {
      console.error('Error in sendPrompt:', error);
      // If there was an error starting the session or sending chat, try again with a new session
      try {
        await this.startSession();
        const response = await this.sendChat(prompt);
        return response.responseText;
      } catch (retryError) {
        console.error('Retry failed:', retryError);
        throw retryError;
      }
    }
  }

  /**
   * @deprecated Use startSession instead
   */
  async createNewChat(): Promise<string> {
    console.warn('createNewChat is deprecated. Use startSession instead.');
    const data = await this.startSession();
    return data.sessionId;
  }

  /**
   * Upload a file to be used in the chat
   * Note: Your backend doesn't have this endpoint yet
   * @param file - The file to upload
   * @returns Promise with the upload result
   */
  async uploadFile(file: File): Promise<{ success: boolean; fileId: string }> {
    console.warn('The backend does not have an upload endpoint implemented yet.');
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }
}
