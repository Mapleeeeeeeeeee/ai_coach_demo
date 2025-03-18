import { ChatContext } from '../types';
import { getElement } from '../utils/domUtils';

/**
 * Sets up the header component with context dropdown and new chat functionality
 * @param onContextChange Callback for when context is changed
 * @param onNewChat Callback for when new chat button is clicked
 */
export function setupHeader(
  onContextChange: (context: ChatContext) => void,
  onNewChat: () => void
): void {
  setupContextDropdown(onContextChange);
  setupNewChatButton(onNewChat);
}

/**
 * Sets up the context dropdown functionality
 * @param onContextChange Callback for when context is changed
 */
function setupContextDropdown(onContextChange: (context: ChatContext) => void): void {
  const contextSelector = getElement('contextSelector');
  const contextDropdown = getElement('contextDropdown');
  const contextOptions = document.querySelectorAll('.context-option');
  const contextText = contextSelector.querySelector('.context-selector-text');

  // Toggle dropdown when clicking the selector
  contextSelector.addEventListener('click', (event) => {
    event.stopPropagation();
    contextDropdown.classList.toggle('show');
  });

  // Handle context option selection
  contextOptions.forEach((option) => {
    option.addEventListener('click', () => {
      const context = option.getAttribute('data-context') as ChatContext || 'A';
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
      
      // Trigger callback
      onContextChange(context);
      console.log(`Context changed to: ${context}`);
    });
  });

  // Close dropdown when clicking outside
  window.addEventListener('click', () => {
    contextDropdown.classList.remove('show');
  });
}

/**
 * Sets up the new chat button functionality
 * @param onNewChat Callback for when new chat button is clicked
 */
function setupNewChatButton(onNewChat: () => void): void {
  const newChatBtn = document.querySelector('.new-chat-btn') as HTMLButtonElement;
  if (!newChatBtn) {
    console.error('New chat button not found');
    return;
  }
  
  newChatBtn.addEventListener('click', () => {
    onNewChat();
  });
}
