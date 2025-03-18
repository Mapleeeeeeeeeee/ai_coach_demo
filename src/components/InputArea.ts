import { getElement } from '../utils/domUtils';

/**
 * Interface for input area callbacks
 */
export interface InputAreaCallbacks {
  onSend: (message: string) => void;
  onUpload: (file: File) => void;
  onSearch: () => void;
  onResearch: () => void;
}

/**
 * Sets up the input area component with all its functionalities
 * @param callbacks Object containing all callback functions
 */
export function setupInputArea(callbacks: InputAreaCallbacks): void {
  const inputArea = document.querySelector('.input-area') as HTMLTextAreaElement;
  const sendButton = document.querySelector('.send-btn') as HTMLButtonElement;
  
  if (!inputArea || !sendButton) {
    console.error('Required input elements not found');
    return;
  }
  
  // Setup auto-resize for textarea
  inputArea.addEventListener('input', () => {
    // Reset height to get the correct scrollHeight
    inputArea.style.height = 'auto';
    // Set new height based on content (with max height of 200px)
    inputArea.style.height = `${Math.min(inputArea.scrollHeight, 200)}px`;
    
    // Enable/disable send button based on input
    const hasText = inputArea.value.trim().length > 0;
    sendButton.disabled = !hasText;
    sendButton.style.opacity = hasText ? '1' : '0.5';
  });
  
  // Set initial state of send button
  sendButton.disabled = true;
  sendButton.style.opacity = '0.5';
  
  // Handle send button click
  sendButton.addEventListener('click', () => {
    const message = inputArea.value.trim();
    if (!message) return;
    
    callbacks.onSend(message);
    
    // Clear input and reset height
    inputArea.value = '';
    inputArea.style.height = 'auto';
    sendButton.disabled = true;
    sendButton.style.opacity = '0.5';
  });
  
  // Handle Enter key to send message
  inputArea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!sendButton.disabled) {
        sendButton.click();
      }
    }
  });
  
  // Setup function buttons
  setupFunctionButtons(callbacks);
}

/**
 * Sets up the function buttons (upload, search, research)
 * @param callbacks Object containing all callback functions
 */
function setupFunctionButtons(callbacks: InputAreaCallbacks): void {
  setupUploadButton(callbacks.onUpload);
  setupToolsButton();
  
  // Setup search button
  const searchBtn = getElement('searchBtn');
  searchBtn.addEventListener('click', () => {
    callbacks.onSearch();
    console.log('Search button clicked');
  });
  
  // Setup research button
  const researchBtn = getElement('researchBtn');
  researchBtn.addEventListener('click', () => {
    callbacks.onResearch();
    console.log('Research button clicked');
  });
}

/**
 * Sets up the upload button and its dropdown menu
 * @param onUpload Callback for when a file is uploaded
 */
function setupUploadButton(onUpload: (file: File) => void): void {
  const uploadBtn = getElement('uploadBtn');
  const uploadMenu = getElement('uploadMenu');
  
  uploadBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    uploadMenu.classList.toggle('show');
    
    if (uploadMenu.classList.contains('show')) {
      const rect = uploadBtn.getBoundingClientRect();
      const menuHeight = uploadMenu.offsetHeight;
      
      uploadMenu.style.top = `${rect.top - menuHeight - 4}px`;
      uploadMenu.style.left = `${rect.left}px`;
    }
  });
  
  // Setup upload menu items
  const uploadMenuItems = uploadMenu.querySelectorAll('.upload-menu-item');
  uploadMenuItems.forEach(item => {
    item.addEventListener('click', () => {
      // Create a hidden file input element
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.style.display = 'none';
      
      // Add to DOM temporarily
      document.body.appendChild(fileInput);
      
      // Trigger click
      fileInput.click();
      
      // Handle file selection
      fileInput.addEventListener('change', () => {
        if (fileInput.files && fileInput.files.length > 0) {
          const file = fileInput.files[0];
          console.log(`Selected file: ${file.name}`);
          onUpload(file);
        }
        
        // Clean up
        document.body.removeChild(fileInput);
      });
      
      // Hide menu after selection
      uploadMenu.classList.remove('show');
    });
  });
  
  // Close menu when clicking outside
  window.addEventListener('click', (event) => {
    if (!uploadBtn.contains(event.target as Node) && 
        !uploadMenu.contains(event.target as Node)) {
      uploadMenu.classList.remove('show');
    }
  });
}

/**
 * Sets up the tools button and its dropdown menu
 */
function setupToolsButton(): void {
  const toolsBtn = getElement('toolsBtn');
  const toolsMenu = getElement('toolsMenu');
  const toolsCloseBtn = getElement('toolsCloseBtn');
  
  toolsBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    toolsMenu.classList.toggle('show');
    
    if (toolsMenu.classList.contains('show')) {
      const rect = toolsBtn.getBoundingClientRect();
      const menuHeight = toolsMenu.offsetHeight;
      
      toolsMenu.style.top = `${rect.top - menuHeight - 4}px`;
      toolsMenu.style.right = `${window.innerWidth - rect.right}px`;
    }
  });
  
  toolsCloseBtn.addEventListener('click', () => {
    toolsMenu.classList.remove('show');
  });
  
  // Toggle tool items
  const toolToggles = document.querySelectorAll('.tool-toggle');
  toolToggles.forEach(toggle => {
    toggle.addEventListener('click', (event) => {
      const toggleElement = event.currentTarget as HTMLElement;
      toggleElement.classList.toggle('active');
    });
  });
  
  // Close menu when clicking outside
  window.addEventListener('click', (event) => {
    if (!toolsBtn.contains(event.target as Node) && 
        !toolsMenu.contains(event.target as Node)) {
      toolsMenu.classList.remove('show');
    }
  });
}
