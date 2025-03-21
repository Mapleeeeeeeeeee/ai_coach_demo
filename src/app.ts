import { ApiService } from './services/apiService';
import { ChatContent, ChatContentCallbacks } from './components/ChatContent';
import { setupInputArea, InputAreaCallbacks } from './components/InputArea';
import { setupHeader } from './components/Header';
import { ChatContext, ChatMessage } from './types';
import { safeJsonParse } from './utils/jsonParser';
import { Sidebar, SidebarCallbacks } from './components/Sidebar';

/**
 * Main application class
 */
export class App {
  private apiService: ApiService;
  private chatContent!: ChatContent;
  private currentContext: ChatContext = 'A';
  private sidebar: Sidebar | null = null;
  
  /**
   * Initialize the app
   * @param apiBaseUrl Base URL for the API
   */
  constructor(apiBaseUrl: string) {
    this.apiService = new ApiService(apiBaseUrl);
    
    // Initialize components
    this.initializeComponents();
    
    // Setup character avatar click behavior
    this.setupCharacterAvatarClick();
    
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
    // Call startSession instead of deprecated createNewChat
    this.apiService.startSession()
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
      
      // Initialize session if not already initialized
      if (!this.apiService.getSessionId()) {
        await this.apiService.startSession();
      }
      
      // Use sendChat instead of deprecated sendPrompt
      const chatResponse = await this.apiService.sendChat(message);
      
      // Remove loading indicator
      this.chatContent.removeElement(loadingIndicator);
      
      // Add AI message to chat
      this.chatContent.addMessage({
        content: chatResponse.responseText,
        isUser: false,
        timestamp: new Date()
      });
      
      // If in practice mode, update sidebar with chat data
      if (document.body.classList.contains('practice-mode')) {
        // Use complete response data to update sidebar
        if (chatResponse) {
          this.updateSidebarWithChatData(chatResponse);
          // Store latest response for other components
          this.apiService.lastChatResponse = chatResponse;
        }
      }
      
      // If in exam mode and passed, show success message and reveal info
      if (document.body.classList.contains('exam-mode')) {
        if (chatResponse && chatResponse.isPass) {
          // If this stage is passed
          if (!document.body.classList.contains('stage-passed')) {
            document.body.classList.add('stage-passed');
            this.chatContent.addMessage({
              content: '🎉 恭喜您通過此階段！',
              isUser: false,
              timestamp: new Date()
            });
          }
          
          // If the entire exam is finished
          if (chatResponse.finished) {
            document.body.classList.add('exam-finished');
            this.chatContent.addMessage({
              content: '🏆 恭喜您完成所有階段測試！',
              isUser: false,
              timestamp: new Date()
            });
            
            // Show all info that was hidden
            this.setupPracticeMode(chatResponse);
          }
        }
      }
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
    
    // Show mode selection dialog
    this.showModeSelectionDialog(sceneTitle, contextLetter);
  }
  
  /**
   * Show mode selection dialog (practice or exam)
   * @param sceneTitle The title of the selected scene
   * @param contextLetter The context letter (A, B, C)
   */
  private showModeSelectionDialog(sceneTitle: string, contextLetter: ChatContext): void {
    // Remove existing mode dialog if present
    const existingDialog = document.querySelector('.mode-selection-dialog');
    if (existingDialog) {
      existingDialog.remove();
    }
    
    // Create dialog element
    const dialog = document.createElement('div');
    dialog.className = 'mode-selection-dialog';
    dialog.innerHTML = `
      <div class="mode-selection-header">
        <h2>請選擇模式</h2>
        <p>您已選擇 ${sceneTitle}，請選擇您想要的模式</p>
      </div>
      <div class="mode-options">
        <div class="mode-option practice-mode">
          <h3>練習模式</h3>
          <p>顯示所有提示和輔助資訊，幫助您進行練習</p>
          <button class="mode-select-btn practice-btn">選擇練習模式</button>
        </div>
        <div class="mode-option exam-mode">
          <h3>考試模式</h3>
          <p>隱藏提示和輔助資訊，測試您的能力</p>
          <button class="mode-select-btn exam-btn">選擇考試模式</button>
        </div>
      </div>
    `;
    
    // Add dialog to the DOM
    document.body.appendChild(dialog);
    
    // Add event listeners to buttons
    const practiceBtn = dialog.querySelector('.practice-btn');
    const examBtn = dialog.querySelector('.exam-btn');
    
    if (practiceBtn && examBtn) {
      practiceBtn.addEventListener('click', () => {
        this.startSession(contextLetter, 'practice');
        dialog.remove();
      });
      
      examBtn.addEventListener('click', () => {
        this.startSession(contextLetter, 'exam');
        dialog.remove();
      });
    }
  }
  
