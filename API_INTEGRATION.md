# PASSION Agent 前後端 API 對接文檔

這份文檔針對後端工程師提供 PASSION Agent 前後端對接的詳細說明。本文檔著重於前端對API的期望和調用方式，以確保後端開發人員能夠準確實現符合前端需求的 API。

## 目錄

1. [API 概述](#api-概述)
2. [API 端點詳細規格](#api-端點詳細規格)
3. [資料結構定義](#資料結構定義)
4. [錯誤處理機制](#錯誤處理機制)
5. [實際前端調用程式碼](#實際前端調用程式碼)
6. [開發環境設定](#開發環境設定)
7. [測試案例](#測試案例)
8. [部署注意事項](#部署注意事項)

## API 概述

PASSION Agent 前端需要以下主要功能的 API 支援：

1. **對話管理**：建立對話、發送提示訊息、取得 AI 回應
2. **檔案上傳**：允許使用者上傳檔案以供 AI 分析
3. **系統狀態**：檢查 API 服務狀態

所有 API 都應以 RESTful 風格實現，使用 JSON 作為資料交換格式。所有時間使用 ISO-8601 格式（YYYY-MM-DDTHH:mm:ss.sssZ）。

## API 端點詳細規格

### 1. 建立新對話

- **端點**: `/api/chat/new`
- **方法**: POST
- **用途**: 建立新的對話 session
- **請求內容**: 無需請求內容
- **回應格式**:

```json
{
  "sessionId": "string",     // 唯一的對話識別碼
  "createdAt": "ISO-8601"    // 建立時間
}
```

- **狀態碼**:
  - 201 Created: 成功建立新對話
  - 500 Internal Server Error: 伺服器錯誤

### 2. 發送提示訊息和獲取回應

- **端點**: `/api/chat`
- **方法**: POST
- **用途**: 發送用戶提示訊息並取得 AI 回應
- **請求內容**:

```json
{
  "prompt": "string",       // 必填，用戶的提示訊息
  "context": "A|B|C",       // 選填，預設為 "A"，指定對話情境
  "sessionId": "string"     // 選填，如未提供則自動建立新對話
}
```

- **回應格式**:

```json
{
  "response": "string",     // AI 的回應內容
  "sessionId": "string",    // 對話識別碼
  "messageId": "string",    // 回應訊息的唯一識別碼
  "timestamp": "ISO-8601"   // 回應時間
}
```

- **狀態碼**:
  - 200 OK: 成功處理請求
  - 400 Bad Request: 請求格式錯誤，缺少必要參數
  - 404 Not Found: 指定的 sessionId 不存在
  - 500 Internal Server Error: 處理請求時出錯

### 3. 檔案上傳

- **端點**: `/api/upload`
- **方法**: POST
- **用途**: 上傳檔案以供 AI 分析
- **Content-Type**: `multipart/form-data`
- **請求參數**:
  - `file`: 要上傳的檔案
  - `sessionId` (可選): 關聯的對話識別碼

- **回應格式**:

```json
{
  "success": true,
  "fileId": "string",        // 檔案唯一識別碼
  "originalName": "string",  // 原始檔名
  "mimetype": "string",      // 檔案類型
  "size": "number",          // 檔案大小 (bytes)
  "url": "string",           // 存取檔案的 URL
  "timestamp": "ISO-8601",   // 上傳時間
  "sessionId": "string"      // 關聯的對話識別碼，如有提供
}
```

- **狀態碼**:
  - 201 Created: 檔案上傳成功
  - 400 Bad Request: 請求格式錯誤或檔案未提供
  - 413 Payload Too Large: 檔案太大
  - 415 Unsupported Media Type: 不支援的檔案類型
  - 500 Internal Server Error: 伺服器處理檔案時出錯

### 4. 獲取系統狀態

- **端點**: `/api/status`
- **方法**: GET
- **用途**: 檢查 API 系統狀態
- **回應格式**:

```json
{
  "status": "string",         // "ok" 或其他狀態訊息
  "version": "string",        // API 版本
  "timestamp": "ISO-8601",    // 伺服器當前時間
  "activeSessions": "number"  // 當前活躍的對話數量
}
```

- **狀態碼**:
  - 200 OK: 成功獲取狀態
  - 500 Internal Server Error: 伺服器錯誤

## 資料結構定義

### 對話情境 (Context)

對話情境控制 AI 回應的風格和專業領域：

- **A**: 客服助手 - 專業、禮貌、簡潔的回應
- **B**: 寫作助手 - 創意、活潑的回應
- **C**: 教學助手 - 清晰、條理的解說

### 對話訊息 (Message)

標準訊息格式：

```typescript
interface Message {
  id: string;           // 訊息唯一識別碼
  role: "user" | "assistant" | "system"; // 發送者角色
  content: string;      // 訊息內容
  timestamp: string;    // ISO-8601 格式時間
}
```

### 對話 Session

代表一個完整的對話：

```typescript
interface Session {
  id: string;           // 對話唯一識別碼
  messages: Message[];  // 訊息列表
  createdAt: string;    // 建立時間
  updatedAt: string;    // 最後更新時間
  context: "A" | "B" | "C"; // 對話情境
}
```

## 錯誤處理機制

所有錯誤回應應使用以下標準格式：

```json
{
  "error": {
    "code": "string",      // 錯誤代碼
    "message": "string",   // 人類可讀的錯誤訊息
    "details": "object"    // 可選的詳細錯誤資訊
  }
}
```

### 標準錯誤代碼

| 錯誤代碼 | 說明 | HTTP 狀態碼 |
|---------|------|------------|
| INVALID_REQUEST | 請求格式或參數無效 | 400 |
| SESSION_NOT_FOUND | 指定的對話識別碼不存在 | 404 |
| PROMPT_REQUIRED | 缺少必要的提示訊息 | 400 |
| FILE_TOO_LARGE | 上傳的檔案太大 | 413 |
| UNSUPPORTED_FILE_TYPE | 不支援的檔案類型 | 415 |
| SERVER_ERROR | 伺服器內部錯誤 | 500 |
| LLM_ERROR | 與 AI 模型通訊時出錯 | 502 |

## 實際前端調用程式碼

以下是前端如何調用 API 的實際程式碼示例：

### 發送提示訊息並獲取回應

```typescript
// src/services/apiService.ts
export class ApiService {
  private baseUrl: string;
  
  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }
  
  // 發送提示訊息並獲取回應
  async sendPrompt(prompt: string, context: string = 'A', sessionId?: string): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          context,
          sessionId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Failed to send prompt:', error);
      throw error;
    }
  }
  
  // 上傳檔案
  async uploadFile(file: File, sessionId?: string): Promise<any> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      if (sessionId) {
        formData.append('sessionId', sessionId);
      }

      const response = await fetch(`${this.baseUrl}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to upload file:', error);
      throw error;
    }
  }
  
  // 建立新對話
  async createNewChat(): Promise<string> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      return data.sessionId;
    } catch (error) {
      console.error('Failed to create new chat:', error);
      throw error;
    }
  }
}
```

### 使用範例

```typescript
// 使用 apiService 的範例
const apiService = new ApiService('http://localhost:3000/api');

// 發送訊息並獲取回應
async function sendMessage() {
  try {
    const response = await apiService.sendPrompt('你好，請介紹一下自己', 'A');
    console.log('AI 回應:', response);
  } catch (error) {
    console.error('錯誤:', error);
  }
}

// 上傳檔案
async function uploadUserFile(fileInput: HTMLInputElement) {
  if (fileInput.files && fileInput.files.length > 0) {
    try {
      const result = await apiService.uploadFile(fileInput.files[0]);
      console.log('檔案上傳成功:', result);
    } catch (error) {
      console.error('檔案上傳失敗:', error);
    }
  }
}
```

## 開發環境設定

前端預期後端在開發環境中的設定如下：

- 本地後端 API 地址: `http://localhost:3000/api`
- 支援 CORS，允許從本地前端（`http://localhost:9000`）的請求
- 支援 HTTPS 用於生產環境，但本地開發環境允許 HTTP
- 上傳檔案大小限制: 10MB
- 檔案存儲: 本地檔案系統（開發環境）或雲端存儲（生產環境）

## 測試案例

前端預期以下測試案例能通過：

1. **基本對話**:
   - 發送「你好」提示，應收到正常回應
   - 連續發送 3-5 條訊息，應保持對話連貫性

2. **情境切換**:
   - 在情境 A 開始對話，然後切換到情境 B，回應風格應有明顯變化
   - 切換回情境 A，應與初始風格一致

3. **檔案上傳**:
   - 上傳 PDF 檔案（1MB），應成功且返回有效 URL
   - 上傳圖片檔案（2MB JPG），應成功且返回有效 URL
   - 嘗試上傳超大檔案（>10MB），應返回適當錯誤

4. **錯誤處理**:
   - 使用不存在的 sessionId，應返回 SESSION_NOT_FOUND 錯誤
   - 發送空提示，應返回 PROMPT_REQUIRED 錯誤
   - 上傳不支援的檔案類型，應返回 UNSUPPORTED_FILE_TYPE 錯誤

## 部署注意事項

1. **CORS 配置**:
   - 生產環境應僅允許特定網域的請求
   - 只允許必要的 HTTP 方法（GET, POST）
   - 允許 Content-Type 和 Authorization 等必要標頭

2. **安全考量**:
   - 建議實作 API 限流以防止濫用
   - 考慮增加認證機制，支援 JWT 或 API Key
   - 所有生產環境端點必須使用 HTTPS

3. **效能期望**:
   - API 回應時間應在 500ms 以內（不含 AI 處理時間）
   - AI 模型處理時間視情況而定，但前端已實作載入指示器
   - 本地開發環境假設每個端點回應時間不超過 2 秒
