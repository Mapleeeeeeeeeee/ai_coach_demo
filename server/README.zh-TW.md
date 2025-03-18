# AI Coach 後端整合指南

這份文件提供繁體中文版的後端整合指南，幫助開發人員了解如何與本系統的後端 API 進行整合。

## 目錄結構

```
server/
├── src/                 # TypeScript 原始碼
│   ├── server.ts        # Express 伺服器與 OpenAI 連接
│   └── types.ts         # TypeScript 類型定義
├── dist/                # 編譯後的 JavaScript (自動產生)
├── uploads/             # 上傳檔案的儲存目錄
├── package.json         # 後端套件依賴
├── tsconfig.json        # TypeScript 設定
└── .env.example         # 環境變數範本
```

## 環境設定

1. 安裝 Node.js 和 npm（如果尚未安裝）。

2. 安裝相依套件：
   ```bash
   npm install
   ```

3. 建立 `.env` 檔案，並設定 OpenAI API 金鑰：
   ```
   OPENAI_API_KEY=你的_openai_api_金鑰
   PORT=3000
   ```

4. 編譯 TypeScript 程式碼：
   ```bash
   npm run build
   ```

5. 啟動伺服器：
   ```bash
   npm start
   ```
   
   或使用開發模式（自動重新載入）：
   ```bash
   npm run dev
   ```

## API 端點說明

### 建立新的對話

- **POST /api/chat/new**
- **功能**：建立新的對話 session
- **請求格式**：無需請求內容
- **回應格式**：
  ```json
  {
    "sessionId": "唯一的會話識別碼"
  }
  ```

### 發送提示並取得 AI 回應

- **POST /api/chat**
- **功能**：發送用戶提示訊息並取得 AI 回應
- **請求格式**：
  ```json
  {
    "prompt": "用戶的提示訊息",
    "context": "A或B或C",
    "sessionId": "可選的會話識別碼"
  }
  ```
- **回應格式**：
  ```json
  {
    "response": "AI的回應內容",
    "sessionId": "會話識別碼"
  }
  ```

### 上傳檔案

- **POST /api/upload**
- **功能**：上傳檔案到伺服器
- **請求格式**：使用 `multipart/form-data` 格式，檔案欄位名稱為 `file`
- **回應格式**：
  ```json
  {
    "success": true,
    "fileId": "檔案識別碼",
    "originalName": "原始檔名",
    "mimetype": "檔案MIME類型",
    "size": 檔案大小（位元組）,
    "path": "伺服器內部路徑",
    "url": "可存取的URL路徑"
  }
  ```

### 取得伺服器狀態

- **GET /api/status**
- **功能**：檢查伺服器運行狀態
- **回應格式**：
  ```json
  {
    "status": "ok",
    "timestamp": "時間戳記",
    "activeSessions": 活躍的會話數量
  }
  ```

## 情境說明

系統支援三種不同的對話情境（context），會影響 AI 的回應風格：

- **情境 A**：客服助手 - 專業、有禮、簡潔的回應風格
- **情境 B**：寫作助手 - 活潑、有創意的回應風格
- **情境 C**：教學助手 - 清晰、有條理的回應風格，適合教育場景

## 整合範例

以下是使用 TypeScript 與後端 API 整合的範例程式碼：

```typescript
// 發送提示並取得回應
async function sendPrompt(prompt: string, context: string = 'A'): Promise<string> {
  try {
    const response = await fetch('http://localhost:3000/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        context,
      }),
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    console.error('發送提示失敗:', error);
    throw error;
  }
}

// 上傳檔案
async function uploadFile(file: File): Promise<any> {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('上傳檔案失敗:', error);
    throw error;
  }
}
```

## 故障排除

1. **CORS 錯誤**：檢查前端的請求來源是否在後端的允許清單中。

2. **OpenAI API 錯誤**：確認您的 API 金鑰是有效的，並且正確設置在 `.env` 檔案中。

3. **檔案上傳錯誤**：確保 `uploads` 目錄存在且可寫入。

4. **端口衝突**：如果端口 3000 已經被使用，您可以在 `.env` 檔案中更改 `PORT` 設定。

## 注意事項

- 此 API 設計主要用於示範，在生產環境中應該增加適當的認證和授權機制。
- 目前使用的是記憶體內的會話儲存，在生產環境中應改用資料庫儲存會話資訊。
- 在處理上傳的檔案時，應考慮增加檔案類型和大小的限制，以提高安全性。
