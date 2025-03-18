# AI Coach Backend Server

This is a simple Express.js backend server that connects to OpenAI's API to provide AI responses for the AI Coach demo.

## Setup

1. Install dependencies:
   ```
   npm install
   ```

2. Create a `.env` file based on `.env.example` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```

3. Start the server:
   ```
   npm start
   ```
   
   For development with auto-restart:
   ```
   npm run dev
   ```

## API Endpoints

### Chat

- **POST /api/chat/new**
  - Creates a new chat session
  - Returns: `{ sessionId: string }`

- **POST /api/chat**
  - Sends a prompt to the AI and gets a response
  - Request body: `{ prompt: string, context?: 'A' | 'B' | 'C', sessionId?: string }`
  - Returns: `{ response: string, sessionId: string }`

### File Upload

- **POST /api/upload**
  - Uploads a file to be used in the chat
  - Form data: `file` (multipart/form-data)
  - Returns: File information including URL

### Server Status

- **GET /api/status**
  - Gets server status information
  - Returns: `{ status: string, timestamp: Date, activeSessions: number }`

## Context Types

The server supports different contexts (A, B, C) that change the AI's behavior:

- **Context A**: Customer support assistant
- **Context B**: Writing and content creation assistant
- **Context C**: Educational and learning assistant

## File Storage

Uploaded files are stored in the `uploads` directory and are accessible via `/uploads/{filename}`.
