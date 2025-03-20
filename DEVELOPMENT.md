# AI教練應用開發指南

## 設計理念

AI教練應用旨在提供一個接近真實情境的客戶溝通訓練平台。系統設計遵循以下原則：

1. **雙重模式**：練習模式提供全面輔助；考試模式模擬真實情境
2. **漸進式學習**：階段式設計，循序漸進提升難度
3. **即時反饋**：提供實時內部思考過程和評估
4. **開放架構**：前後端分離，便於擴展和整合

## 技術實現細節

### 前端架構

採用基於TypeScript的組件化架構：

```
App (主控制器)
 ├── ApiService (後端通信)
 ├── ChatContent (消息顯示)
 ├── InputArea (用戶輸入)
 └── Header (導航和控制)
```

關鍵技術決策：
- 使用原生DOM操作而非框架，減少依賴
- TypeScript確保類型安全
- CSS變量實現一致的視覺主題
- 事件委派模式處理動態生成的元素

### 後端連接

API端點：
- `/start`: 初始化會話，創建角色和環境
- `/chat`: 處理用戶消息，生成AI回應
- `/end`: 結束會話，可獲取最終評估

通信格式示例：

```json
// 請求
{
  "session_id": "uuid-string",
  "user_input": "用戶消息內容"
}

// 回應
{
  "response_text": "AI回應文本",
  "inner_activity": "AI內部思考過程",
  "current_stage": 1,
  "stage_description": "{...}",
  "character_detail": "角色詳細資訊...",
  "is_pass": false,
  "finished": false
}
```

### JSON格式處理

JSON解析採用多層防護策略：
1. 先嘗試標準JSON.parse
2. 失敗後進行格式修正：
   - 替換單引號為雙引號
   - 處理缺少引號的鍵
   - 處理多餘逗號
3. 仍失敗時使用正則表達式直接提取鍵值對

## 當前開發任務清單

### 待解決問題

1. **修復Sidebar彈跳問題**
   - [x] 修改sidebar CSS中的transition屬性，確保動畫平滑
   - [x] 修正sidebar-collapse-btn的位置計算邏輯，使用絕對定位
   - [x] 調整sidebar的transform屬性，使其動畫更平滑

2. **修復角色詳細資訊顯示問題**
   - [x] 在showCharacterInfoModal函數中改進character_detail字段的存取邏輯
   - [x] 修改代碼以同時檢查characterDetail和character_detail兩種格式
   - [x] 增加日誌輸出以便於調試

3. **修復階段狀況顯示問題**
   - [x] 改進parseStageDescription函數，確保提取關鍵字段
   - [x] 優化階段資訊顯示，添加階段、階段描述、當前客戶狀態、進入下一階段條件
   - [x] 規範化階段資訊HTML格式，確保一致的顯示風格

## 測試指南

### 功能測試

1. **聊天基本功能**
   - 發送消息並接收回應
   - 查看歷史消息
   - 創建新對話

2. **練習模式**
   - 顯示側邊欄並檢查所有資訊
   - 點擊頭像查看角色詳情
   - 觀察階段進度變化

3. **考試模式**
   - 確認輔助資訊被適當隱藏
   - 驗證可檢視的有限資訊
   - 測試通過階段後的行為

### 錯誤場景測試

1. **網絡問題**
   - 網絡延遲或中斷時的錯誤處理
   - 重試機制測試

2. **數據格式異常**
   - 非標準JSON格式的處理
   - 缺失必要字段時的表現

3. **用戶操作錯誤**
   - 發送空消息的處理
   - 連續快速操作的防抖動

## 擴展開發建議

### 前端擴展

添加新組件：
1. 在`components`目錄創建新文件
2. 定義組件接口和回調
3. 實現組件類和DOM操作
4. 在`app.ts`中整合

添加新視圖模式：
1. 在`styles/modes.css`添加新模式樣式
2. 在`app.ts`中添加模式切換邏輯
3. 更新`updateSidebarContent`處理新模式下的顯示

### CSS調整建議

修改sidebar樣式時注意以下幾點：
1. `modes.css`中的`.practice-sidebar`類控制主要側邊欄樣式
2. 使用`transform: translateX()`進行平滑過渡
3. 設置`transition: transform 0.3s ease`確保動畫平滑
4. 確保`.sidebar-collapse-btn`使用正確的絕對定位

### JSON解析指南

處理後端返回的JSON資料時：
1. 先檢查是否已是物件類型
2. 嘗試基本JSON.parse
3. 如失敗，進行格式修正
4. 在`parseStageDescription`函數中提取指定字段
5. 生成格式化的HTML輸出，包含必要的標題和內容結構

## 故障排除

### Sidebar彈跳問題解決方案
1. 使sidebar的transform屬性僅變化X軸位置，不影響其他屬性
2. 確保collapse-btn有固定的絕對定位
3. 使用`transform: translateX()`而非修改width或margin
4. 設置適當的transition時間為0.3秒，使動畫平滑

### 角色詳細資訊問題解決方案
1. 檢查多種可能的欄位名稱：characterDetail和character_detail
2. 同時從sessionData和lastChatResponse中獲取資訊
3. 添加日誌輸出以追蹤資料來源
4. 確保不管資料來源如何，都能顯示完整的角色資訊

### 階段描述解析問題解決方案
1. 在parseStageDescription中明確提取四個關鍵字段：階段、階段描述、當前客戶狀態描述、進入下一階段條件
2. 針對每個字段添加適當的HTML結構和樣式
3. 確保同時處理字串、陣列、物件等不同類型的資料
4. 提供清晰的視覺區分，使用戶容易理解各部分資訊