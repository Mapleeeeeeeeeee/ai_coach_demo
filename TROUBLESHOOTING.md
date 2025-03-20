# AI教練應用疑難排解指南

本文檔提供常見問題的診斷和解決方案，幫助開發者快速定位和修復問題。

## 常見問題

### 1. JSON解析錯誤

**症狀**：控制台顯示 "SyntaxError: Expected ',' or '}' after property value in JSON at position..."

**原因**：
- 後端返回的JSON格式不標準
- 字符串中包含單引號而非雙引號
- 鍵沒有使用引號包圍
- JSON尾部有多餘的逗號

**診斷步驟**：
1. 檢查控制台輸出的原始JSON字符串
2. 檢查`parseStageDescription`函數的錯誤日誌
3. 確認是否來自`app.ts:556`附近的錯誤

**解決方案**：
- `parseStageDescription`函數已增強錯誤處理，大多數情況下能自動修正
- 如仍有問題，考慮手動檢查後端返回的JSON格式
- 在`app.ts`中進一步增強JSON解析的容錯處理

```javascript
// 錯誤JSON示例
const badJson = "{'key': 'value', 'another_key': 123,}";

// 修復方法
let fixedJson = badJson
  .replace(/'/g, '"')  // 單引號替換為雙引號
  .replace(/([{,])\s*(\w+)\s*:/g, '$1"$2":')  // 給鍵添加引號
  .replace(/,\s*([}\]])/g, '$1');  // 移除尾部多餘逗號
```

### 2. 側邊欄遮擋聊天內容

**症狀**：開啟側邊欄後，聊天內容被部分遮擋

**原因**：
- CSS布局問題
- 側邊欄打開時未適當調整聊天區域寬度

**診斷步驟**：
1. 檢查是否應用了`.practice-mode`和`.chat-content`相關CSS樣式
2. 確認聊天內容的`margin-right`設置是否正確
3. 檢查側邊欄的`position`和`z-index`值

**解決方案**：
- 確保`main.css`中包含正確的邊距設置：
```css
body.practice-mode .chat-content {
  margin-right: 320px;
  transition: margin-right 0.3s ease;
}
```
- 如問題仍存在，可在`setupPracticeMode`中手動設置布局：
```javascript
document.querySelector('.chat-content').style.marginRight = '320px';
```

### 3. 角色詳細信息不顯示

**症狀**：點擊角色頭像後，模態框中的"角色詳細信息"或"角色數據"為空

**原因**：
- API返回的資料結構與預期不符
- 查找字段名稱不匹配
- 資料尚未加載完成就嘗試訪問

**診斷步驟**：
1. 在控制台查看`apiService.sessionData`和`apiService.lastChatResponse`的結構
2. 確認角色資訊是否在這些物件中，以及確切的字段名稱
3. 檢查`showCharacterInfoModal`函數的日誌輸出

**解決方案**：
- 擴展`showCharacterInfoModal`中的資料來源檢查：
```javascript
// 檢查更多可能的資料來源
const characterDetail = 
  apiService.sessionData?.characterDetail || 
  apiService.sessionData?.character_detail ||
  apiService.lastChatResponse?.characterDetail || 
  apiService.lastChatResponse?.character_detail ||
  '無詳細資訊';
```
- 從`stageDescription`中提取角色資訊作為備選

### 4. 傳送訊息後側邊欄資訊消失

**症狀**：發送新消息後，側邊欄的資訊被重置或部分消失

**原因**：
- 新回應中缺少某些資訊字段
- 更新邏輯完全替換，而非合併現有資料

**診斷步驟**：
1. 比較發送消息前後的`apiService.lastChatResponse`內容
2. 檢查`updateSidebarWithChatData`函數如何處理新舊資料

**解決方案**：
- 使用資料合併策略而非替換：
```javascript
// 合併新數據到現有sessionData
if (!this.apiService.sessionData) {
  this.apiService.sessionData = {};
}
Object.assign(this.apiService.sessionData, data);

// 只更新有新數據的部分
if (data.stageDescription) {
  // 更新階段資訊
} else {
  // 保留現有階段資訊
}
```

### 5. 模式切換後UI不更新

**症狀**：從練習模式切換到考試模式（或相反）後，UI未完全更新

**原因**：
- CSS類未正確應用或移除
- DOM元素沒有適當更新

**診斷步驟**：
1. 檢查`body`元素的類名是否正確切換
2. 確認側邊欄是否正確添加或移除
3. 檢查`setupPracticeMode`和`setupExamMode`函數

**解決方案**：
- 確保模式切換時徹底清理舊模式的UI元素：
```javascript
private setupExamMode(sessionData: any): void {
  // 移除所有練習模式相關的類和元素
  document.body.classList.remove('practice-mode');
  document.body.classList.remove('sidebar-open');
  document.body.classList.remove('sidebar-collapsed');
  
  // 添加考試模式類
  document.body.classList.add('exam-mode');
  
  // 刪除側邊欄
  const sidebar = document.querySelector('.practice-sidebar');
  if (sidebar) {
    sidebar.remove();
  }
}
```

## 偵錯技巧

### 使用控制台追蹤資料流

在關鍵位置添加日誌輸出可以幫助了解資料流向：

```javascript
// 在API調用後輸出
console.log('API Response:', data);

// 解析JSON前後輸出
console.log('Before parsing:', jsonStr);
console.log('After parsing:', stageInfo);

// 更新UI前輸出
console.log('UI update data:', {
  stage: currentStage,
  description: stageDescription,
  innerActivity: innerActivity
});
```

### 追蹤DOM更新

設置DOM更新的斷點可以幫助確認UI問題：

1. 打開瀏覽器開發者工具
2. 右鍵點擊要監控的元素
3. 選擇"Break on" -> "Subtree modifications"
4. 執行可能導致問題的操作
5. 當斷點觸發時，檢查調用堆棧確定源頭

### 模擬API響應

如懷疑API響應問題，可以創建模擬數據進行測試：

```javascript
// 在apiService.ts中添加模擬功能
async sendChatMock(mockData: any): Promise<any> {
  // 使用固定的模擬數據進行測試
  this.lastChatResponse = mockData;
  return {
    responseText: mockData.response_text,
    innerActivity: mockData.inner_activity,
    currentStage: mockData.current_stage,
    stageDescription: mockData.stage_description,
    isPass: mockData.is_pass,
    finished: mockData.finished,
  };
}
```

## 性能優化建議

如遇性能問題，考慮以下優化：

1. **減少DOM操作**：批量更新DOM，避免頻繁重繪
2. **延遲加載**：非關鍵資源延遲加載
3. **事件節流/防抖**：限制高頻事件的處理頻率
4. **記憶化計算**：緩存複雜計算結果
5. **壓縮JSON**：減少大型JSON對象解析的開銷

## 聯繫與支援

如遇無法解決的問題，請提供以下資訊尋求支援：

1. 瀏覽器控制台完整錯誤信息
2. 問題重現步驟
3. API請求和響應的樣本
4. 相關配置信息
