// components/UnreadCountBadge.jsx
import React from "react";
import { Badge } from "antd";
import { MessageCircle } from "lucide-react";
import { useMessage } from "../context/messages/MessageContext";

const UnreadCountBadge = ({ children, showIcon = false, className = "" }) => {
  const { unreadCount } = useMessage();

  if (showIcon) {
    return (
      <Badge count={unreadCount} overflowCount={99} className={className}>
        <MessageCircle size={20} className="text-gray-400" />
      </Badge>
    );
  }

  return (
    <Badge count={unreadCount} overflowCount={99} className={className}>
      {children}
    </Badge>
  );
};

export default UnreadCountBadge;