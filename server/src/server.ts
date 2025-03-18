import dotenv from 'dotenv';
import express, { Request, Response, Express } from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import OpenAI from 'openai';
import {
  ChatContext,
  ChatMessage,
  ChatSession,
  SendPromptRequest,
  SendPromptResponse,
  NewChatResponse,
  UploadFileResponse,
  ServerStatusResponse
} from './types';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const port: number = parseInt(process.env.PORT || '3000', 10);

// Configure OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads');
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
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// In-memory chat sessions storage (would use a database in production)
const chatSessions = new Map<string, ChatSession>();

// Helper function to generate a random session ID
function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

// Helper function to select model based on context
function getModelForContext(context: ChatContext): string {
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
function getSystemMessageForContext(context: ChatContext): string {
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
app.post('/api/chat/new', (req: Request, res: Response<NewChatResponse>) => {
  const sessionId = generateSessionId();
  chatSessions.set(sessionId, {
    id: sessionId,
    messages: [],
    createdAt: new Date(),
  });
  
  res.json({ sessionId });
});

// Send a prompt to the AI and get a response
app.post('/api/chat', async (req: Request<{}, {}, SendPromptRequest>, res: Response<SendPromptResponse>) => {
  try {
    const { prompt, context = 'A', sessionId } = req.body;
    
    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required', 
        response: '', 
        sessionId: '' 
      } as any);
    }
    
    // Get chat session or create a new one
    let session: ChatSession;
    if (sessionId && chatSessions.has(sessionId)) {
      session = chatSessions.get(sessionId)!;
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
    const model = getModelForContext(context as ChatContext);
    const systemMessage = getSystemMessageForContext(context as ChatContext);
    
    // Prepare messages for OpenAI API
    const messages: ChatMessage[] = [
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
    const assistantResponse = completion.choices[0].message.content || '';
    
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
      details: (error as Error).message,
      response: 'Sorry, an error occurred while processing your request.',
      sessionId: '',
    } as any);
  }
});

// Upload a file
app.post('/api/upload', upload.single('file'), (req: Request, res: Response<UploadFileResponse>) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        error: 'No file uploaded',
        success: false,
        fileId: '',
        originalName: '',
        mimetype: '',
        size: 0,
        path: '',
        url: '',
      } as any);
    }
    
    const fileInfo: UploadFileResponse = {
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
      details: (error as Error).message,
      success: false,
      fileId: '',
      originalName: '',
      mimetype: '',
      size: 0,
      path: '',
      url: '',
    } as any);
  }
});

// Get server status
app.get('/api/status', (req: Request, res: Response<ServerStatusResponse>) => {
  res.json({
    status: 'ok',
    timestamp: new Date(),
    activeSessions: chatSessions.size,
  });
});

// Start the server
if (require.main === module) {
  app.listen(port, () => {
    console.log(`AI Coach backend server running on port ${port}`);
    console.log(`OpenAI API key ${process.env.OPENAI_API_KEY ? 'is' : 'is NOT'} configured`);
  });
}

export default app;
