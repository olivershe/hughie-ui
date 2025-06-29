import React from "react";
import { Edit3, Trash2 } from "lucide-react";

const ConversationList = ({ conversations, onOpen, onRename, onDelete, modes }) => {
  return (
    <div>
      {conversations.map((conv) => (
        <div
          key={conv.id}
          className="px-4 py-2 hover:bg-gray-200 cursor-pointer transition-colors group"
        >
          <div
            className="flex items-center justify-between"
            onClick={() => onOpen(conv.id)}
          >
            <div>
              <div className="text-sm font-medium flex items-center gap-2">
                {conv.mode &&
                  React.createElement(
                    modes.find((m) => m.id === conv.mode)?.icon,
                    {
                      className: "w-3.5 h-3.5 text-gray-600 dark:text-gray-400",
                    }
                  )}
                {conv.title}
              </div>
              {conv.messages && conv.messages.length > 0 && (
                <div className="text-xs text-gray-500">
                  {conv.messages[conv.messages.length - 1].content.slice(0, 30)}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRename(conv.id);
                }}
                className="p-1 hover:bg-gray-300 dark:hover:bg-gray-600 rounded"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(conv.id);
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
  );
};

export default ConversationList;
