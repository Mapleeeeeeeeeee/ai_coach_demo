# AI Coach Demo

This is a demo project for an AI coaching application with a TypeScript frontend.

## Project Structure

```
ai_coach_demo/
├── src/                      # TypeScript source code
│   ├── services/             # API services
│   │   └── apiService.ts     # API communication service
│   ├── utils/                # Utility functions
│   │   └── domUtils.ts       # DOM manipulation utilities
│   ├── eventHandlers.ts      # UI event handlers
│   ├── types.ts              # TypeScript type definitions
│   └── index.ts              # Entry point
├── dist/                     # Compiled JavaScript (generated)
├── index.html                # Main HTML file
├── package.json              # Project configuration
├── tsconfig.json             # TypeScript configuration
└── webpack.config.js         # Webpack configuration
```

## Setup Instructions

1. Install Node.js and npm if you haven't already.
2. Clone or download this repository.
3. Navigate to the project directory in your terminal.
4. Install dependencies:
   ```
   npm install
   ```
5. Start the development server:
   ```
   npm start
   ```
   This will open the application in your default browser.

## Development

- Run `npm run dev` to watch for changes and auto-compile.
- Run `npm run build` to create a production build.

## API Configuration

Update the API URL in `src/index.ts` to point to your backend API:

```typescript
const apiService = new ApiService('https://your-backend-api-url.com/api');
```

## Features

- Chat with an AI assistant based on a prompt
- Switch between different contexts or scenes
- Upload files (documents, images, spreadsheets)
- Enable/disable various AI tools
- Start new conversations
