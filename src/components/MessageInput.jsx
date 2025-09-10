import React, { useState } from "react";
import { Button, Input } from "antd";
import { Send } from "lucide-react";

const { TextArea } = Input;

const MessageInput = ({ onSend, disabled }) => {
  const [text, setText] = useState("");

  const handleSend = () => {
    const value = text.trim();
    if (!value) return;
    onSend && onSend(value);
    setText("");
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="border-t border-[#222] p-3 flex items-end gap-2">
      <TextArea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKeyDown}
        autoSize={{ minRows: 1, maxRows: 6 }}
        placeholder="Type a message"
        disabled={disabled}
      />
      <Button type="primary" icon={<Send size={16} />} onClick={handleSend} disabled={disabled}>
        Send
      </Button>
    </div>
  );
};

export default MessageInput;


