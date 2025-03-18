require('dotenv').config();
const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const OpenAI = require('openai');

// Initialize Express app
const app = express();
const port = process.env.PORT || 3000;

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// Configure Express middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// In-memory chat sessions storage (would use a database in production)
const chatSessions = new Map();

// Helper function to generate a random session ID
function generateSessionId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to select model based on context
function getModelForContext(context) {
  switch (context) {
    case 'A':
      return 'gpt-3.5-turbo';
    case 'B':
      return 'gpt-3.5-turbo';
    case 'C':
      return 'gpt-3.5-turbo';
    default:
      return 'gpt-3.5-turbo';
  }
}

// Helper function to get system message based on context
function getSystemMessageForContext(context) {
  switch (context) {
    case 'A':
      return '你是一位客服助手，專門解答用戶的問題和疑慮。請以專業、有禮且簡潔的方式回應。';
    case 'B':
      return '你是一位寫作助手，擅長幫助用戶潤稿、發想內容和提供創意建議。請以活潑、有創意的方式回應。';
    case 'C':
      return '你是一位教學助手，擅長解釋複雜概念和提供學習指導。請以清晰、有條理的方式回應，適合教育場景。';
    default:
      return '你是一位AI助手，請回答用戶的問題。';
  }
}

// Create a new chat session
app.post('/api/chat/new', (req, res) => {
  const sessionId = generateSessionId();
  chatSessions.set(sessionId, {
    id: sessionId,
    messages: [],
    createdAt: new Date(),
  });
  
  res.json({ sessionId });
});

// Send a prompt to the AI and get a response
app.post('/api/chat', async (req, res) => {
  try {
    const { prompt, context = 'A', sessionId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }
    
    // Get chat session or create a new one
    let session;
    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId);
    } else {
      const newSessionId = generateSessionId();
      session = {
        id: newSessionId,
        messages: [],
        createdAt: new Date(),
      };
      chatSessions.set(newSessionId, session);
    }
    
    // Add user message to session
    session.messages.push({
      role: 'user',
      content: prompt,
    });
    
    // Get the appropriate model and system message based on context
    const model = getModelForContext(context);
    const systemMessage = getSystemMessageForContext(context);
    
    // Prepare messages for OpenAI API
    const messages = [
      { role: 'system', content: systemMessage },
      ...session.messages.slice(-10), // Only use the last 10 messages to avoid token limits
    ];
    
    // Call OpenAI API
    const completion = await openai.chat.completions.create({
      model,
      messages,
      max_tokens: 1000,
    });
    
    // Extract assistant response
    const assistantResponse = completion.choices[0].message.content;
    
    // Add assistant response to session
    session.messages.push({
      role: 'assistant',
      content: assistantResponse,
    });
    
    // Return the response
    res.json({
      response: assistantResponse,
      sessionId: session.id,
    });
  } catch (error) {
    console.error('Error processing chat request:', error);
    res.status(500).json({
      error: 'Failed to process request',
      details: error.message,
    });
  }
});

// Upload a file
app.post('/api/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const fileInfo = {
      success: true,
      fileId: path.basename(req.file.path),
      originalName: req.file.originalname,
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path,
      url: `/uploads/${path.basename(req.file.path)}`,
    };
    
    res.json(fileInfo);
  } catch (error) {
    console.error('Error uploading file:', error);
    res.status(500).json({
      error: 'Failed to upload file',
      details: error.message,
    });
  }
});

// Get server status
app.get('/api/status', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    activeSessions: chatSessions.size,
  });
});

// Start the server
app.listen(port, () => {
  console.log(`AI Coach backend server running on port ${port}`);
  console.log(`OpenAI API key ${process.env.OPENAI_API_KEY ? 'is' : 'is NOT'} configured`);
});
