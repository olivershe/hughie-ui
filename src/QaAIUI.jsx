import React, { useState, useRef, useEffect } from "react";
import {
  Paperclip,
  Menu,
  Plus,
  User,
  Scale,
  DollarSign,
  Stethoscope,
  Cpu,
  ArrowUp,
  Edit3,
  Trash2,
  Sun,
  Moon,
} from "lucide-react";

const legalInstructions = `You are a legal assistant AI built to help users clarify vague legal questions and provide structured, jurisdiction-specific answers. Your task is to:

1. Reformulate vague or informal legal queries into clear, formal prompts ("Refined Prompt").
2. Ask 2–4 clarifying questions to gather missing information required to answer the legal query.
   - For each question, explain why it matters legally.
3. Prepare a "Model-Ready Prompt Template" with placeholders such as {tenancy_type} or {notice_status}. Do not show this template until the user has answered the follow-up questions.
4. Ask the user to provide answers to the follow-up questions.

Once the user provides answers to each follow-up, you must:

5. Automatically fill the placeholders in the prompt template using their responses.
6. Use that completed prompt to generate a final legal response based on UK law.

Use the following format:

Refined Prompt:
<Your reformulated legal question>

Follow-up Questions and Reasoning:
1. <Question 1>
   - Reasoning: <Why this matters>
... (2–4 questions)

(After the user replies, inject their answers into your prompt template and provide the legal response.)

Additional rules:
- Assume UK jurisdiction unless otherwise stated.
- Always clarify before answering vague questions.
- Do not hallucinate laws—reason from first legal principles.
- Be neutral and accurate in tone.`;

const renderAssistantContent = (content) => {
  if (!content) return null;
  return content.split("\n").map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === "") return <br key={idx} />;
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <div key={idx} className="mb-1 font-syrene">
          {trimmed}
        </div>
      );
    }
    if (trimmed.startsWith("- Reasoning:")) {
      return (
        <div key={idx} className="ml-4 text-sm text-gray-500 font-syrene">
          {trimmed}
        </div>
      );
    }
    return (
      <div key={idx} className="font-syrene">
        {trimmed}
      </div>
    );
  });
};

