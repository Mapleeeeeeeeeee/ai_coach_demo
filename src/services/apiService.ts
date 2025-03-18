/**
 * API Service for handling communication with the backend
 */
export class ApiService {
  private baseUrl: string;

  /**
   * Initialize ApiService with the base URL
   * @param baseUrl - The base URL for the API
   */
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  /**
   * Send user prompt to the AI and get a response
   * @param prompt - The user's prompt text
   * @param context - Optional context (e.g., "A", "B", "C")
   * @returns Promise with the AI's response text
   */
  async sendPrompt(prompt: string, context: string = 'A'): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
        }),
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Failed to send prompt:', error);
      throw error;
    }
  }

  /**
   * Create a new chat session
   * @returns Promise with the new session ID
   */
  async createNewChat(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error('Failed to create new chat:', error);
      throw error;
    }
  }

  /**
   * Upload a file to be used in the chat
   * @param file - The file to upload
   * @returns Promise with the upload result
   */
  async uploadFile(file: File): Promise<{ success: boolean; fileId: string }> {
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
