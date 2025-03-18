import { ChatMessage, ChatContext } from '../types';
import { createElement } from '../utils/domUtils';

/**
 * Interface for the chat content callbacks
 */
export interface ChatContentCallbacks {
  onSceneCardClick: (sceneIndex: number, sceneTitle: string) => void;
}

/**
 * Class to manage the chat content area
 */
export class ChatContent {
  private chatContentElement: HTMLElement;
  private emptyStateElement: HTMLElement;
  private lastMessageDate: string | null = null;
  
  /**
   * Initialize the chat content manager
   * @param callbacks Object containing all callback functions
   */
  constructor(callbacks: ChatContentCallbacks) {
    this.chatContentElement = document.querySelector('.chat-content') as HTMLElement;
    this.emptyStateElement = document.querySelector('.empty-state') as HTMLElement;
    
    if (!this.chatContentElement || !this.emptyStateElement) {
      console.error('Required chat content elements not found');
      return;
    }
    
    // 創建消息容器
    this.createMessagesContainer();
    
    this.setupSceneCards(callbacks.onSceneCardClick);
  }
  
  /**
   * 創建消息容器元素
   */
  private createMessagesContainer(): void {
    // 檢查是否已存在
    if (this.chatContentElement.querySelector('.messages-container')) {
      return;
    }
    
    // 創建容器
    const messagesContainer = createElement('div', {
      className: 'messages-container',
    });
    
    // 初始只有空狀態，所以容器初始是空的
    this.chatContentElement.appendChild(messagesContainer);
  }
  
  /**
   * Add a message to the chat
   * @param message The message to add
   */
  addMessage(message: ChatMessage): void {
    const messagesContainer = this.chatContentElement.querySelector('.messages-container') as HTMLElement;
    
    // Remove empty state if it's still in the DOM
    if (this.emptyStateElement.parentNode === this.chatContentElement) {
      this.chatContentElement.removeChild(this.emptyStateElement);
    }

    // Check if we need to add a date separator
    this.addDateSeparatorIfNeeded(message.timestamp, messagesContainer);
    
    // Create message element
    const messageElement = createElement('div', {
      className: `message ${message.isUser ? 'user-message' : 'ai-message'}`,
    });
    
    // Add header for AI messages
    if (!message.isUser) {
      const headerElement = createElement('div', {
        className: 'message-header',
      });
      
      const avatarElement = createElement('div', {
        className: 'avatar',
        textContent: 'PA',
      });
      
      headerElement.appendChild(avatarElement);
      messageElement.appendChild(headerElement);
    }

    // Add bubble with content
    const bubbleElement = createElement('div', {
      className: 'message-bubble',
      innerHTML: message.content,
    });
    
    messageElement.appendChild(bubbleElement);
    
    // Add timestamp
    const timestamp = new Intl.DateTimeFormat('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(message.timestamp);
    
    const timestampElement = createElement('div', {
      className: 'message-timestamp',
      textContent: timestamp,
    });
    
    messageElement.appendChild(timestampElement);
    
    // Add to container
    messagesContainer.appendChild(messageElement);
    
    // Scroll to bottom
    this.scrollToBottom();
  }
  
  /**
   * Add a loading indicator to the chat
   * @returns The loading indicator element (to be removed later)
   */
  addLoadingIndicator(): HTMLElement {
    const messagesContainer = this.chatContentElement.querySelector('.messages-container') as HTMLElement;
    
    // Remove empty state if it's still in the DOM
    if (this.emptyStateElement.parentNode === this.chatContentElement) {
      this.chatContentElement.removeChild(this.emptyStateElement);
    }
    
    const loadingMessage = createElement('div', {
      className: 'loading-message',
    });
    
    const loadingDots = createElement('div', {
      className: 'loading-dots',
      innerHTML: '<span></span><span></span><span></span>',
    });
    
    loadingMessage.appendChild(loadingDots);
    messagesContainer.appendChild(loadingMessage);
    
    // Scroll to bottom
    this.scrollToBottom();
    
    return loadingMessage;
  }
  
  /**
   * Remove an element from the chat
   * @param element The element to remove
   */
  removeElement(element: HTMLElement): void {
    const messagesContainer = this.chatContentElement.querySelector('.messages-container') as HTMLElement;
    
    if (element.parentNode === messagesContainer) {
      messagesContainer.removeChild(element);
    }
  }
  
  /**
   * Reset the chat content to its initial state
   */
  reset(): void {
    // Get messages container
    const messagesContainer = this.chatContentElement.querySelector('.messages-container') as HTMLElement;
    
    // Clear messages container
    if (messagesContainer) {
      messagesContainer.innerHTML = '';
    }
    
    // Reset the last message date
    this.lastMessageDate = null;
    
    // Remove messages container and add empty state back
    if (messagesContainer && messagesContainer.parentNode === this.chatContentElement) {
      this.chatContentElement.removeChild(messagesContainer);
    }
    
    // Check if empty state is already in the DOM
    if (this.emptyStateElement.parentNode !== this.chatContentElement) {
      this.chatContentElement.appendChild(this.emptyStateElement);
    }
    
    // Re-create the messages container (but it will be empty)
    this.createMessagesContainer();
  }
  
  /**
   * Add a date separator if the message is from a different day
   * @param timestamp The timestamp of the message
   * @param container The container to add the separator to
   */
  private addDateSeparatorIfNeeded(timestamp: Date, container: HTMLElement): void {
    const messageDate = new Intl.DateTimeFormat('zh-TW', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(timestamp);
    
    // If this is the first message or a different day from the last message
    if (this.lastMessageDate === null || this.lastMessageDate !== messageDate) {
      const separator = createElement('div', {
        className: 'date-separator',
        textContent: messageDate,
      });
      
      container.appendChild(separator);
      this.lastMessageDate = messageDate;
    }
  }
  
  /**
   * Set up the scene cards
   * @param onSceneCardClick Callback for when a scene card is clicked
   */
  private setupSceneCards(onSceneCardClick: (index: number, title: string) => void): void {
    const sceneCards = document.querySelectorAll('.scene-card');
    
    sceneCards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const sceneTitle = card.querySelector('h2')?.textContent || `場景 ${String.fromCharCode(65 + index)}`;
        onSceneCardClick(index, sceneTitle);
      });
    });
  }
  
  /**
   * Scroll chat content to the bottom
   */
  private scrollToBottom(): void {
    const messagesContainer = this.chatContentElement.querySelector('.messages-container') as HTMLElement;
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }
}
