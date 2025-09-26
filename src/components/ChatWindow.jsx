import React from "react";
import { Avatar, Dropdown } from "antd";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

const ChatHeader = ({ title, subtitle, avatarUrl, menuItems }) => {
  return (
    <div className="flex items-center justify-between px-4 py-3 border-b border-[#222]">
      <div className="flex items-center gap-3 min-w-0">
        <Avatar size={40} src={avatarUrl}>
          {title?.[0] || "?"}
        </Avatar>
        <div className="min-w-0">
          <p className="text-white font-medium truncate">{title}</p>
          {/* {subtitle && <p className="text-xs text-gray-400 truncate">{subtitle}</p>} */}
        </div>
      </div>
      {menuItems?.length ? (
        <Dropdown menu={{ items: menuItems }} trigger={["click"]}>
          <button className="text-gray-300 hover:text-white p-2">•••</button>
        </Dropdown>
      ) : null}
    </div>
  );
};

const ChatWindow = ({
  header,
  messages,
  currentUserId,
  onSend,
  onTypingStart,
  onTypingStop,
  inputDisabled,
  loading
}) => {


  console.log(currentUserId,"currentUserId")
  return (
    <div className="flex flex-col h-full">
      <ChatHeader {...header} />
      <MessageList 
        messages={messages} 
        currentUserId={currentUserId}
        loading={loading}
      />
      <MessageInput 
        onSend={onSend} 
        onTypingStart={onTypingStart}
        onTypingStop={onTypingStop}
        disabled={inputDisabled} 
      />
    </div>
  );
};

export default ChatWindow;