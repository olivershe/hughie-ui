import React from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import ReasoningCard from "../ReasoningCard";

export const renderAssistantContent = (content) => {
  if (!content) return null;
  return content.split("\n").map((line, idx) => {
    const trimmed = line.trim();
    if (trimmed === "") return <br key={idx} />;
    if (/^\d+\.\s/.test(trimmed)) {
      return (
        <div key={idx} className="mb-1 font-sans">
          {trimmed}
        </div>
      );
    }
    if (trimmed.startsWith("- Reasoning:")) {
      return (
        <div key={idx} className="ml-4 text-sm text-gray-500 font-sans">
          {trimmed}
        </div>
      );
    }
    return (
      <div key={idx} className="font-sans">
        {trimmed}
      </div>
    );
  });
};

const ChatBubble = ({ message, isLast, isGenerating }) => {
  if (message.role === "reasoning") {
    return <ReasoningCard text={message.text} />;
  }
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 35 }}
      className={message.role === "user" ? "flex justify-end mb-8" : "mb-8"}
    >
      {message.role === "user" ? (
        <div className="flex items-start gap-3 justify-end">
          <div>
            <div className="glass px-4 py-2.5 rounded-2xl text-gray-900 dark:text-gray-100">
              {message.md}
            </div>
            {message.ts && (
              <div className="text-xs text-gray-500 mt-1 text-right">{message.ts}</div>
            )}
          </div>
          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-gray-700" />
          </div>
        </div>
      ) : (
        <div>
          <div
            className={`glass px-4 py-2.5 rounded-2xl text-gray-900 dark:text-gray-100 leading-relaxed ${
              isGenerating && isLast ? "blinking-cursor" : ""
            }`}
          >
            {message.md ? (
              renderAssistantContent(message.md)
            ) : (
              isGenerating &&
              isLast && (
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              )
            )}
          </div>
          {message.ts && <div className="text-xs text-gray-500 mt-1">{message.ts}</div>}
        </div>
      )}
    </motion.div>
  );
};

export default ChatBubble;
