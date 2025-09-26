import React from "react";
import { Avatar, Badge } from "antd";

const ConversationList = ({ conversations = [], activeId, onSelect }) => {
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };


  console.log(conversations,"conversations")



  return (
    <div className="w-full overflow-y-auto">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          onClick={() => onSelect && onSelect(conversation)}
          className={`w-full text-left flex items-center gap-3 px-3 py-3 hover:bg-[#1b1b1b] transition-colors ${
            activeId === conversation.id ? "bg-[#1a1a1a] border-l-2 border-l-blue-500" : ""
          }`}
        >
          <div className="relative flex-shrink-0">
            <Badge dot={conversation.unreadCount > 0} offset={[-2, 6]}>
              <Avatar src={conversation.avatarUrl} size={40}>
                {conversation.title?.[0]?.toUpperCase() || "?"}
              </Avatar>
            </Badge>
            {/* Online status indicator - you can add online status logic here */}
            {/* <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-[#111]"></div> */}
          </div>
          
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2 mb-1">
              <p className="truncate text-white font-medium">{conversation.title}</p>
              {conversation.lastMessageAt && (
                <span className="text-xs text-gray-400 whitespace-nowrap">
                  {conversation.lastMessageAt}
                </span>
              )}
            </div>
            
            <div className="flex items-center justify-between">
              <p className="truncate text-sm text-gray-400 flex-1">
                {conversation.lastMessage || "No messages yet"}
              </p>
              
              {conversation.unreadCount > 0 && (
                <span className="ml-2 inline-block bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
                  {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                </span>
              )}
            </div>
            
            {/* Booking info if available */}
            {conversation.booking && (
              <div className="mt-1">
                <span className="text-xs text-blue-400 bg-blue-900/20 px-2 py-0.5 rounded">
                  {conversation.booking.serviceCategory}
                </span>
              </div>
            )}
          </div>
        </button>
      ))}
      
      {conversations.length === 0 && (
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center text-gray-400">
            <p className="text-lg mb-2">No conversations</p>
            <p className="text-sm">Your conversations will appear here</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationList;