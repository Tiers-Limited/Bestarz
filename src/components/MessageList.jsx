import React, { useEffect, useRef } from "react";
import { Avatar, Tooltip } from "antd";

const MessageBubble = ({ message, isOwn }) => {

  console.log(message,"messagemessage")
  return (
    <div className={`flex items-end gap-2 ${isOwn ? "justify-end" : "justify-start"}`}>
      {!isOwn && (
        <Avatar size={28} src={message.avatarUrl}>
          {message.senderName?.[0] || "?"}
        </Avatar>
      )}
      <Tooltip title={message.timestamp} placement={isOwn ? "left" : "right"}>
        <div
          className={`max-w-[70%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap break-words ${
            isOwn ? "bg-blue-600 text-white" : "bg-[#1a1a1a] text-gray-100"
          }`}
        >
          {message.text}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mt-2 space-y-1">
              {message.attachments.map((attachment, index) => (
                <div key={index} className="text-xs opacity-75">
                  📎 {attachment.name || attachment.url}
                </div>
              ))}
            </div>
          )}
        </div>
      </Tooltip>
      {isOwn && (
        <Avatar size={28} src={message.avatarUrl}>
          {message.senderName?.[0] || "?"}
        </Avatar>
      )}
    </div>
  );
};

const MessageList = ({ messages = [], currentUserId }) => {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto space-y-3 p-3">
      {messages.map((m) => (
        <MessageBubble key={m.id} message={m} isOwn={m.senderId === currentUserId} />
      ))}
      <div ref={bottomRef} />
      {messages.length === 0 && (
        <div className="text-center text-gray-400 py-6">No messages yet</div>
      )}
    </div>
  );
};

export default MessageList;


