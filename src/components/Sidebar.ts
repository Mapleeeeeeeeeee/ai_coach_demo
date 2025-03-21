import { ApiService } from '../services/apiService';
import { safeJsonParse } from '../utils/jsonParser';

/**
 * Interface defining callbacks for the Sidebar component
 */
export interface SidebarCallbacks {
  onToggle: (collapsed: boolean) => void;
}

/**
 * Sidebar component class
 * Handles the practice mode sidebar with character info and stage info
 */
export class Sidebar {
  private element: HTMLElement;
  private collapseBtn: HTMLButtonElement;
  private callbacks: SidebarCallbacks;
  private apiService: ApiService;
  private _collapsed: boolean = false;
  
  /**
   * Get current collapse state
   */
  get collapsed(): boolean {
    return this._collapsed;
  }
  
  /**
   * Create a new Sidebar instance
   * @param apiService The API service to use for data
   * @param callbacks Callbacks to trigger on sidebar events
   */
  constructor(apiService: ApiService, callbacks: SidebarCallbacks) {
    this.apiService = apiService;
    this.callbacks = callbacks;
    
    // Create the sidebar element
    this.element = document.createElement('div');
    this.element.className = 'practice-sidebar';
    
    // Create collapse button
    this.collapseBtn = this.createCollapseButton();
    this.element.appendChild(this.collapseBtn);
    
    // Append to DOM
    document.body.appendChild(this.element);
  }
  
  /**
   * Toggle sidebar visibility
   * @param collapsed Optional state to set
   */
  public toggle(collapsed?: boolean): void {
    // If a specific state is provided, use it. Otherwise toggle current state.
    this._collapsed = collapsed !== undefined ? collapsed : !this._collapsed;
    
    // Update classes and button appearance
    if (this._collapsed) {
      this.element.classList.add('collapsed');
      this.collapseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18l6-6-6-6"></path></svg>';
      this.collapseBtn.setAttribute('title', '展開側邊欄');
      this.collapseBtn.setAttribute('aria-label', '展開側邊欄');
    } else {
      this.element.classList.remove('collapsed');
      this.collapseBtn.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>';
      this.collapseBtn.setAttribute('title', '收合側邊欄');
      this.collapseBtn.setAttribute('aria-label', '收合側邊欄');
    }
    
    // Force layout recalculation
    void this.element.offsetWidth;
    
    // Trigger callback to update other UI elements
    this.callbacks.onToggle(this._collapsed);
  }
  
  /**
   * Update sidebar content with session data
   * @param data Session data to display
   */
  public updateContent(data: any): void {
    // Store the data in API service
    this.apiService.sessionData = data;
    
    // Clear existing content (except collapse button)
    this.element.innerHTML = '';
    this.element.appendChild(this.collapseBtn);
    
    // Add character info section
    this.addCharacterInfoSection(data);
    
    // Add stage info section
    this.addStageInfoSection(data);
  }
  
  /**
   * Update the sidebar with chat response data
   * @param data Chat response data
   */
  public updateWithChatData(data: any): void {
    // Store the data for future reference
    if (this.apiService.lastChatResponse !== data) {
      this.apiService.lastChatResponse = data;
    }
    
    // Update stage info if we have stage information
    if (data.stageDescription) {
      this.updateStageInfoSection(data);
    }
    
    // Add or update inner activity section if we have activity data
    if (data.innerActivity) {
      this.updateInnerActivitySection(data.innerActivity);
    }
  }
  