const QaAIUI = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [selectedMode, setSelectedMode] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem("darkMode");
    return saved ? JSON.parse(saved) : false;
  });
  const [apiKey, setApiKey] = useState("");
  const [tempApiKey, setTempApiKey] = useState("");
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!apiKey) {
      console.error("OpenAI API key is missing. Please enter it.");
    }
  }, [apiKey]);

  const [conversations, setConversations] = useState(() => {
    const saved = localStorage.getItem("conversations");
    return saved ? JSON.parse(saved) : [];
  });
  const [currentConversationId, setCurrentConversationId] = useState(null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    const first = conversations[0];
    if (first && currentConversationId === null) {
      setCurrentConversationId(first.id);
      setMessages(first.messages || []);
    } else if (!first && currentConversationId === null) {
      const id = Date.now();
      const conv = { id, title: "New chat", messages: [], time: "" };
      setConversations([conv]);
      setCurrentConversationId(id);
    }
  }, [conversations, currentConversationId]);

  useEffect(() => {
    localStorage.setItem("conversations", JSON.stringify(conversations));
  }, [conversations]);

  const modes = [
    { id: "legal", label: "Legal", icon: Scale },
    { id: "finance", label: "Finance", icon: DollarSign },
    { id: "medical", label: "Medical", icon: Stethoscope },
    { id: "agent", label: "Agent mode", icon: Cpu },
  ];

  // Theme colors for main and sidebar
  const themeColors = {
    null: {
      main: "bg-white dark:bg-gray-900",
      sidebar: "bg-gray-50 dark:bg-gray-800",
    },
    legal: {
      main: "bg-green-50 dark:bg-gray-900",
      sidebar: "bg-green-100 dark:bg-gray-800",
    },
    finance: {
      main: "bg-blue-50 dark:bg-gray-900",
      sidebar: "bg-blue-100 dark:bg-gray-800",
    },
    medical: {
      main: "bg-red-50 dark:bg-gray-900",
      sidebar: "bg-red-100 dark:bg-gray-800",
    },
    agent: {
      main: "bg-purple-50 dark:bg-gray-900",
      sidebar: "bg-purple-100 dark:bg-gray-800",
    },
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!apiKey) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md w-80">
          <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
            Enter OpenAI API Key
          </h2>
          <input
            type="password"
            className="w-full border border-gray-300 dark:border-gray-700 rounded p-2 mb-4 dark:bg-gray-700 dark:text-gray-100"
            value={tempApiKey}
            onChange={(e) => setTempApiKey(e.target.value)}
            placeholder="sk-..."
          />
          <button
            onClick={() => setApiKey(tempApiKey.trim())}
            disabled={!tempApiKey.trim()}
            className="w-full bg-gray-900 text-white py-2 rounded disabled:opacity-50"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  const streamResponse = async (userMessage) => {
    setIsGenerating(true);

    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const replyId = Date.now();
    const placeholder = {
      id: replyId,
      type: "assistant",
      content: "",
      timestamp,
    };
    setMessages((prev) => [...prev, placeholder]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: [...(c.messages || []), placeholder],
              time: timestamp,
            }
          : c,
      ),
    );

    try {
      let systemPrompt = "";
      if (selectedMode === "legal") {
        systemPrompt = legalInstructions;
      } else {
        systemPrompt =
          "You are QaAI, a professional AI assistant specializing in ";
        if (selectedMode === "finance")
          systemPrompt +=
            "financial analysis and insights. Provide data-driven financial information while noting you cannot provide investment advice.";
        else if (selectedMode === "medical")
          systemPrompt +=
            "medical information. Provide accurate health information while noting you cannot diagnose or replace professional medical advice.";
        else if (selectedMode === "agent")
          systemPrompt +=
            "complex multi-step problem solving as an autonomous agent.";
        else
          systemPrompt +=
            "democratizing expertise across legal, financial, and medical domains.";
      }

      console.log("Sending request to OpenAI", {
        mode: selectedMode,
        userMessage,
      });
      const response = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-2024-08-06",
            stream: true,
            messages: [
              { role: "system", content: systemPrompt },
              { role: "user", content: userMessage },
            ],
          }),
        },
      );

      if (!response.ok) {
        let errorBody = "";
        try {
          errorBody = await response.text();
        } catch (readErr) {
          console.error("Failed to read error response body", readErr);
        }
        const err = new Error("API request failed");
        err.status = response.status;
        err.body = errorBody;
        err.statusText = response.statusText;
        throw err;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();
        for (const line of lines) {
          const cleaned = line.trim();
          if (!cleaned || cleaned === "data: [DONE]") continue;
          const json = JSON.parse(cleaned.replace(/^data: /, ""));
          const content = json.choices?.[0]?.delta?.content;
          if (content) {
            setMessages((prev) => {
              const msgs = [...prev];
              msgs[msgs.length - 1].content += content;
              return msgs;
            });
            // Avoid updating conversations during streaming to prevent
            // duplicating content. We'll sync after streaming completes.
          }
        }
      }
    } catch (e) {
      console.error("OpenAI API error", {
        message: e.message,
        status: e.status,
        statusText: e.statusText,
        body: e.body,
      });
      let errorMsg = "Something went wrong, please try again later.";
      if (e.status === 401) {
        errorMsg = "Authentication failed. Please check your API key.";
      } else if (e.status === 429) {
        errorMsg = "Rate limit exceeded. Please wait before trying again.";
      }
      setMessages((prev) => {
        const msgs = [...prev];
        msgs[msgs.length - 1].content = errorMsg;
        return msgs;
      });
      // Error message will be synced to the conversation after streaming
      // finishes, so no need to update it here.
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isGenerating) return;
    if (!apiKey) return;
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
    const newMessage = {
      id: Date.now(),
      type: "user",
      content: inputValue.trim(),
      timestamp,
    };
    setMessages((prev) => [...prev, newMessage]);
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId
          ? {
              ...c,
              messages: [...(c.messages || []), newMessage],
              title: c.messages?.length
                ? c.title
                : inputValue.trim().slice(0, 20),
              time: timestamp,
              mode: c.mode || selectedMode,
            }
          : c,
      ),
    );
    const message = inputValue.trim();
    setInputValue("");
    await streamResponse(message);
    // After streaming completes, sync the conversation with the
    // latest messages state to avoid duplication issues.
    setConversations((prev) =>
      prev.map((c) =>
        c.id === currentConversationId ? { ...c, messages: [...messages] } : c,
      ),
    );
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
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
      title: "New chat",
      messages: [],
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
      mode: selectedMode,
    };
    setConversations((prev) => [newConv, ...prev]);
    setCurrentConversationId(id);
    setMessages([]);
  };

  const openConversation = (id) => {
    const conv = conversations.find((c) => c.id === id);
    if (!conv) return;
    setCurrentConversationId(id);
    setMessages(conv.messages || []);
    setSelectedMode(conv.mode || null);
  };

  return (
    <div
      className={`flex h-screen transition-colors duration-500 ${themeColors[selectedMode || "null"].main} dark:bg-gray-900`}
      style={{ background: "var(--bg-gradient)" }}
    >
      {/* Sidebar */}
      <div
        className={`${isSidebarOpen ? "w-64" : "w-0"} transition-all duration-300 ${themeColors[selectedMode || "null"].sidebar} border-r border-gray-200 overflow-hidden dark:bg-gray-800`}
      >
        <div className="p-4">
          <button
            onClick={handleNewChat}
            className="flex items-center gap-2 w-full p-3 hover:bg-gray-200 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="text-sm">New chat</span>
          </button>
        </div>
        <div className="px-4 pb-2">
          <h3 className="text-xs font-medium text-gray-600 dark:text-gray-400">
            Today
          </h3>
        </div>
        <div className="overflow-y-auto">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition-colors group"
            >
              <div
                className="flex items-center justify-between"
                onClick={() => openConversation(conv.id)}
              >
                <div>
                  <div className="text-sm font-medium flex items-center gap-2">
                    {conv.mode &&
                      React.createElement(
                        modes.find((m) => m.id === conv.mode)?.icon,
                        {
                          className:
                            "w-3.5 h-3.5 text-gray-600 dark:text-gray-400",
                        },
                      )}
                    {conv.title}
                  </div>
                  {conv.messages && conv.messages.length > 0 && (
                    <div className="text-xs text-gray-500">
                      {conv.messages[conv.messages.length - 1].content.slice(
                        0,
                        30,
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      const title = window.prompt(
                        "Rename conversation",
                        conv.title,
                      );
                      if (title)
                        setConversations((prev) =>
                          prev.map((c) =>
                            c.id === conv.id ? { ...c, title } : c,
                          ),
                        );
                    }}
                    className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm("Delete conversation?")) {
                        setConversations((prev) => {
                          const arr = prev.filter((c) => c.id !== conv.id);
                          if (currentConversationId === conv.id) {
                            setMessages([]);
                            setCurrentConversationId(arr[0]?.id || null);
                          }
                          return arr;
                        });
                      }
                    }}
                    className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {conv.time && (
                <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  {conv.time}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div
          className={`border-b border-gray-200 px-4 py-3 flex items-center justify-between transition-colors duration-500 ${themeColors[selectedMode || "null"].main} dark:border-gray-700`}
        >
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 dark:text-gray-100">
              QaAI.ai
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm bg-gray-100 dark:bg-gray-700 dark:text-gray-100 px-3 py-1 rounded-full">
              QaAI v1
            </span>
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 max-w-2xl mx-auto min-h-full animate-fade-in">
              <h1
                className="text-3xl font-normal text-gray-900 mb-8 font-syrene"
              >
                Good afternoon, Oliver
              </h1>
              <p
                className="font-syrene text-gray-600 dark:text-gray-300 text-lg mb-12"
                style={{
                  letterSpacing: "-0.02em",
                }}
              >
                How can I help you today?
              </p>
              <div className="w-full max-w-xl mb-6">
                <div className="relative">
                  <textarea
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Message QaAI"
                    className="w-full px-4 py-3 pr-12 rounded-2xl border border-gray-300 focus:border-gray-400 focus:outline-none resize-none text-base bg-white dark:bg-gray-700 dark:text-gray-100"
                    rows="1"
                    style={{ minHeight: "52px" }}
                    disabled={isGenerating}
                  />
                  <div className="absolute right-2 bottom-2 flex items-center gap-1">
                    <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                      <Paperclip className="w-5 h-5 text-gray-400" />
                    </button>
                    <button
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isGenerating}
                      className={`p-1.5 rounded-md transition-colors ${
                        inputValue.trim() && !isGenerating
                          ? "bg-gray-900 hover:bg-gray-800 text-white"
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <ArrowUp
                        className={`w-5 h-5 ${inputValue.trim() && !isGenerating ? "text-white" : "text-gray-400 dark:text-gray-300"}`}
                      />
                    </button>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 flex-wrap justify-center">
                {modes.map((mode) => (
                  <button
                    key={mode.id}
                    onClick={() => handleModeSelect(mode.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-full border transition-all text-sm ${
                      selectedMode === mode.id
                        ? "border-gray-400 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-100"
                        : "border-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-100"
                    }`}
                  >
                    <mode.icon className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                    <span>{mode.label}</span>
                  </button>
                ))}
              </div>
              <p
                data-testid="tagline"
                className="font-syrene text-gray-500 text-sm mt-12"
                style={{
                  letterSpacing: "0.01em",
                }}
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
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 rounded-full">
                        {React.createElement(
                          modes.find((m) => m.id === selectedMode).icon,
                          {
                            className:
                              "w-4 h-4 text-gray-600 dark:text-gray-300",
                          },
                        )}
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {modes.find((m) => m.id === selectedMode)?.label} Mode
                        </span>
                      </div>
                    </div>
                  )}
                  {messages.map((message, index) => (
                    <div
                      key={message.id}
                      className={`${message.type === "user" ? "flex justify-end mb-8" : "mb-8"} animate-fade-in`}
                    >
                      {message.type === "user" ? (
                        <div className="flex items-start gap-3 justify-end">
                          <div>
                            <div className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 rounded-2xl text-gray-900 dark:text-gray-100">
                              {message.content}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 text-right">
                              {message.timestamp}
                            </div>
                          </div>
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-gray-700" />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <div
                            className={`px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-gray-900 dark:text-gray-100 leading-relaxed ${isGenerating && index === messages.length - 1 ? "blinking-cursor" : ""}`}
                          >
                            {message.content
                              ? renderAssistantContent(message.content)
                              : isGenerating &&
                                index === messages.length - 1 && (
                                  <div className="flex gap-1">
                                    <div
                                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                      style={{ animationDelay: "0ms" }}
                                    ></div>
                                    <div
                                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                      style={{ animationDelay: "150ms" }}
                                    ></div>
                                    <div
                                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                                      style={{ animationDelay: "300ms" }}
                                    ></div>
                                  </div>
                                )}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {message.timestamp}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
              {/* Input area at bottom */}
              <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-4">
                <div className="max-w-3xl mx-auto">
                  <div className="relative">
                    <textarea
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Reply to QaAI${selectedMode ? ` (${modes.find((m) => m.id === selectedMode)?.label} mode)` : ""}...`}
                      className="w-full px-4 py-3 pr-24 rounded-2xl border border-gray-300 focus:border-gray-400 focus:outline-none resize-none text-base bg-white dark:bg-gray-700 dark:text-gray-100"
                      rows="1"
                      style={{ minHeight: "52px" }}
                      disabled={isGenerating}
                    />
                    <div className="absolute right-2 bottom-2 flex items-center gap-1">
                      <button className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                        <Paperclip className="w-5 h-5 text-gray-400" />
                      </button>
                      <button
                        onClick={handleSendMessage}
                        disabled={!inputValue.trim() || isGenerating}
                        className={`p-1.5 rounded-md transition-colors ${
                          inputValue.trim() && !isGenerating
                            ? "bg-gray-900 hover:bg-gray-800 text-white"
                            : "hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <ArrowUp
                          className={`w-5 h-5 ${inputValue.trim() && !isGenerating ? "text-white" : "text-gray-400 dark:text-gray-300"}`}
                        />
                      </button>
                    </div>
                  </div>
                  {selectedMode && (
                    <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                      <span>
                        QaAI v1 •{" "}
                        {modes.find((m) => m.id === selectedMode)?.label} Mode
                      </span>
                      <button
                        onClick={() => setSelectedMode(null)}
                        className="hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                      >
                        Change mode
                      </button>
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
