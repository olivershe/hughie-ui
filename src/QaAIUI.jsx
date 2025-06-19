import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Menu, Plus, User, Sparkles, Scale, DollarSign, Stethoscope, Cpu, ArrowUp } from 'lucide-react';

const QaAIUI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const apiKey = '';
  const messagesEndRef = useRef(null);

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem('conversations');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentConversationId, setCurrentConversationId] = useState(null);

  // Add global font styling
  useEffect(() => {
    document.body.style.fontFamily = '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", system-ui, sans-serif';
  }, []);

  useEffect(() => {
    const first = conversations[0];
    if (first && currentConversationId === null) {
      setCurrentConversationId(first.id);
      setMessages(first.messages || []);
    } else if (!first && currentConversationId === null) {
      const id = Date.now();
      const conv = { id, title: 'New chat', messages: [], time: '' };
      setConversations([conv]);
      setCurrentConversationId(id);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('conversations', JSON.stringify(conversations));
  }, [conversations]);

  const modes = [
    { id: 'legal', label: 'Legal', icon: Scale },
    { id: 'finance', label: 'Finance', icon: DollarSign },
    { id: 'medical', label: 'Medical', icon: Stethoscope },
    { id: 'agent', label: 'Agent mode', icon: Cpu }
  ];

  // Theme colors for main and sidebar
  const themeColors = {
    null: { main: 'bg-white', sidebar: 'bg-gray-50' },
    legal: { main: 'bg-green-50', sidebar: 'bg-green-100' },
    finance: { main: 'bg-blue-50', sidebar: 'bg-blue-100' },
    medical: { main: 'bg-red-50', sidebar: 'bg-red-100' },
    agent: { main: 'bg-purple-50', sidebar: 'bg-purple-100' }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const streamResponse = async (userMessage) => {
    setIsGenerating(true);
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const replyId = Date.now();
    const placeholder = { id: replyId, type: 'assistant', content: '', timestamp };
    setMessages(prev => [...prev, placeholder]);
    setConversations(prev =>
      prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: [...(c.messages || []), placeholder], time: timestamp }
          : c
      )
    );

    try {
      let systemPrompt = 'You are QaAI, a professional AI assistant specializing in ';
      if (selectedMode === 'legal')
        systemPrompt += 'legal matters. Provide accurate, professional legal information while noting you cannot provide legal advice.';
      else if (selectedMode === 'finance')
        systemPrompt +=
          'financial analysis and insights. Provide data-driven financial information while noting you cannot provide investment advice.';
      else if (selectedMode === 'medical')
        systemPrompt +=
          'medical information. Provide accurate health information while noting you cannot diagnose or replace professional medical advice.';
      else if (selectedMode === 'agent')
        systemPrompt += 'complex multi-step problem solving as an autonomous agent.';
      else systemPrompt += 'democratizing expertise across legal, financial, and medical domains.';

      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o-2024-08-06',
          stream: true,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
          ]
        })
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned || cleaned === 'data: [DONE]') continue;
          const json = JSON.parse(cleaned.replace(/^data: /, ''));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            setMessages(prev => {
              const msgs = [...prev];
              msgs[msgs.length - 1].content += content;
              return msgs;
            });
            setConversations(prev =>
              prev.map(c => {
                if (c.id !== currentConversationId) return c;
                const msgs = [...(c.messages || [])];
                msgs[msgs.length - 1].content += content;
                return { ...c, messages: msgs };
              })
            );
          }
        }
      }
    } catch (e) {
      setMessages(prev => {
        const msgs = [...prev];
        msgs[msgs.length - 1].content =
          'I apologize, but I encountered an error. Please check your API key and try again.';
        return msgs;
      });
      setConversations(prev =>
        prev.map(c => {
          if (c.id !== currentConversationId) return c;
          const msgs = [...(c.messages || [])];
          msgs[msgs.length - 1].content =
            'I apologize, but I encountered an error. Please check your API key and try again.';
          return { ...c, messages: msgs };
        })
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newMessage = { id: Date.now(), type: 'user', content: inputValue.trim(), timestamp };
    setMessages(prev => [...prev, newMessage]);
    setConversations(prev =>
      prev.map(c =>
        c.id === currentConversationId
          ? { ...c, messages: [...(c.messages || []), newMessage], title: c.messages?.length ? c.title : inputValue.trim().slice(0, 20), time: timestamp }
          : c
      )
    );
    const message = inputValue.trim();
    setInputValue('');
    await streamResponse(message);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId === selectedMode ? null : modeId);
  };

  const handleNewChat = () => {
    const id = Date.now();
    const newConv = {
      id,
      title: 'New chat',
      messages: [],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setConversations(prev => [newConv, ...prev]);
    setCurrentConversationId(id);
    setMessages([]);
  };

  const openConversation = (id) => {
    const conv = conversations.find(c => c.id === id);
    if (!conv) return;
    setCurrentConversationId(id);
    setMessages(conv.messages || []);
  };

  return (
    <div className={`flex h-screen transition-colors duration-500 ${themeColors[selectedMode || 'null'].main}`}>
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 ${themeColors[selectedMode || 'null'].sidebar} border-r border-gray-200 overflow-hidden`}>
        <div className="p-4">
          <button onClick={handleNewChat} className="flex items-center gap-2 w-full p-3 hover:bg-gray-200 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm">New chat</span>
          </button>
        </div>
        <div className="px-4 pb-2">
          <h3 className="text-xs font-medium text-gray-600">Today</h3>
        </div>
        <div className="overflow-y-auto">
          {conversations.map(conv => (
            <div
              key={conv.id}
              onClick={() => openConversation(conv.id)}
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition-colors"
            >
              <div className="text-sm font-medium">{conv.title}</div>
              {conv.messages && conv.messages.length > 0 && (
                <div className="text-xs text-gray-500">
                  {conv.messages[conv.messages.length - 1].content.slice(0, 30)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className={`border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-colors duration-500 ${themeColors[selectedMode || 'null'].main}`}>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600">QaAI.ai</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-gray-100 px-3 py-1 rounded-full">QaAI v1</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto min-h-full">
              <h1 className="text-3xl font-normal text-gray-900 mb-8" style={{ fontFamily: 'Georgia, Times, serif' }}>Good afternoon, Oliver</h1>
              <p className="text-gray-600 text-lg mb-12" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif', letterSpacing: '-0.02em' }}>
                How can I help you today?
              </p>
              <div className="w-full max-w-xl mb-6">
                <div className="relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message QaAI"
                    className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:border-gray-400 focus:outline-none resize-none text-base bg-white"
                    rows="1"
                    style={{ minHeight: '52px' }}
                    disabled={isGenerating}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <button onClick={handleSendMessage} disabled={!inputValue.trim() || isGenerating} className={`p-1.5 rounded-md transition-colors ${
                      inputValue.trim() && !isGenerating ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'hover:bg-gray-100'
                    }`}>
                      <ArrowUp className={`w-5 h-5 ${inputValue.trim() && !isGenerating ? 'text-white' : 'text-gray-400'}`} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {modes.map(mode => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm ${
                      selectedMode === mode.id ? 'border-gray-400 bg-gray-100 text-gray-700' : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <mode.icon className="w-4 h-4 text-gray-600" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
              <p
                data-testid="tagline"
                className="text-gray-500 text-sm mt-12"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", system-ui, sans-serif', letterSpacing: '0.01em' }}
              >
                Democratising Expertise
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="flex-1 overflow-y-auto">
                <div className="max-w-3xl mx-auto px-4 py-6">
                  {selectedMode && (
                    <div className="text-center mb-6">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-full">
                        {React.createElement(modes.find(m => m.id === selectedMode).icon, { className: 'w-4 h-4 text-gray-600' })}
                        <span className="text-sm text-gray-600">{modes.find(m => m.id === selectedMode)?.label} Mode</span>
                      </div>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`${message.type === 'user' ? 'flex justify-end mb-8' : 'mb-8'} animate-fade-in`}
                    >
                      {message.type === 'user' ? (
                        <div className="flex items-start gap-3 justify-end">
                          <div>
                            <div className="px-4 py-2.5 bg-gray-100 rounded-2xl text-gray-900">{message.content}</div>
                            <div className="text-xs text-gray-500 mt-1 text-right">{message.timestamp}</div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-700" />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div className="px-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-gray-900 leading-relaxed">{message.content || (isGenerating && index === messages.length - 1 && (
                            <div className="flex gap-1">
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                            </div>
                          ))}</div>
                          <div className="text-xs text-gray-500 mt-1">{message.timestamp}</div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              {/* Input area at bottom */}
              <div className="border-t border-gray-200 bg-white px-4 py-4">
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Reply to QaAI${selectedMode ? ` (${modes.find(m => m.id === selectedMode)?.label} mode)` : ''}...`}
                      className="w-full px-4 py-3 pr-24 rounded-2xl border border-gray-300 focus:border-gray-400 focus:outline-none resize-none text-base bg-white"
                      rows="1"
                      style={{ minHeight: '52px' }}
                      disabled={isGenerating}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
                        <Paperclip className="w-5 h-5 text-gray-400" />
                      </button>
                      <button onClick={handleSendMessage} disabled={!inputValue.trim() || isGenerating} className={`p-1.5 rounded-md transition-colors ${
                        inputValue.trim() && !isGenerating ? 'bg-gray-900 hover:bg-gray-800 text-white' : 'hover:bg-gray-100'
                      }`}>
                        <ArrowUp className={`w-5 h-5 ${inputValue.trim() && !isGenerating ? 'text-white' : 'text-gray-400'}`} />
                      </button>
                    </div>
                  </div>
                  {selectedMode && (
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>QaAI v1 • {modes.find(m => m.id === selectedMode)?.label} Mode</span>
                      <button onClick={() => setSelectedMode(null)} className="hover:text-gray-700 transition-colors">Change mode</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default QaAIUI;
