import { ApiService } from '../services/apiService';

// 初始化API服务，指向后端服务地址
const apiService = new ApiService('http://localhost:8000');

// 使用示例函数
export async function characterChatExample() {
  try {
    // 1. 开始会话，选择语言模型
    console.log('正在启动会话...');
    const sessionInfo = await apiService.startSession('openai');
    
    console.log('会话已创建:');
    console.log(`- 会话ID: ${sessionInfo.sessionId}`);
    console.log(`- 当前阶段: ${sessionInfo.currentStage}`);
    console.log(`- 阶段描述: ${sessionInfo.stageDescription}`);
    console.log('- 角色訊息:', sessionInfo.characterInfo);
    
    // 2. 发送聊天消息
    console.log('\n发送第一条消息...');
    const firstResponse = await apiService.sendChat('你好，请问你是谁？');
    
    console.log('收到回复:');
    console.log(`- 回复文本: ${firstResponse.responseText}`);
    console.log(`- 内部活动: ${firstResponse.innerActivity}`);
    console.log(`- 当前阶段: ${firstResponse.currentStage}`);
    console.log(`- 阶段通过: ${firstResponse.isPass ? '是' : '否'}`);
    
    // 3. 发送另一条消息
    console.log('\n发送第二条消息...');
    const secondResponse = await apiService.sendChat('我想了解更多关于你的情况');
    
    console.log('收到回复:');
    console.log(`- 回复文本: ${secondResponse.responseText}`);
    console.log(`- 当前阶段: ${secondResponse.currentStage}`);
    console.log(`- 对话完成: ${secondResponse.finished ? '是' : '否'}`);
    
    // 4. 结束会话
    console.log('\n结束会话...');
    const endResult = await apiService.endSession();
    console.log(`会话结束: ${endResult.detail}`);
    
  } catch (error) {
    console.error('示例执行失败:', error);
  }
}

// 在React组件中使用的示例
/*
import React, { useEffect, useState } from 'react';
import { ApiService } from '../services/apiService';

const apiService = new ApiService('http://localhost:8000');

export const ChatComponent: React.FC = () => {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [character, setCharacter] = useState<any>(null);
  const [messages, setMessages] = useState<Array<{sender: string, text: string}>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // 启动会话
  const startChat = async () => {
    try {
      setLoading(true);
      const sessionInfo = await apiService.startSession('openai');
      setSessionId(sessionInfo.sessionId);
      setCharacter(sessionInfo.characterInfo);
      setMessages([{ 
        sender: 'system', 
        text: `开始与${sessionInfo.characterInfo.姓名}的对话。当前阶段：${sessionInfo.stageDescription}` 
      }]);
    } catch (error) {
      console.error('启动会话失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 发送消息
  const sendMessage = async () => {
    if (!input.trim() || !sessionId) return;
    
    try {
      setLoading(true);
      
      // 添加用户消息到列表
      setMessages(prev => [...prev, { sender: 'user', text: input }]);
      setInput('');
      
      // 发送到API并获取回复
      const response = await apiService.sendChat(input);
      
      // 添加AI回复到列表
      setMessages(prev => [...prev, { sender: 'character', text: response.responseText }]);
      
      // 如果完成了对话
      if (response.finished) {
        setMessages(prev => [...prev, { sender: 'system', text: '对话已完成，所有阶段通过！' }]);
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
        <button onClick={startChat} disabled={loading}>
          {loading ? '正在启动...' : '开始对话'}
        </button>
      ) : (
        <>
          <div className="message-list">
            {messages.map((msg, idx) => (
              <div key={idx} className={`message ${msg.sender}`}>
                {msg.text}
              </div>
            ))}
          </div>
          
          <div className="input-area">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              placeholder="输入你的消息..."
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>
              发送
            </button>
          </div>
        </>
      )}
    </div>
  );
};
*/
