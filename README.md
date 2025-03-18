# AI Coach Demo

This is a full-stack TypeScript demo project for an AI coaching application. It includes:

- TypeScript frontend with component-based architecture
- TypeScript backend with OpenAI API integration
- API connection between frontend and backend
- File upload functionality
- Multiple context/scene support

## Project Structure

```
ai_coach_demo/
├── src/                      # Frontend TypeScript source code
│   ├── components/           # UI components
│   │   ├── ChatContent.ts    # Chat area with messages display
│   │   ├── Header.ts         # App header with context selector
│   │   └── InputArea.ts      # Input area with sending functionality
│   ├── services/             # API services
│   │   └── apiService.ts     # API communication service
│   ├── styles/               # CSS styles
│   │   └── main.css          # Main stylesheet
│   ├── utils/                # Utility functions
│   │   └── domUtils.ts       # DOM manipulation utilities
│   ├── app.ts                # Main application class
│   ├── eventHandlers.ts      # (Legacy) UI event handlers 
│   ├── types.ts              # TypeScript type definitions
│   └── index.ts              # Entry point
├── server/                   # Backend server
│   ├── src/                  # TypeScript source code
│   │   ├── server.ts         # Express server connecting to OpenAI
│   │   └── types.ts          # TypeScript type definitions
│   ├── dist/                 # Compiled JavaScript (generated)
│   ├── uploads/              # Uploaded files directory
│   ├── package.json          # Backend dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   └── .env.example          # Environment variables template
├── dist/                     # Frontend compiled JavaScript (generated)
├── index.html                # Main HTML file
├── package.json              # Frontend project configuration
├── tsconfig.json             # Frontend TypeScript configuration
└── webpack.config.js         # Webpack configuration
```

## Setup Instructions

### Frontend Setup

1. Install Node.js and npm if you haven't already.
2. Navigate to the project directory in your terminal.
3. Install frontend dependencies:
   ```
   npm install
   ```
4. Build the frontend:
   ```
   npm run build
   ```

### Backend Setup

1. Navigate to the server directory:
   ```
   cd server
   ```
2. Install backend dependencies:
   ```
   npm install
   ```
3. Create a `.env` file in the server directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_openai_api_key_here
   PORT=3000
   ```
4. Build the backend:
   ```
   npm run build
   ```

## Running the Application

### Start the Backend Server

1. In the server directory, run:
   ```
   npm start
   ```
   Or for development with auto-restart:
   ```
   npm run dev
   ```
   The server will run on http://localhost:3000 by default.

### Start the Frontend Development Server

1. In the main project directory, run:
   ```
   npm start
   ```
   This will start the webpack dev server and open the application in your browser at http://localhost:9000.

## Testing the Application

1. **Make sure both frontend and backend servers are running** as described above.

2. **Test basic chat functionality**:
   - Type a message in the input area and click the send button
   - You should see your message appear in the chat
   - After a moment, you should see a response from the AI

3. **Test context switching**:
   - Click on one of the three scene cards (A, B, C)
   - The AI should respond with a different style based on the context
   - You can also change the context using the dropdown in the header

4. **Test file upload**:
   - Click the upload button (plus icon)
   - Select one of the upload options
   - Choose a file from your computer
   - The file should be uploaded to the server and you should see a confirmation message

5. **Test new chat button**:
   - Have a conversation with the AI
   - Click the "New Chat" button in the header
   - The chat should be cleared and you can start a new conversation

## Development

### Frontend Development

- Run `npm run dev` to watch for changes and auto-compile.
- Run `npm run build` to create a production build.

### Backend Development

- Run `npm run dev` in the server directory for live reloading during development.
- Run `npm run build` to compile TypeScript to JavaScript.

## API Endpoints

The backend provides the following API endpoints:

- **POST /api/chat/new**: Create a new chat session
- **POST /api/chat**: Send a prompt and get an AI response
- **POST /api/upload**: Upload a file
- **GET /api/status**: Get server status

## Troubleshooting

1. **CORS errors**: If you see CORS errors, make sure the backend server is running and that it's configured to allow requests from your frontend origin.

2. **OpenAI API errors**: If you see errors related to the OpenAI API, check that your API key is valid and properly set in the .env file.

3. **Port conflicts**: If port 3000 or 9000 is already in use, you can change the ports in the respective configuration files.

4. **Building errors**: Make sure all dependencies are properly installed by running `npm install` in both the main directory and the server directory.
