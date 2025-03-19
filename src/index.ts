import { App } from './app';
import './styles/main.css';
import './styles/modern-chat.css';

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Create the app with the API base URL
  const app = new App('http://localhost:8000');
});
