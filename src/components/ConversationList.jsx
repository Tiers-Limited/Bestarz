import React from "react";
import { Avatar, Badge } from "antd";

const ConversationList = ({ conversations = [], activeId, onSelect }) => {
  return (
    <div className="w-full overflow-y-auto">
      {conversations.map((c) => (
        <button
          key={c.id}
          onClick={() => onSelect && onSelect(c)}
          className={`w-full text-left flex items-center gap-3 px-3 py-3 hover:bg-[#1b1b1b] transition-colors ${
            activeId === c.id ? "bg-[#1a1a1a]" : ""
          }`}
        >
          <Badge dot={c.unreadCount > 0} offset={[-2, 6]}>
            <Avatar src={c.avatarUrl} size={40}>
              {c.title?.[0] || "?"}
            </Avatar>
          </Badge>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-white font-medium">{c.title}</p>
              {c.lastMessageAt && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {c.lastMessageAt}
                </span>
              )}
            </div>
            <p className="truncate text-sm text-gray-400">{c.lastMessage || ""}</p>
          </div>
          {c.unreadCount > 0 && (
            <span className="ml-2 inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
              {c.unreadCount}
            </span>
          )}
        </button>
      ))}
      {conversations.length === 0 && (
        <div className="text-center text-gray-400 py-6">No conversations</div>
      )}
    </div>
  );
};

export default ConversationList;


