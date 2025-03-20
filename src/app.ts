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
    // 调用 startSession 而非弃用的 createNewChat
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
      
      // 初始化会话（如果尚未初始化）
      if (!this.apiService.getSessionId()) {
        await this.apiService.startSession();
      }
      
      // 使用 sendChat 而非弃用的 sendPrompt
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
        // 使用完整的响应数据更新侧边栏
        if (chatResponse) {
          this.updateSidebarWithChatData(chatResponse);
          // 确保存储最新响应供其他组件使用
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
    let sidebar = document.querySelector('.practice-sidebar');
    if (!sidebar) {
      sidebar = document.createElement('div');
      sidebar.className = 'practice-sidebar';
      document.body.appendChild(sidebar);
      
      // Add collapse button
      const collapseBtn = document.createElement('button');
      collapseBtn.className = 'sidebar-collapse-btn';
      collapseBtn.innerHTML = '&lt;&lt;';
      collapseBtn.addEventListener('click', () => {
        sidebar?.classList.toggle('collapsed');
        collapseBtn.innerHTML = sidebar?.classList.contains('collapsed') ? '&gt;&gt;' : '&lt;&lt;';
      });
      sidebar.appendChild(collapseBtn);
    }
    
    // Update sidebar content
    this.updateSidebarContent(sessionData);
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
    const sidebar = document.querySelector('.practice-sidebar');
    if (sidebar) {
      sidebar.remove();
    }
  }
  
  /**
   * Update sidebar content with session data
   * @param data The data to display
   */
  private updateSidebarContent(data: any): void {
    const sidebar = document.querySelector('.practice-sidebar');
    if (!sidebar) return;
    
    // Store the data for future reference
    this.apiService.sessionData = data;
    
    // Clear existing content (except collapse button)
    const collapseBtn = sidebar.querySelector('.sidebar-collapse-btn');
    sidebar.innerHTML = '';
    if (collapseBtn) sidebar.appendChild(collapseBtn);
    
    // Add character info summary section
    const characterSection = document.createElement('div');
    characterSection.className = 'sidebar-section character-summary-section';
    
    // Extract key information from character data
    const characterInfo = data.characterInfo || {};
    const basicInfo = [
      { label: '年齡', value: characterInfo.年齡 || 'N/A' },
      { label: '性別', value: characterInfo.性別 || 'N/A' },
      { label: '婚姻狀況', value: characterInfo.婚姻狀況 || 'N/A' },
      { label: '職業', value: characterInfo.職業類型 || 'N/A' }
    ];
    
    // Create summary HTML
    let summaryHTML = `<h3>角色概要</h3><div class="character-summary-content">`;
    
    // Add avatar with name
    summaryHTML += `
      <div class="sidebar-avatar-container">
        <div class="sidebar-avatar character-avatar">${characterInfo.性別 === '女' ? 'PA' : 'PA'}</div>
        <span>客戶 #${characterInfo.客戶編號 || '?'}</span>
      </div>
      <div class="sidebar-info-grid">
    `;
    
    // Add basic info grid
    basicInfo.forEach(item => {
      summaryHTML += `
        <div class="sidebar-info-item">
          <span class="info-label">${item.label}:</span>
          <span class="info-value">${item.value}</span>
        </div>
      `;
    });
    
    // Close grid and content divs
    summaryHTML += `</div></div>`;
    
    // Set HTML and append
    characterSection.innerHTML = summaryHTML;
    sidebar.appendChild(characterSection);
    
    // Parse stage description to display formatted content instead of raw JSON
    const stageDescription = this.parseStageDescription(data.stageDescription || '{}');
    
    // Add stage info section with improved styling
    const stageSection = document.createElement('div');
    stageSection.className = 'sidebar-section stage-info-section';
    stageSection.innerHTML = `
      <h3>階段資訊</h3>
      <div class="stage-info-content">
        <div class="stage-indicator">
          <span class="stage-number">${data.currentStage}</span>
          <div class="stage-progress">
            <div class="stage-progress-bar" style="width: ${Math.min(data.currentStage * 20, 100)}%"></div>
          </div>
        </div>
        <div class="stage-description">${stageDescription}</div>
      </div>
    `;
    sidebar.appendChild(stageSection);
  }
  
  /**
   * Parse stage description JSON to formatted HTML with clear sections
   * @param jsonStr The JSON string or object to parse
   * @returns Formatted HTML string
   */
  private parseStageDescription(jsonStr: string): string {
    console.log('Stage description input:', jsonStr);
    try {
      // Try to parse JSON
      let stageInfo;
      
      // Check if it's already an object
      if (typeof jsonStr === 'object') {
        stageInfo = jsonStr;
      } else {
        // 替换单引号为双引号，并修复常见的JSON格式错误
        let cleanedJson = jsonStr
          .replace(/'/g, '"')
          .replace(/([{,]\s*)([a-zA-Z0-9_\u4e00-\u9fa5]+)\s*:/g, '$1"$2":')
          .replace(/,\s*([}\]])/g, '$1')
          .replace(/\(/g, '[').replace(/\)/g, ']');
          
        // 尝试解析，如果失败则进行更多清理
        try {
          stageInfo = JSON.parse(cleanedJson);
        } catch (parseError) {
          console.warn('First parse attempt failed, trying deeper cleanup:', parseError);
          // 如果仍然失败，尝试更激进的格式修复
          // 例如，找出第一层的键值对并手动构建对象
          const keyValuePairs = cleanedJson.match(/"([^"]+)"\s*:\s*([^,}]+)/g);
          if (keyValuePairs) {
            const manualObj: Record<string, any> = {};
            keyValuePairs.forEach(pair => {
              const [key, value] = pair.split(':').map(p => p.trim());
              const cleanKey = key.replace(/"/g, '');
              // 处理可能的字符串值、数字或布尔值
              try {
                manualObj[cleanKey] = JSON.parse(value);
              } catch {
                manualObj[cleanKey] = value.replace(/^"|"$/g, '');
              }
            });
            stageInfo = manualObj;
          } else {
            throw parseError; // 如果无法修复，则重新抛出原始错误
          }
        }
      }
      
      // Format the stage info into HTML
      let html = '';
      
      // 添加階段標題，如果有的話
      if (stageInfo.階段) {
        html += `<div class="stage-title"><strong>階段：</strong> ${stageInfo.階段}</div>`;
      }
      
      // 提取階段描述
      if (stageInfo.階段描述) {
        html += `<div class="stage-section">
          <div class="stage-section-title">階段描述</div>
          <div class="stage-section-content">${stageInfo.階段描述}</div>
        </div>`;
      } else if (stageInfo.描述) {
        // 兼容舊格式
        html += `<div class="stage-section">
          <div class="stage-section-title">階段描述</div>
          <div class="stage-section-content">${stageInfo.描述}</div>
        </div>`;
      }
      
      // 提取當前客戶狀態描述
      if (stageInfo.當前客戶狀態描述) {
        html += `<div class="stage-section">
          <div class="stage-section-title">當前客戶狀態描述</div>
          <div class="stage-section-content">${stageInfo.當前客戶狀態描述}</div>
        </div>`;
      }
      
      // 提取進入下一階段條件
      if (stageInfo.進入下一階段條件) {
        html += `<div class="stage-section">
          <div class="stage-section-title">進入下一階段條件</div>
          <div class="stage-section-content">`;
        
        if (typeof stageInfo.進入下一階段條件 === 'string') {
          html += `<ul class="passing-conditions"><li>${stageInfo.進入下一階段條件}</li></ul>`;
        } else if (Array.isArray(stageInfo.進入下一階段條件)) {
          html += `<ul class="passing-conditions">`;
          stageInfo.進入下一階段條件.forEach((condition: string) => {
            html += `<li>${condition}</li>`;
          });
          html += `</ul>`;
        } else {
          // Handle object case
          html += `<ul class="passing-conditions">`;
          Object.entries(stageInfo.進入下一階段條件).forEach(([key, value]) => {
            html += `<li><strong>${key}:</strong> ${value}</li>`;
          });
          html += `</ul>`;
        }
        
        html += `</div></div>`;
      }
      
      // 如果沒有提取到主要字段，則嘗試使用其他可能的字段
      if (html === '') {
        if (stageInfo.目標) {
          html += `<div class="stage-section">
            <div class="stage-section-title">階段目標</div>
            <div class="stage-section-content">${stageInfo.目標}</div>
          </div>`;
        }
        
        if (stageInfo.議題) {
          html += `<div class="stage-section">
            <div class="stage-section-title">議題</div>
            <div class="stage-section-content">${stageInfo.議題}</div>
          </div>`;
        }
      }
      
      // 檢查通過條件，作為替代進入下一階段條件
      if (stageInfo.通過條件 && !stageInfo.進入下一階段條件) {
        html += `<div class="stage-section">
          <div class="stage-section-title">通過條件</div>
          <div class="stage-section-content">`;
        
        if (typeof stageInfo.通過條件 === 'string') {
          html += `<ul class="passing-conditions"><li>${stageInfo.通過條件}</li></ul>`;
        } else if (Array.isArray(stageInfo.通過條件)) {
          html += `<ul class="passing-conditions">`;
          stageInfo.通過條件.forEach((condition: string) => {
            html += `<li>${condition}</li>`;
          });
          html += `</ul>`;
        } else {
          // Handle object case
          html += `<ul class="passing-conditions">`;
          Object.entries(stageInfo.通過條件).forEach(([key, value]) => {
            html += `<li><strong>${key}:</strong> ${value}</li>`;
          });
          html += `</ul>`;
        }
        
        html += `</div></div>`;
      }
      
      // 將所有內容包裹在一個容器內
      if (html) {
        html = `<div class="stage-info-details">${html}</div>`;
      }
      
      // If nothing was extracted, return the stringified JSON
      return html || `<pre class="stage-raw-json">${JSON.stringify(stageInfo, null, 2)}</pre>`;
    } catch (e) {
      // 解析失敗時，採用出錯排除法，並返回格式化的錯誤訊息
      console.error('Error parsing stage description:', e);
      return `<div class="stage-parse-error">
        <p><strong>錯誤：</strong>無法解析階段描述。</p>
        <div class="stage-raw-data">${jsonStr}</div>
      </div>`;
    }
  }
  
  /**
   * Update sidebar with chat response data
   * @param data The chat response data
   */
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
  
  private updateSidebarWithChatData(data: any): void {
    const sidebar = document.querySelector('.practice-sidebar');
    if (!sidebar) return;
    
    // Store the data for future reference
    if (this.apiService.lastChatResponse !== data) {
      this.apiService.lastChatResponse = data;
    }
    
    // 只更新有新資料的部分，保留沒有新資料的部分
    
    // Update stage info if we have stage information
    if (data.stageDescription) {
      const stageSection = sidebar.querySelector('.stage-info-section');
      if (stageSection) {
        // Parse the stage description to formatted HTML
        const stageDescription = this.parseStageDescription(data.stageDescription || '{}');
        
        stageSection.innerHTML = `
          <h3>階段資訊</h3>
          <div class="stage-info-content">
            <div class="stage-indicator">
              <span class="stage-number">${data.currentStage || '1'}</span>
              <div class="stage-progress">
                <div class="stage-progress-bar" style="width: ${Math.min((data.currentStage || 1) * 20, 100)}%"></div>
              </div>
            </div>
            <div class="stage-description">${stageDescription}</div>
          </div>
        `;
      }
    }
    
    // Add or update inner activity section if we have activity data
    if (data.innerActivity) {
      let innerActivitySection = sidebar.querySelector('.inner-activity-section');
      if (!innerActivitySection) {
        innerActivitySection = document.createElement('div');
        innerActivitySection.className = 'sidebar-section inner-activity-section';
        sidebar.appendChild(innerActivitySection);
      }
      
      innerActivitySection.innerHTML = `
        <h3>AI 內部活動</h3>
        <div class="inner-activity-content">
          <pre>${data.innerActivity || '無資料'}</pre>
        </div>
      `;
    }
  }
}
