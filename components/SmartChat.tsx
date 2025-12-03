import React, { useState, useRef, useEffect } from 'react';
import { createChatSession } from '../services/geminiService';
import { GenerateContentResponse } from "@google/genai";
import { Send, Bot, User, BrainCircuit, Sparkles, StopCircle, Trash2 } from 'lucide-react';
import { ChatMessage } from '../types';

const SmartChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [thinkingMode, setThinkingMode] = useState(false);
  
  // We keep the chat instance in a ref so it persists across renders
  const chatRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const initializeChat = (thinking: boolean) => {
    chatRef.current = createChatSession(thinking);
    setMessages([{
      role: 'model',
      text: thinking 
        ? "I'm in Thinking Mode. I will take more time to analyze complex requests thoroughly. How can I help?"
        : "Hello! I'm your AI assistant. Ask me anything about content strategy or social media.",
      timestamp: new Date()
    }]);
  };

  useEffect(() => {
    initializeChat(thinkingMode);
  }, [thinkingMode]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      if (!chatRef.current) initializeChat(thinkingMode);

      let fullText = "";
      // Optimistically add empty model message for streaming
      setMessages(prev => [...prev, { role: 'model', text: "", timestamp: new Date() }]);

      const result = await chatRef.current.sendMessageStream({ message: userMsg.text });
      
      for await (const chunk of result) {
        const c = chunk as GenerateContentResponse;
        const text = c.text;
        if (text) {
          fullText += text;
          setMessages(prev => {
            const newHistory = [...prev];
            const lastMsg = newHistory[newHistory.length - 1];
            if (lastMsg.role === 'model') {
              lastMsg.text = fullText;
            }
            return newHistory;
          });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: "I encountered an error processing that request. Please try again.", 
        timestamp: new Date() 
      }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900">
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg ${thinkingMode ? 'bg-purple-500/20 text-purple-400' : 'bg-indigo-500/20 text-indigo-400'}`}>
            {thinkingMode ? <BrainCircuit size={20} /> : <Bot size={20} />}
          </div>
          <div>
            <h3 className="font-bold text-white">{thinkingMode ? 'Deep Thinking Agent' : 'Smart Chat Assistant'}</h3>
            <p className="text-xs text-slate-400">{thinkingMode ? 'Gemini 3.0 Pro' : 'Gemini 3.0 Pro (Standard)'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            <button 
                onClick={() => setThinkingMode(!thinkingMode)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all border ${
                    thinkingMode 
                    ? 'bg-purple-600 border-purple-500 text-white shadow-lg shadow-purple-500/20' 
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                }`}
            >
                <BrainCircuit size={16} />
                <span>Thinking Mode</span>
                <div className={`w-2 h-2 rounded-full ${thinkingMode ? 'bg-white animate-pulse' : 'bg-slate-500'}`} />
            </button>
            
            <button 
                onClick={() => initializeChat(thinkingMode)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors"
                title="Clear Chat"
            >
                <Trash2 size={18} />
            </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === 'user' ? 'bg-slate-700' : (thinkingMode ? 'bg-purple-900/50 text-purple-400' : 'bg-indigo-900/50 text-indigo-400')
            }`}>
              {msg.role === 'user' ? <User size={16} /> : (thinkingMode ? <BrainCircuit size={16} /> : <Bot size={16} />)}
            </div>
            
            <div className={`max-w-[80%] rounded-2xl p-4 ${
              msg.role === 'user' 
                ? 'bg-slate-800 text-white rounded-tr-sm' 
                : 'bg-slate-800/50 border border-slate-700/50 text-slate-200 rounded-tl-sm'
            }`}>
              <div className="whitespace-pre-wrap leading-relaxed">{msg.text}</div>
              {msg.text === "" && loading && idx === messages.length - 1 && (
                  <span className="inline-flex gap-1 items-center mt-1">
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '0ms'}}/>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}/>
                      <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}/>
                  </span>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={thinkingMode ? "Ask a complex question requiring deep reasoning..." : "Type your message..."}
            className={`w-full bg-slate-800 border ${thinkingMode ? 'border-purple-500/30 focus:border-purple-500' : 'border-slate-700 focus:border-indigo-500'} rounded-xl pl-4 pr-12 py-4 text-white outline-none focus:ring-1 focus:ring-opacity-50 transition-all`}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className={`absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center rounded-lg transition-all ${
              !input.trim() || loading 
                ? 'bg-slate-700 text-slate-500' 
                : (thinkingMode ? 'bg-purple-600 hover:bg-purple-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white')
            }`}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default SmartChat;
