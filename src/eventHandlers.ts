import { ApiService } from './services/apiService';
import { toggleClass, getElement, createElement } from './utils/domUtils';
import { ChatMessage, ChatContext } from './types';

/**
 * Setup all event listeners for the UI
 * @param apiService - The API service instance
 */
export function setupEventListeners(apiService: ApiService): void {
  setupContextDropdown();
  setupMenuButtons();
  setupInputArea();
  setupToolsMenu();
  setupChatActions(apiService);
  setupSceneCards(apiService);
}

/**
 * Setup the context dropdown functionality
 */
function setupContextDropdown(): void {
  const contextSelector = getElement('contextSelector');
  const contextDropdown = getElement('contextDropdown');
  const contextOptions = document.querySelectorAll('.context-option');
  const contextText = contextSelector.querySelector('.context-selector-text');

  // Toggle dropdown when clicking the selector
  contextSelector.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleClass(contextDropdown, 'show');
  });

  // Handle context option selection
  contextOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const context = option.getAttribute('data-context') || 'A';
      const optionName = option.querySelector('.context-option-name')?.textContent || '場景 A';
      
      // Update text in the selector
      if (contextText) {
        contextText.textContent = optionName;
      }

      // Update active state
      contextOptions.forEach(opt => opt.classList.remove('active'));
      option.classList.add('active');
      
      // Hide dropdown
      contextDropdown.classList.remove('show');
      
      // You could trigger other actions when context changes
      console.log(`Context changed to: ${context}`);
    });
  });

  // Close dropdown when clicking outside
  window.addEventListener('click', () => {
    contextDropdown.classList.remove('show');
  });
}

/**
 * Setup menu buttons functionality
 */
function setupMenuButtons(): void {
  const uploadBtn = getElement('uploadBtn');
  const uploadMenu = getElement('uploadMenu');
  
  const toolsBtn = getElement('toolsBtn');
  const toolsMenu = getElement('toolsMenu');
  const toolsCloseBtn = getElement('toolsCloseBtn');

  // Upload button functionality
  uploadBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    toggleClass(uploadMenu, 'show');
    
    if (uploadMenu.classList.contains('show')) {
      const rect = uploadBtn.getBoundingClientRect();
      const menuHeight = uploadMenu.offsetHeight;
      
      uploadMenu.style.top = `${rect.top - menuHeight - 4}px`;
      uploadMenu.style.left = `${rect.left}px`;
    }
  });

  // Tools button functionality
  toolsBtn.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    
    toggleClass(toolsMenu, 'show');
    
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
    toggle.addEventListener('click', function() {
      this.classList.toggle('active');
    });
  });

  // Close menus when clicking outside
  window.addEventListener('click', (event) => {
    if (!uploadBtn.contains(event.target as Node) && 
        !uploadMenu.contains(event.target as Node)) {
      uploadMenu.classList.remove('show');
    }
    
    if (!toolsBtn.contains(event.target as Node) && 
        !toolsMenu.contains(event.target as Node)) {
      toolsMenu.classList.remove('show');
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
          // Handle file upload logic here
        }
        
        // Clean up
        document.body.removeChild(fileInput);
      });
      
      // Hide menu after selection
      uploadMenu.classList.remove('show');
    });
  });
}

/**
 * Setup the input area functionality
 */
function setupInputArea(): void {
  const inputArea = document.querySelector('.input-area') as HTMLTextAreaElement;
  const sendButton = document.querySelector('.send-btn') as HTMLButtonElement;

  if (!inputArea || !sendButton) {
    console.error('Required elements not found');
    return;
  }

  // Auto-resize textarea
  inputArea.addEventListener('input', () => {
    inputArea.style.height = 'auto';
    inputArea.style.height = `${Math.min(inputArea.scrollHeight, 200)}px`;
  });

  // Enable/disable send button based on input
  inputArea.addEventListener('input', () => {
    const hasText = inputArea.value.trim().length > 0;
    sendButton.disabled = !hasText;
    sendButton.style.opacity = hasText ? '1' : '0.5';
  });

  // Initialize button state
  sendButton.disabled = true;
  sendButton.style.opacity = '0.5';
}

/**
 * Setup the chat tools menu functionality
 */
function setupToolsMenu(): void {
  const searchBtn = getElement('searchBtn');
  const researchBtn = getElement('researchBtn');
  
  // Add event listeners for the special function buttons
  searchBtn.addEventListener('click', () => {
    console.log('Search button clicked');
    // Implementation for web search feature
  });
  
  researchBtn.addEventListener('click', () => {
    console.log('Research button clicked');
    // Implementation for deep research feature
  });
}

/**
 * Setup chat message sending and display functionality
 * @param apiService - The API service instance
 */
