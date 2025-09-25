import React, { useState, useRef, useEffect } from "react";
import { Button, Input } from "antd";
import { Send } from "lucide-react";

const { TextArea } = Input;

const MessageInput = ({ onSend, onTypingStart, onTypingStop, disabled }) => {
  const [text, setText] = useState("");
  const typingTimeoutRef = useRef(null);
  const isTypingRef = useRef(false);

  const handleSend = () => {
    const value = text.trim();
    if (!value || disabled) return;
    
    onSend && onSend(value);
    setText("");
    
    // Stop typing when message is sent
    if (isTypingRef.current) {
      onTypingStop && onTypingStop();
      isTypingRef.current = false;
    }
  };

  const handleTextChange = (e) => {
    setText(e.target.value);
    
    // Handle typing indicators
    if (e.target.value.trim() && !disabled) {
      if (!isTypingRef.current) {
        onTypingStart && onTypingStart();
        isTypingRef.current = true;
      }
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        if (isTypingRef.current) {
          onTypingStop && onTypingStop();
          isTypingRef.current = false;
        }
      }, 1000);
    } else if (isTypingRef.current) {
      onTypingStop && onTypingStop();
      isTypingRef.current = false;
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    }
  };

  const onKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTypingRef.current) {
        onTypingStop && onTypingStop();
      }
    };
  }, [onTypingStop]);

  return (
    <div className="border-t border-[#222] p-3 flex items-end gap-2">
      <TextArea
        value={text}
        onChange={handleTextChange}
        onKeyDown={onKeyDown}
        autoSize={{ minRows: 1, maxRows: 6 }}
        placeholder="Type a message..."
        disabled={disabled}
        className="resize-none"
      />
      <Button 
        type="primary" 
        icon={<Send size={16} />} 
        onClick={handleSend} 
        disabled={disabled || !text.trim()}
        loading={disabled}
      >
        Send
      </Button>
    </div>
  );
};

export default MessageInput;