  /**
   * Remove the sidebar from the DOM
   */
  public remove(): void {
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
  
  /**
   * Create the collapse button
   * @returns The created button
   */
  private createCollapseButton(): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = 'sidebar-collapse-btn';
    button.innerHTML = '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"></path></svg>';
    button.setAttribute('aria-label', '收合側邊欄');
    button.setAttribute('title', '收合側邊欄');
    
    // Add click event with explicit binding to ensure 'this' is correct
    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.toggle();
    });
    
    return button;
  }
  
  /**
   * Add character info section to the sidebar
   * @param data The data to display
   */
  private addCharacterInfoSection(data: any): void {
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
    this.element.appendChild(characterSection);
  }
  
  /**
   * Add stage info section to the sidebar
   * @param data The data to display
   */
  private addStageInfoSection(data: any): void {
    // Parse stage description to display formatted content instead of raw JSON
    const stageDescription = this.parseStageDescription(data.stageDescription || '{}');
    
    // Add stage info section with improved styling
    const stageSection = document.createElement('div');
    stageSection.className = 'sidebar-section stage-info-section';
    stageSection.innerHTML = `
      <h3>階段資訊</h3>
      <div class="stage-info-content">
        <div class="stage-indicator">
          <span class="stage-number">${data.currentStage || 1}</span>
          <div class="stage-progress">
            <div class="stage-progress-bar" style="width: ${Math.min((data.currentStage || 1) * 20, 100)}%"></div>
          </div>
        </div>
        <div class="stage-description">${stageDescription}</div>
      </div>
    `;
    this.element.appendChild(stageSection);
  }
  
  /**
   * Update the stage info section
   * @param data The data to display
   */
  private updateStageInfoSection(data: any): void {
    const stageSection = this.element.querySelector('.stage-info-section');
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
  
  /**
   * Update or add the inner activity section
   * @param activityData The inner activity data
   */
  private updateInnerActivitySection(activityData: string): void {
    let innerActivitySection = this.element.querySelector('.inner-activity-section') as HTMLElement;
    if (!innerActivitySection) {
      innerActivitySection = document.createElement('div');
      innerActivitySection.className = 'sidebar-section inner-activity-section';
      this.element.appendChild(innerActivitySection);
    }
    
    innerActivitySection.innerHTML = `
      <h3>AI 內部活動</h3>
      <div class="inner-activity-content">
        <pre>${activityData || '無資料'}</pre>
      </div>
    `;
  }
  
  /**
   * Parse stage description JSON to formatted HTML with clear sections
   * @param jsonStr The JSON string or object to parse
   * @returns Formatted HTML string
   */
  private parseStageDescription(jsonStr: string): string {
    console.log('Stage description input:', jsonStr);
    try {
      // Pre-process the input if it looks like a Python dictionary
      if (typeof jsonStr === 'string' && jsonStr.startsWith("{") && jsonStr.includes("'") && !jsonStr.includes('"')) {
        console.log('Detected Python-style dictionary format');
      }
      
      // Use our enhanced JSON parser to safely parse the input
      const stageInfo = safeJsonParse(jsonStr);
      
      // Handle empty data
      if (stageInfo.empty) {
        return '<div class="stage-section"><div class="stage-section-title">階段資訊</div><div class="stage-section-content">目前無階段資訊。</div></div>';
      }
      
      // Format the stage info into HTML
      let html = '';
      
      // Add stage title if available
      if (stageInfo.階段) {
        html += `<div class="stage-title"><strong>階段：</strong> ${stageInfo.階段}</div>`;
      }
      
      // Extract stage description
      if (stageInfo.階段描述) {
        html += `<div class="stage-section">
          <div class="stage-section-title">階段描述</div>
          <div class="stage-section-content">${stageInfo.階段描述}</div>
        </div>`;
      } else if (stageInfo.描述) {
        // Backward compatibility
        html += `<div class="stage-section">
          <div class="stage-section-title">階段描述</div>
          <div class="stage-section-content">${stageInfo.描述}</div>
        </div>`;
      }
      
      // Extract current customer status description
      if (stageInfo.當前客戶狀態描述) {
        html += `<div class="stage-section">
          <div class="stage-section-title">當前客戶狀態描述</div>
          <div class="stage-section-content">${stageInfo.當前客戶狀態描述}</div>
        </div>`;
      }
      
      // Extract conditions for next stage
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
      
      // If no main fields extracted, try using other possible fields
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
      
      // Check for passing conditions as an alternative to next stage conditions
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
      
      // Wrap all content in a container
      if (html) {
        html = `<div class="stage-info-details">${html}</div>`;
      }
      
      // If nothing was extracted, return the stringified JSON
      return html || `<pre class="stage-raw-json">${JSON.stringify(stageInfo, null, 2)}</pre>`;
    } catch (e) {
      // When parsing fails, return a formatted error message
      console.error('Error parsing stage description:', e);
      return `<div class="stage-parse-error">
        <p><strong>錯誤：</strong>無法解析階段描述。</p>
        <div class="stage-raw-data">${jsonStr}</div>
      </div>`;
    }
  }
}