  /**
   * Start a new session with the selected mode
   * @param contextLetter The context letter (A, B, C)
   * @param mode The selected mode ('practice' or 'exam')
   */
  private async startSession(contextLetter: ChatContext, mode: 'practice' | 'exam'): Promise<void> {
    try {
      // Show loading indicator
      const loadingIndicator = this.chatContent.addLoadingIndicator();
      
      // Start new session with API
      const sessionData = await this.apiService.startSession();
      
      // Remove loading indicator
      this.chatContent.removeElement(loadingIndicator);
      
      // Setup UI based on mode
      if (mode === 'practice') {
        this.setupPracticeMode(sessionData);
      } else {
        this.setupExamMode(sessionData);
      }
      
      // Welcome message based on character info
      const welcomeMessage = `您已進入${mode === 'practice' ? '練習' : '考試'}模式。`;
      
      this.chatContent.addMessage({
        content: welcomeMessage,
        isUser: false,
        timestamp: new Date()
      });
    } catch (error) {
      console.error('Error starting session:', error);
      
      // Show error message
      this.chatContent.addMessage({
        content: '抱歉，無法啟動會話。請再試一次。',
        isUser: false,
        timestamp: new Date()
      });
    }
  }
  
  /**
   * Setup UI for practice mode
   * @param sessionData The session data from API
   */
  private setupPracticeMode(sessionData: any): void {
    // Remove exam-only classes if present
    document.body.classList.remove('exam-mode');
    document.body.classList.add('practice-mode');
    
    // Create sidebar if it doesn't exist
    if (!this.sidebar) {
      const sidebarCallbacks: SidebarCallbacks = {
        onToggle: this.handleSidebarToggle.bind(this)
      };
      this.sidebar = new Sidebar(this.apiService, sidebarCallbacks);
    }
    
    // Update sidebar content
    this.sidebar.updateContent(sessionData);
  }
  
  /**
   * Handle sidebar toggle event
   * @param collapsed Whether the sidebar is collapsed
   */
  private handleSidebarToggle(collapsed: boolean): void {
    
    // Adjust chat content margin
    const chatContent = document.querySelector('.chat-content');
    if (chatContent) {
      if (collapsed) {
        chatContent.classList.add('sidebar-collapsed');
      } else {
        chatContent.classList.remove('sidebar-collapsed');
      }
    } else {
      console.warn('Chat content element not found');
    }
    
    // Force a layout reflow to ensure transitions are applied
    document.body.style.minHeight = (document.body.offsetHeight + 1) + 'px';
    setTimeout(() => {
      document.body.style.minHeight = '';
    }, 10);
  }
  
  /**
   * Setup UI for exam mode
   * @param sessionData The session data from API
   */
  private setupExamMode(sessionData: any): void {
    // Add exam-mode class to body
    document.body.classList.remove('practice-mode');
    document.body.classList.add('exam-mode');
    
    // Remove sidebar if exists
    if (this.sidebar) {
      this.sidebar.remove();
      this.sidebar = null;
    }
  }
  
  /**
   * Update sidebar with chat response data
   * @param data The chat response data
   */
  private updateSidebarWithChatData(data: any): void {
    if (this.sidebar) {
      this.sidebar.updateWithChatData(data);
    }
  }
  
