# AI Coach Demo Project

This project consists of a frontend TypeScript application that connects to a Python backend server. The frontend provides a user interface for interacting with an AI coaching system.

## Project Structure

- **Frontend**: TypeScript application in `C:\Users\User\Desktop\ai_coach_demo\`
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
3. Type your message and press send to interact with the AI coach

## Troubleshooting

If you encounter connection issues:

1. Make sure the backend server is running at `http://localhost:8000`
2. Check the console for error messages
3. Ensure there are no CORS issues by checking that the backend's CORS middleware is properly configured
4. Verify that the API endpoints in the frontend match those in the backend

## API Endpoints

- `POST /start`: Start a new session
- `POST /chat`: Send a message to the AI
- `POST /end`: End the current session

Each endpoint expects specific JSON payloads. Refer to the backend code for details.
