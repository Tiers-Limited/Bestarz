import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { message } from "antd";
import { useAuth } from "../AuthContext";
import io from "socket.io-client";

const MessageContext = createContext();

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState({});
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState({});

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Initialize Socket.IO connection
  useEffect(() => {
    if (token && user) {
      const socketInstance = io(baseUrl, {
        auth: { token },
        transports: ['websocket', 'polling']
      });

      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketInstance.on('new_message', (newMessage) => {
        setMessages(prev => ({
          ...prev,
          [newMessage.conversation]: [
            ...(prev[newMessage.conversation] || []),
            {
              id: newMessage._id,
              senderId: newMessage.sender._id,
              senderName: `${newMessage.sender.firstName} ${newMessage.sender.lastName}`,
              text: newMessage.content,
              timestamp: new Date(newMessage.createdAt).toLocaleTimeString(),
              messageType: newMessage.messageType,
              attachments: newMessage.attachments,
              avatarUrl: newMessage.sender.profileImage
            }
          ]
        }));
      });

      socketInstance.on('conversation_updated', ({ conversationId, lastMessage, unreadCount: newUnreadCount }) => {
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? {
                  ...conv,
                  lastMessage: lastMessage.content,
                  lastMessageAt: new Date(lastMessage.createdAt).toLocaleTimeString(),
                  unreadCount: newUnreadCount
                }
              : conv
          )
        );
        fetchUnreadCount();
      });

      socketInstance.on('user_typing', ({ userId, isTyping }) => {
        setTypingUsers(prev => ({
          ...prev,
          [userId]: isTyping
        }));
      });

      socketInstance.on('message_error', ({ error }) => {
        message.error(error);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [token, user, baseUrl]);

  // Fetch conversations
  const fetchConversations = useCallback(async (page = 1, limit = 20) => {
    if (!token) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/messages/conversations?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        const formattedConversations = data.conversations.map(conv => ({
          id: conv._id,
          title: conv.title || getConversationTitle(conv.participants, user._id),
          avatarUrl: getOtherParticipant(conv.participants, user._id)?.profileImage,
          lastMessage: conv.lastMessage?.content || "",
          lastMessageAt: conv.lastMessage ? new Date(conv.lastMessage.createdAt).toLocaleTimeString() : "",
          unreadCount: conv.unreadCount?.get?.(user._id) || 0,
          participants: conv.participants,
          booking: conv.booking
        }));
        
        setConversations(formattedConversations);
        
        // Set first conversation as active if none selected
        if (!activeConversation && formattedConversations.length > 0) {
          setActiveConversation(formattedConversations[0]);
        }
      } else {
        message.error(data.message || "Failed to load conversations");
      }
    } catch (err) {
      console.error("Fetch conversations error:", err);
      message.error("Network error while fetching conversations");
    } finally {
      setLoading(false);
    }
  }, [token, user, baseUrl, activeConversation]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(async (conversationId, page = 1, limit = 50) => {
    if (!token || !conversationId) return;
    
    try {
      const res = await fetch(`${baseUrl}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        const formattedMessages = data.messages.map(msg => ({
          id: msg._id,
          senderId: msg.sender._id,
          senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
          text: msg.content,
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),
          messageType: msg.messageType,
          attachments: msg.attachments,
          avatarUrl: msg.sender.profileImage
        }));
        
        setMessages(prev => ({
          ...prev,
          [conversationId]: formattedMessages
        }));

        // Join the conversation room for real-time updates
        if (socket) {
          socket.emit('join_conversation', conversationId);
        }
      } else {
        message.error(data.message || "Failed to load messages");
      }
    } catch (err) {
      console.error("Fetch messages error:", err);
      message.error("Network error while fetching messages");
    }
  }, [token, baseUrl, socket]);

  // Send message
  const sendMessage = useCallback(async (conversationId, content, messageType = 'text', attachments = []) => {
    if (!token || !conversationId || !content.trim()) return;
    
    try {
      const res = await fetch(`${baseUrl}/messages/conversations/${conversationId}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content, messageType, attachments }),
      });
      const data = await res.json();
      
      if (res.ok) {
        const newMessage = {
          id: data.message._id,
          senderId: data.message.sender._id,
          senderName: `${data.message.sender.firstName} ${data.message.sender.lastName}`,
          text: data.message.content,
          timestamp: new Date(data.message.createdAt).toLocaleTimeString(),
          messageType: data.message.messageType,
          attachments: data.message.attachments,
          avatarUrl: data.message.sender.profileImage
        };

        // Update local messages state
        setMessages(prev => ({
          ...prev,
          [conversationId]: [...(prev[conversationId] || []), newMessage]
        }));

        // Update conversation list
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, lastMessage: content, lastMessageAt: "now", unreadCount: 0 }
              : conv
          )
        );

        // Emit via socket for real-time updates
        if (socket) {
          socket.emit('send_message', {
            conversationId,
            content,
            messageType,
            attachments
          });
        }
      } else {
        message.error(data.message || "Failed to send message");
      }
    } catch (err) {
      console.error("Send message error:", err);
      message.error("Network error while sending message");
    }
  }, [token, baseUrl, socket]);

  // Create new conversation
  const createConversation = useCallback(async (participantId, bookingId = null, title = null) => {
    if (!token || !participantId) return null;
    
    try {
      const res = await fetch(`${baseUrl}/messages/conversations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ participantId, bookingId, title }),
      });
      const data = await res.json();
      
      if (res.ok) {
        const newConversation = {
          id: data.conversation._id,
          title: data.conversation.title || getConversationTitle(data.conversation.participants, user._id),
          avatarUrl: getOtherParticipant(data.conversation.participants, user._id)?.profileImage,
          lastMessage: "",
          lastMessageAt: "",
          unreadCount: 0,
          participants: data.conversation.participants,
          booking: data.conversation.booking
        };
        
        setConversations(prev => [newConversation, ...prev]);
        setActiveConversation(newConversation);
        
        return newConversation;
      } else {
        message.error(data.message || "Failed to create conversation");
        return null;
      }
    } catch (err) {
      console.error("Create conversation error:", err);
      message.error("Network error while creating conversation");
      return null;
    }
  }, [token, baseUrl, user]);

  // Mark messages as read
  const markAsRead = useCallback(async (conversationId) => {
    if (!token || !conversationId) return;
    
    try {
      const res = await fetch(`${baseUrl}/messages/conversations/${conversationId}/read`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (res.ok) {
        // Update conversation unread count
        setConversations(prev => 
          prev.map(conv => 
            conv.id === conversationId 
              ? { ...conv, unreadCount: 0 }
              : conv
          )
        );
        fetchUnreadCount();
      }
    } catch (err) {
      console.error("Mark as read error:", err);
    }
  }, [token, baseUrl]);

  // Fetch total unread count
  const fetchUnreadCount = useCallback(async () => {
    if (!token) return;
    
    try {
      const res = await fetch(`${baseUrl}/messages/unread-count`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      
      if (res.ok) {
        setUnreadCount(data.unreadCount);
      }
    } catch (err) {
      console.error("Fetch unread count error:", err);
    }
  }, [token, baseUrl]);

  // Set active conversation and fetch its messages
  const setActiveConversationAndFetch = useCallback((conversation) => {
    setActiveConversation(conversation);
    if (conversation) {
      fetchMessages(conversation.id);
      markAsRead(conversation.id);
    }
  }, [fetchMessages, markAsRead]);

  // Typing indicators
  const startTyping = useCallback((conversationId) => {
    if (socket && conversationId) {
      socket.emit('typing_start', { conversationId });
    }
  }, [socket]);

  const stopTyping = useCallback((conversationId) => {
    if (socket && conversationId) {
      socket.emit('typing_stop', { conversationId });
    }
  }, [socket]);

  // Helper functions
  const getConversationTitle = (participants, currentUserId) => {
    const otherParticipant = participants.find(p => p._id !== currentUserId);
    return otherParticipant ? `${otherParticipant.firstName} ${otherParticipant.lastName}` : "Unknown";
  };

  const getOtherParticipant = (participants, currentUserId) => {
    return participants.find(p => p._id !== currentUserId);
  };

  // Load conversations on mount
  useEffect(() => {
    if (token && user) {
      fetchConversations();
      fetchUnreadCount();
    }
  }, [token, user, fetchConversations, fetchUnreadCount]);

  const value = {
    conversations,
    activeConversation,
    messages: messages[activeConversation?.id] || [],
    loading,
    unreadCount,
    typingUsers,
    socket,
    
    // Actions
    fetchConversations,
    fetchMessages,
    sendMessage,
    createConversation,
    markAsRead,
    setActiveConversation: setActiveConversationAndFetch,
    startTyping,
    stopTyping,
    
    // Utilities
    getOtherParticipant,
    getConversationTitle
  };

  return (
    <MessageContext.Provider value={value}>
      {children}
    </MessageContext.Provider>
  );
};