  /**
   * Setup click event for character avatar
   */
  private setupCharacterAvatarClick(): void {
    // Use event delegation to handle future avatar elements
    document.body.addEventListener('click', (event) => {
      const target = event.target as HTMLElement;
      const avatar = target.closest('.avatar') || target.closest('.character-avatar');
      
      if (avatar) {
        this.showCharacterInfoModal();
      }
    });
  }
  
  /**
   * Show character info modal
   */
  private showCharacterInfoModal(): void {
    // Get character info from API service
    const apiService = this.apiService as any;
    
    // Try to get character info from both sessionData and lastChatResponse
    // This ensures we catch whichever one has the data
    const characterInfo = apiService.sessionData?.characterInfo || 
                          apiService.sessionData?.character_info || 
                          apiService.lastChatResponse?.characterInfo || 
                          apiService.lastChatResponse?.character_info || {};
    
    // Same for character detail
    const characterDetail = apiService.sessionData?.characterDetail || 
                            apiService.sessionData?.character_detail || 
                            apiService.lastChatResponse?.characterDetail || 
                            apiService.lastChatResponse?.character_detail || '無詳細資訊';
    
    // Debug logs
    console.log('Character Info:', characterInfo);
    console.log('Character Detail:', characterDetail);
    console.log('Session Data:', apiService.sessionData);
    console.log('Last Chat Response:', apiService.lastChatResponse);
    
    // Remove existing modal if present
    const existingModal = document.querySelector('.character-info-modal');
    if (existingModal) {
      existingModal.remove();
    }
    
    // Check if we're in exam mode and adjust what we show
    const isExamMode = document.body.classList.contains('exam-mode');
    const isExamFinished = document.body.classList.contains('exam-finished');
    
    // Create modal element
    const modal = document.createElement('div');
    modal.className = 'character-info-modal';
    
    if (isExamMode && !isExamFinished) {
      // Limited info for exam mode
      modal.innerHTML = `
        <div class="character-info-modal-content">
          <div class="character-info-modal-header">
            <h2>角色資訊</h2>
            <button class="character-info-modal-close">&times;</button>
          </div>
          <div class="character-info-modal-body">
            <div class="character-detail">
              <div class="exam-mode-message">
                <p>考試模式下，只能查看限定的角色資訊。</p>
                <div class="limited-info">
                  <p><strong>年齡：</strong>${characterInfo.年齡 || 'N/A'}</p>
                  <p><strong>性別：</strong>${characterInfo.性別 || 'N/A'}</p>
                  <p><strong>婚姻程度：</strong>${characterInfo.婚姻狀況 || 'N/A'}</p>
                  <p><strong>教育程度：</strong>${characterInfo.教育程度 || 'N/A'}</p>
                  <p><strong>收入：</strong>${characterInfo.收入 || 'N/A'}</p>
                  <p><strong>職業類型：</strong>${characterInfo.職業類型 || 'N/A'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    } else {
      // Full info for practice mode or completed exam
      modal.innerHTML = `
        <div class="character-info-modal-content">
          <div class="character-info-modal-header">
            <h2>角色資訊</h2>
            <button class="character-info-modal-close">&times;</button>
          </div>
          <div class="character-info-modal-body">
            <div class="character-detail">
              <h3>角色詳細訊息</h3>
              <p>${characterDetail}</p>
            </div>
            <div class="character-json">
              <h3>角色數據</h3>
              <pre>${JSON.stringify(characterInfo, null, 2)}</pre>
            </div>
          </div>
        </div>
      `;
    }
    
    // Add modal to the DOM
    document.body.appendChild(modal);
    
    // Add close button event listener
    const closeBtn = modal.querySelector('.character-info-modal-close');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.remove();
      });
    }
    
    // Close when clicking outside modal content
    modal.addEventListener('click', (event) => {
      if (event.target === modal) {
        modal.remove();
      }
    });
  }
}
