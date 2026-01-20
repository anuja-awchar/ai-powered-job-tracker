import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../utils/api';
import '../styles/chatSidebar.css';

export default function ChatSidebar({ userId }) {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversation();
  }, [userId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadConversation = async () => {
    try {
      const response = await chatAPI.getHistory(userId);
      setMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const userMessage = { role: 'user', content: inputValue };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await chatAPI.sendMessage(userId, inputValue);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: response.data.message }
      ]);
    } catch (error) {
      console.error('Error sending message:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chat-sidebar">
      <div className="chat-header">
        <h3>🤖 AI Assistant</h3>
      </div>

      <div className="chat-messages">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <p>👋 Hi! I can help you find jobs.</p>
            <p>Try asking:</p>
            <ul>
              <li>"Show me remote React jobs"</li>
              <li>"Which jobs have highest match scores?"</li>
              <li>"How does matching work?"</li>
            </ul>
          </div>
        )}
        {messages.map((msg, idx) => (
          <div key={idx} className={`message ${msg.role}`}>
            <p>{msg.content}</p>
          </div>
        ))}
        {isLoading && <div className="message assistant loading"><span>.</span><span>.</span><span>.</span></div>}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="chat-input-form">
        <input
          type="text"
          placeholder="Ask me anything..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>Send</button>
      </form>
    </div>
  );
}
