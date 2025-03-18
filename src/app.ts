import { ApiService } from './services/apiService';
import { ChatContent, ChatContentCallbacks } from './components/ChatContent';
import { setupInputArea, InputAreaCallbacks } from './components/InputArea';
import { setupHeader } from './components/Header';
import { ChatContext, ChatMessage } from './types';

/**
 * Main application class
 */
export class App {
  private apiService: ApiService;
  private chatContent!: ChatContent;
  private currentContext: ChatContext = 'A';
  
  /**
   * Initialize the app
   * @param apiBaseUrl Base URL for the API
   */
  constructor(apiBaseUrl: string) {
    this.apiService = new ApiService(apiBaseUrl);
    
    // Initialize components
    this.initializeComponents();
    
    console.log('AI Coach application initialized');
  }
  
  /**
   * Initialize all UI components and their callbacks
   */
  private initializeComponents(): void {
    // Set up chat content with callbacks
    const chatContentCallbacks: ChatContentCallbacks = {
      onSceneCardClick: this.handleSceneCardClick.bind(this)
    };
    this.chatContent = new ChatContent(chatContentCallbacks);
    
    // Set up input area with callbacks
    const inputAreaCallbacks: InputAreaCallbacks = {
      onSend: this.handleSendMessage.bind(this),
      onUpload: this.handleFileUpload.bind(this),
      onSearch: this.handleSearch.bind(this),
      onResearch: this.handleResearch.bind(this)
    };
    setupInputArea(inputAreaCallbacks);
    
    // Set up header with callbacks
    setupHeader(
      this.handleContextChange.bind(this),
      this.handleNewChat.bind(this)
    );
  }
  
  /**
   * Handle context change from the dropdown
   * @param context The new context
   */
  private handleContextChange(context: ChatContext): void {
    this.currentContext = context;
    console.log(`App: Context changed to ${context}`);
  }
  
  /**
   * Handle new chat button click
   */
  private handleNewChat(): void {
    this.apiService.createNewChat()
      .then(() => {
        this.chatContent.reset();
        console.log('App: New chat created');
      })
      .catch(error => {
        console.error('Error creating new chat:', error);
      });
  }
  
  /**
   * Handle sending a message
   * @param message The message to send
   */
  private async handleSendMessage(message: string): Promise<void> {
    // Add user message to chat
    this.chatContent.addMessage({
      content: message,
      isUser: true,
      timestamp: new Date()
    });
    
    try {
      // Show loading indicator
      const loadingIndicator = this.chatContent.addLoadingIndicator();
      
      // Get AI response from API
      const response = await this.apiService.sendPrompt(message, this.currentContext);
      
      // Remove loading indicator
      this.chatContent.removeElement(loadingIndicator);
      
      // Add AI message to chat
      this.chatContent.addMessage({
        content: response,
        isUser: false,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Show error message
      this.chatContent.addMessage({
        content: '抱歉，在處理您的請求時發生錯誤。請再試一次。',
        isUser: false,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Handle file upload
   * @param file The file to upload
   */
  private handleFileUpload(file: File): void {
    this.apiService.uploadFile(file)
      .then(result => {
        console.log('File uploaded successfully:', result);
        
        // Add a message about the upload
        this.chatContent.addMessage({
          content: `檔案 <strong>${file.name}</strong> 已上傳成功。`,
          isUser: false,
          timestamp: new Date()
        });
      })
      .catch(error => {
        console.error('Error uploading file:', error);
        
        // Show error message
        this.chatContent.addMessage({
          content: `抱歉，無法上傳檔案 "${file.name}"。請再試一次。`,
          isUser: false,
          timestamp: new Date()
        });
      });
  }
  
  /**
   * Handle search button click
   */
  private handleSearch(): void {
    const inputArea = document.querySelector('.input-area') as HTMLTextAreaElement;
    if (!inputArea || !inputArea.value.trim()) {
      alert('請先輸入搜尋內容');
      return;
    }
    
    const query = inputArea.value.trim();
    this.chatContent.addMessage({
      content: `正在網路上搜尋: "${query}"`,
      isUser: false,
      timestamp: new Date()
    });
    
    // In a real app, you would call a search API here
    console.log('Performing search for:', query);
  }
  
  /**
   * Handle research button click
   */
  private handleResearch(): void {
    const inputArea = document.querySelector('.input-area') as HTMLTextAreaElement;
    if (!inputArea || !inputArea.value.trim()) {
      alert('請先輸入研究主題');
      return;
    }
    
    const topic = inputArea.value.trim();
    this.chatContent.addMessage({
      content: `正在深入研究主題: "${topic}"`,
      isUser: false,
      timestamp: new Date()
    });
    
    // In a real app, you would call a research API here
    console.log('Performing research on:', topic);
  }
  
  /**
   * Handle scene card click
   * @param sceneIndex The index of the scene card (0 for A, 1 for B, etc.)
   * @param sceneTitle The title of the scene
   */
  private async handleSceneCardClick(sceneIndex: number, sceneTitle: string): Promise<void> {
    const contextLetter = String.fromCharCode(65 + sceneIndex) as ChatContext;
    
    // Update context dropdown UI
    const contextText = document.querySelector('.context-selector-text');
    if (contextText) {
      contextText.textContent = sceneTitle;
    }
    
    // Update active context in dropdown
    const contextOptions = document.querySelectorAll('.context-option');
    contextOptions.forEach(option => {
      const isMatchingContext = option.getAttribute('data-context') === contextLetter;
      option.classList.toggle('active', isMatchingContext);
    });
    
    // Update current context
    this.currentContext = contextLetter;
    
    try {
      // Show loading indicator
      const loadingIndicator = this.chatContent.addLoadingIndicator();
      
      // Get automated introduction message from API
      const introMessage = await this.apiService.sendPrompt(
        `請提供${sceneTitle}的介紹與使用說明`,
        contextLetter
      );
      
      // Remove loading indicator
      this.chatContent.removeElement(loadingIndicator);
      
      // Add AI introduction message
      this.chatContent.addMessage({
        content: introMessage,
        isUser: false,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error getting scene introduction:', error);
      
      // Show error message
      this.chatContent.addMessage({
        content: '抱歉，無法取得場景介紹。請再試一次。',
        isUser: false,
        timestamp: new Date()
      });
    }
  }
}
