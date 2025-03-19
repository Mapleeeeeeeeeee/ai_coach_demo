// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/apiService';

// 初始化API服务，指向后端服务地址
const apiService = new ApiService('http://localhost:8000');

interface ChatComponentProps {
  llmChoice?: string; // 可选的LLM选择
  onConversationComplete?: (conversation: string) => void; // 对话完成回调
}

const ChatComponent: React.FC<ChatComponentProps> = ({ 
  llmChoice = 'openai',
  onConversationComplete
}) => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [character, setCharacter] = useState<any>(null);
  const [currentStage, setCurrentStage] = useState<number>(0);
  const [stageDescription, setStageDescription] = useState<string>('');
  const [messages, setMessages] = useState<Array<{sender: string, text: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  // 启动会话
  const startChat = async () => {
    try {
      setLoading(true);
      const sessionInfo = await apiService.startSession(llmChoice);
      
      setSessionId(sessionInfo.sessionId);
      setCharacter(sessionInfo.characterInfo);
      setCurrentStage(sessionInfo.currentStage);
      setStageDescription(sessionInfo.stageDescription);
      
      // 添加系统消息到对话
      setMessages([{ 
        sender: 'system', 
        text: `开始与${sessionInfo.characterInfo.姓名}的对话。
当前阶段：${sessionInfo.currentStage} - ${sessionInfo.stageDescription}` 
      }]);
    } catch (error) {
      console.error('启动会话失败:', error);
      setMessages([{ sender: 'system', text: '启动会话失败，请重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || !sessionId || loading || isFinished) return;
    
    try {
      setLoading(true);
      
      // 添加用户消息到列表
      setMessages(prev => [...prev, { sender: 'user', text: input }]);
      const userMessage = input;
      setInput('');
      
      // 发送到API并获取回复
      const response = await apiService.sendChat(userMessage);
      
      // 添加AI回复到列表
      setMessages(prev => [...prev, { sender: 'character', text: response.responseText }]);
      
      // 更新当前阶段信息
      setCurrentStage(response.currentStage);
      setStageDescription(response.stageDescription);
      
      // 如果通过了一个阶段，添加一个系统消息
      if (response.isPass) {
        setMessages(prev => [...prev, { 
          sender: 'system', 
          text: `阶段${currentStage}通过！进入阶段${response.currentStage}: ${response.stageDescription}` 
        }]);
      }
      
      // 如果完成了对话
      if (response.finished) {
        setIsFinished(true);
        setMessages(prev => [...prev, { 
          sender: 'system', 
          text: '对话已完成，所有阶段通过！' 
        }]);
        
        // 调用完成回调
        if (onConversationComplete) {
          onConversationComplete(response.conversation);
        }
        
        // 结束会话
        await apiService.endSession();
        setSessionId(null);
      }
    } catch (error) {
      console.error('发送消息失败:', error);
      setMessages(prev => [...prev, { sender: 'system', text: '发生错误，请重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  // 重置对话
  const resetChat = async () => {
    if (sessionId) {
      try {
        await apiService.endSession();
      } catch (error) {
        console.error('结束会话失败:', error);
      }
    }
    
    setSessionId(null);
    setCharacter(null);
    setCurrentStage(0);
    setStageDescription('');
    setMessages([]);
    setInput('');
    setIsFinished(false);
  };

  // 键盘事件处理 - 按Enter发送消息
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  useEffect(() => {
    // 组件卸载时结束会话
    return () => {
      if (sessionId) {
        apiService.endSession().catch(console.error);
      }
    };
  }, [sessionId]);

  return (
    <div className="chat-container">
      {!sessionId ? (
        <div className="start-section">
          <h2>AI客服训练系统</h2>
          <p>这个系统将模拟客户与客服之间的对话，按照阶段进行评估。</p>
          <button onClick={startChat} disabled={loading}>
            {loading ? '正在启动...' : '开始对话'}
          </button>
        </div>
      ) : (
        <>
          <div className="chat-header">
            <div className="character-info">
              {character && (
                <>
                  <h3>{character.姓名}</h3>
                  <div className="stage-info">
                    阶段 {currentStage}: {stageDescription}
                  </div>
                </>
              )}
            </div>
            <button className="reset-button" onClick={resetChat} disabled={loading}>
              重置对话
            </button>
          </div>
          
          <div className="message-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
            {loading && (
              <div className="message loading">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
          </div>
          
          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={loading || isFinished}
              placeholder={isFinished ? "对话已结束" : "输入你的消息..."}
            />
            <button 
              onClick={sendMessage} 
              disabled={loading || !input.trim() || isFinished}
            >
              发送
            </button>
          </div>
        </>
      )}
      
      {/* 添加一些基本的样式以便能够直接使用 */}
      <style jsx>{`
        .chat-container {
          display: flex;
          flex-direction: column;
          height: 600px;
          width: 100%;
          max-width: 800px;
          border: 1px solid #ccc;
          border-radius: 8px;
          overflow: hidden;
          margin: 0 auto;
        }
        
        .start-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 20px;
          text-align: center;
        }
        
        .chat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background-color: #f0f0f0;
          border-bottom: 1px solid #ccc;
        }
        
        .message-list {
          flex-grow: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }
        
        .message {
          max-width: 75%;
          padding: 10px 15px;
          border-radius: 15px;
          margin-bottom: 10px;
          word-break: break-word;
        }
        
        .message.user {
          align-self: flex-end;
          background-color: #0084ff;
          color: white;
          border-bottom-right-radius: 5px;
        }
        
        .message.character {
          align-self: flex-start;
          background-color: #f1f0f0;
          border-bottom-left-radius: 5px;
        }
        
        .message.system {
          align-self: center;
          background-color: #fff8dc;
          border: 1px dashed #ddd;
          font-style: italic;
          max-width: 90%;
        }
        
        .message.loading {
          align-self: flex-start;
          background: none;
          padding: 0;
        }
        
        .typing-indicator {
          display: flex;
          align-items: center;
        }
        
        .typing-indicator span {
          height: 10px;
          width: 10px;
          border-radius: 50%;
          background-color: #ccc;
          margin: 0 2px;
          animation: bounce 1s infinite ease-in-out;
        }
        
        .typing-indicator span:nth-child(2) {
          animation-delay: 0.2s;
        }
        
        .typing-indicator span:nth-child(3) {
          animation-delay: 0.4s;
        }
        
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        
        .input-area {
          display: flex;
          padding: 10px;
          border-top: 1px solid #ccc;
        }
        
        .input-area input {
          flex-grow: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          margin-right: 10px;
        }
        
        .input-area button {
          padding: 10px 20px;
          background-color: #0084ff;
          color: white;
          border: none;
          border-radius: 20px;
          cursor: pointer;
        }
        
        .input-area button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .reset-button {
          padding: 5px 10px;
          background-color: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default ChatComponent;
