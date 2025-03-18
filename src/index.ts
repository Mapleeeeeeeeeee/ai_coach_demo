// Entry point for the AI Coach Demo application
import { setupEventListeners } from './eventHandlers';
import { ApiService } from './services/apiService';

// Initialize the API service
const apiService = new ApiService('https://your-backend-api-url.com/api');

// Setup all event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  setupEventListeners(apiService);
  console.log('AI Coach Demo application initialized');
});
