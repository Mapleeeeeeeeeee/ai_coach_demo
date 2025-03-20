# AI Coach Demo Project

This project consists of a frontend TypeScript application that connects to a Python backend server. The frontend provides a user interface for interacting with an AI coaching system.

## Project Structure

- **Frontend**: TypeScript application in `C:\Users\User\Desktop\ai_coach_demo\`
  - `src/app.ts`: Main application controller
  - `src/components/`: UI components (Header, ChatContent, InputArea)
  - `src/services/apiService.ts`: Backend API communication
  - `src/styles/`: CSS styling
- **Backend**: Python server in `C:\Users\User\Desktop\customer_ai\`

## Setup Instructions

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd C:\Users\User\Desktop\customer_ai\
   ```

2. Install the required Python packages:
   ```
   pip install -r requirements.txt
   ```

3. Start the backend server:
   ```
   python server.py
   ```
   
   The backend server will run on `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd C:\Users\User\Desktop\ai_coach_demo\
   ```

2. Install the required npm packages:
   ```
   npm install
   ```

3. Build the frontend:
   ```
   npm run build
   ```

4. Start the development server:
   ```
   npm start
   ```
   
   The frontend development server will run on `http://localhost:9000`

## Usage

1. Open your browser and navigate to `http://localhost:9000`
2. Select a scene card to start a conversation
3. Choose between practice mode (with hints) and exam mode (without hints)
4. Type your message and press send to interact with the AI coach

## UI Features

- **Practice Mode**: 
  - Sidebar displays character information, stage details, and AI's internal thought process
  - Click character avatar to view detailed character information
  - Stage information shows current stage, description, customer status, and next stage conditions

- **Exam Mode**:
  - Limited information displayed to simulate real-world conditions
  - After completing a stage, more information becomes available
  - Complete all stages to unlock full practice mode features

## Troubleshooting

If you encounter connection issues:

1. Make sure the backend server is running at `http://localhost:8000`
2. Check the console for error messages
3. Ensure there are no CORS issues by checking the backend's CORS middleware
4. Verify the API endpoints in the frontend match those in the backend

## API Endpoints

- `POST /start`: Start a new session
- `POST /chat`: Send a message to the AI
- `POST /end`: End the current session

Each endpoint expects specific JSON payloads. Refer to the backend code for details.