function setupChatActions(apiService: ApiService): void {
  const inputArea = document.querySelector('.input-area') as HTMLTextAreaElement;
  const sendButton = document.querySelector('.send-btn') as HTMLButtonElement;
  const chatContent = document.querySelector('.chat-content') as HTMLElement;
  const emptyState = document.querySelector('.empty-state') as HTMLElement;
  
  if (!inputArea || !sendButton || !chatContent || !emptyState) {
    console.error('Required elements not found');
    return;
  }

  // Function to add a message to the chat
  const addMessageToChat = (message: ChatMessage): void => {
    // Remove empty state if it's the first message
    if (emptyState && emptyState.parentNode === chatContent) {
      chatContent.removeChild(emptyState);
    }

    // Create message element
    const messageElement = createElement('div', {
      className: `message ${message.isUser ? 'user-message' : 'ai-message'}`,
    });

    // Add content
    const contentElement = createElement('div', {
      className: 'message-content',
      innerHTML: message.content,
    });
    
    messageElement.appendChild(contentElement);
    chatContent.appendChild(messageElement);
    
    // Scroll to bottom
    chatContent.scrollTop = chatContent.scrollHeight;
  };

  // Handle send button click
  sendButton.addEventListener('click', async () => {
    const promptText = inputArea.value.trim();
    if (!promptText) return;
    
    // Get current selected context
    const activeContextOption = document.querySelector('.context-option.active');
    const context = activeContextOption?.getAttribute('data-context') || 'A';
    
    // Add user message to chat
    addMessageToChat({
      content: promptText,
      isUser: true,
      timestamp: new Date(),
    });
    
    // Clear input
    inputArea.value = '';
    inputArea.style.height = 'auto';
    sendButton.disabled = true;
    sendButton.style.opacity = '0.5';
    
    try {
      // Show loading indicator
      const loadingIndicator = createElement('div', {
        className: 'message ai-message loading',
        innerHTML: '<div class="loading-dots"><span></span><span></span><span></span></div>',
      });
      chatContent.appendChild(loadingIndicator);
      
      // Get AI response from API
      const response = await apiService.sendPrompt(promptText, context);
      
      // Remove loading indicator
      chatContent.removeChild(loadingIndicator);
      
      // Add AI message to chat
      addMessageToChat({
        content: response,
        isUser: false,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Show error message
      addMessageToChat({
        content: '抱歉，在處理您的請求時發生錯誤。請再試一次。',
        isUser: false,
        timestamp: new Date(),
      });
    }
  });

  // Handle Enter key press
  inputArea.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      if (!sendButton.disabled) {
        sendButton.click();
      }
    }
  });

  // New chat button functionality
  const newChatBtn = document.querySelector('.new-chat-btn') as HTMLButtonElement;
  newChatBtn.addEventListener('click', async () => {
    try {
      await apiService.createNewChat();
      
      // Clear chat area and show empty state
      chatContent.innerHTML = '';
      chatContent.appendChild(emptyState);
      
      // Clear input
      inputArea.value = '';
      inputArea.style.height = 'auto';
      sendButton.disabled = true;
      sendButton.style.opacity = '0.5';
    } catch (error) {
      console.error('Error creating new chat:', error);
    }
  });
}

/**
 * Setup scene cards functionality
 * @param apiService - The API service instance
 */
function setupSceneCards(apiService: ApiService): void {
  const sceneCards = document.querySelectorAll('.scene-card');
  const inputArea = document.querySelector('.input-area') as HTMLTextAreaElement;
  const emptyState = document.querySelector('.empty-state') as HTMLElement;
  const chatContent = document.querySelector('.chat-content') as HTMLElement;
  
  if (!inputArea || !emptyState || !chatContent) {
    console.error('Required elements not found');
    return;
  }

  // Handle scene card click
  sceneCards.forEach((card, index) => {
    card.addEventListener('click', async () => {
      const sceneTitle = card.querySelector('h2')?.textContent || `場景 ${String.fromCharCode(65 + index)}`;
      const sceneDesc = card.querySelector('p')?.textContent || '';
      
      // Update context selector to match selected scene
      const contextText = document.querySelector('.context-selector-text');
      if (contextText) {
        contextText.textContent = sceneTitle;
      }
      
      // Update active context in dropdown
      const contextOptions = document.querySelectorAll('.context-option');
      contextOptions.forEach(option => {
        const isMatchingContext = option.getAttribute('data-context') === String.fromCharCode(65 + index);
        option.classList.toggle('active', isMatchingContext);
      });
      
      // Remove empty state
      if (emptyState && emptyState.parentNode === chatContent) {
        chatContent.removeChild(emptyState);
      }

      try {
        // Show loading indicator
        const loadingIndicator = createElement('div', {
          className: 'message ai-message loading',
          innerHTML: '<div class="loading-dots"><span></span><span></span><span></span></div>',
        });
        chatContent.appendChild(loadingIndicator);
        
        // Get automated introduction message from API
        const introMessage = await apiService.sendPrompt(
          `請提供${sceneTitle}的介紹與使用說明`,
          String.fromCharCode(65 + index)
        );
        
        // Remove loading indicator
        chatContent.removeChild(loadingIndicator);
        
        // Add AI introduction message
        const messageElement = createElement('div', {
          className: 'message ai-message',
        });
        
        const contentElement = createElement('div', {
          className: 'message-content',
          innerHTML: introMessage,
        });
        
        messageElement.appendChild(contentElement);
        chatContent.appendChild(messageElement);
      } catch (error) {
        console.error('Error getting scene introduction:', error);
      }
    });
  });
}
