import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
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
  const socketUrl = import.meta.env.VITE_SOCKET_URL;

  // Initialize Socket.IO connection
  useEffect(() => {
    if (token && user) {
      const socketInstance = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", () => {
        console.log("Connected to socket server");
        // Join user room for receiving conversation updates
        socketInstance.emit("join_user_room", user._id);
      });

      // 🔹 new_message - Handle incoming messages
      socketInstance.on("new_message", (newMessage) => {
        console.log("Received new message:", newMessage);
        const conversationId = newMessage.conversation;
        
        setMessages((prev) => ({
          ...prev,
          [conversationId]: [
            ...(prev[conversationId] || []),
            formatMessage(newMessage),
          ],
        }));

        // Update conversation list
        if (newMessage.sender._id !== user._id) {
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId
                ? {
                    ...conv,
                    lastMessage: newMessage.content,
                    lastMessageAt: formatTime(newMessage.createdAt),
                    unreadCount:
                      conv.id === activeConversation?.id
                        ? 0 // Don't increment if this conversation is active
                        : conv.unreadCount + 1,
                  }
                : conv
            )
          );
          
          // Only update total unread count if conversation is not active


          console.log(conversationId,activeConversation?.id,"NEWW");

          if (conversationId !== activeConversation?.id) {
            fetchUnreadCount();
          }
        }
      });

      // 🔹 NEW: Handle new conversation creation
      socketInstance.on("new_conversation", (newConversationData) => {
        console.log("Received new conversation:", newConversationData);
        
        const conv = newConversationData;
        const otherParticipant = conv.participants.find(
          (p) => String(p._id) !== String(user._id)
        );


        const newConversation = {
          id: conv._id,
          title: otherParticipant
            ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
            : "Unknown User",
          avatarUrl: otherParticipant?.profileImage,
          lastMessage: "",
          lastMessageAt: "",
          unreadCount: 0,
          participants: conv.participants,
          booking: conv.booking,
          otherParticipant,
        };

        // Add to conversations list if not already present
        setConversations((prev) => {
          const exists = prev.some(c => c.id === newConversation.id);
          if (!exists) {
            return [newConversation, ...prev];
          }
          return prev;
        });

        // Join the conversation room immediately
        if (socketInstance.connected) {
          console.log(`Joining new conversation room: ${conv._id}`);
          socketInstance.emit("join_conversation", conv._id);
        }
      });

      // 🔹 conversation_updated
      socketInstance.on("conversation_updated", (data) => {
        const { conversationId, lastMessage, unreadCount: newUnreadCount } = data;
        
        setConversations((prev) =>
          prev.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  lastMessage: lastMessage.content,
                  lastMessageAt: formatTime(lastMessage.createdAt),
                  unreadCount: conv.id === activeConversation?.id ? 0 : newUnreadCount,
                }
              : conv
          )
        );
        
        // Only fetch unread count if this conversation is not currently active
        if (conversationId !== activeConversation?.id) {
          fetchUnreadCount();
        }
      });

      // 🔹 user_typing
      socketInstance.on("user_typing", ({ userId, isTyping }) => {
        if (userId !== user._id && activeConversation) {
          if (isTyping) {
            setTypingUsers((prev) => ({ ...prev, [userId]: true }));
          } else {
            setTypingUsers((prev) => {
              const updated = { ...prev };
              delete updated[userId];
              return updated;
            });
          }
        }
      });

      // 🔹 message_error
      socketInstance.on("message_error", ({ error }) => {
        message.error(error);
      });

      setSocket(socketInstance);
      return () => socketInstance.disconnect();
    }
  }, [token, user, socketUrl, activeConversation?.id]);

  // Helper function to format message data
  const formatMessage = (msg) => ({
    id: msg._id,
    senderId: msg.sender._id,
    senderName: `${msg.sender.firstName} ${msg.sender.lastName}`,
    text: msg.content,
    timestamp: formatTime(msg.createdAt),
    messageType: msg.messageType,
    attachments: msg.attachments || [],
    avatarUrl: msg.sender.profileImage,
  });

  // Helper function to format time
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));

    if (diffInMinutes < 1) return "now";
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return date.toLocaleDateString();
  };

  // Fetch conversations
  const fetchConversations = useCallback(
    async (page = 1, limit = 20) => {
      if (!token) return;

      setLoading(true);
      try {
        const res = await fetch(
          `${baseUrl}/messages/conversations?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        if (res.ok) {
          const formattedConversations = data.conversations.map((conv) => {
            // const otherParticipant = conv.participants.find(
            //   (p) => String(p._id) !== String(user._id)
            // );


              const otherParticipant = conv.otherParticipant;



            // Get unread count properly
            let unreadCount = 0;
            if (conv.unreadCount) {
              if (typeof conv.unreadCount.get === "function") {
                unreadCount = conv.unreadCount.get(user._id) || 0;
              } else if (typeof conv.unreadCount === "object") {
                unreadCount = conv.unreadCount[user._id] || 0;
              }
            }

            return {
              id: conv._id,
              title: otherParticipant
                ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                : "Unknown User",
              avatarUrl: otherParticipant?.profileImage,
              lastMessage: conv.lastMessage?.content || "",
              lastMessageAt: conv.lastMessage
                ? formatTime(conv.lastMessage.createdAt)
                : "",
              unreadCount,
              participants: conv.participants,
              booking: conv.booking,
              otherParticipant,
            };
          });

          setConversations(formattedConversations);

          // 🔹 FIX: Join all conversation rooms immediately after loading
          if (socket && socket.connected) {
            formattedConversations.forEach(conv => {
              console.log(`Joining conversation room on load: ${conv.id}`);
              socket.emit("join_conversation", conv.id);
            });
          }

          // Set first conversation as active if none selected and conversations exist
          // if (!activeConversation && formattedConversations.length > 0) {
          //   setActiveConversationAndFetch(formattedConversations[0]);
          // }
        } else {
          message.error(data.message || "Failed to load conversations");
        }
      } catch (err) {
        console.error("Fetch conversations error:", err);
        message.error("Network error while fetching conversations");
      } finally {
        setLoading(false);
      }
    },
    [token, user, baseUrl, activeConversation, socket]
  );

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (conversationId, page = 1, limit = 50) => {
      if (!token || !conversationId) return;

      try {
        const res = await fetch(
          `${baseUrl}/messages/conversations/${conversationId}/messages?page=${page}&limit=${limit}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        if (res.ok) {
          const formattedMessages = data.messages.map(formatMessage);

          setMessages((prev) => ({
            ...prev,
            [conversationId]: formattedMessages,
          }));

          // Join the conversation room for real-time updates
          if (socket && socket.connected) {
            console.log(`Joining conversation room: ${conversationId}`);
            socket.emit("join_conversation", conversationId);
          }
        } else {
          message.error(data.message || "Failed to load messages");
        }
      } catch (err) {
        console.error("Fetch messages error:", err);
        message.error("Network error while fetching messages");
      }
    },
    [token, baseUrl, socket]
  );

  // Send message
  const sendMessage = useCallback(
    async (conversationId, content, messageType = "text", attachments = []) => {
      if (!token || !conversationId || !content.trim()) return;

      try {
        const res = await fetch(
          `${baseUrl}/messages/conversations/${conversationId}/messages`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              content: content.trim(),
              messageType,
              attachments,
            }),
          }
        );
        const data = await res.json();

        if (res.ok) {
          // Update conversation list immediately (optimistic update)
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId
                ? { ...conv, lastMessage: content.trim(), lastMessageAt: "now" }
                : conv
            )
          );

          // The socket event will handle adding the message to the messages state
        } else {
          message.error(data.message || "Failed to send message");
        }
      } catch (err) {
        console.error("Send message error:", err);
        message.error("Network error while sending message");
      }
    },
    [token, baseUrl]
  );

  // Create new conversation
  const createConversation = useCallback(
    async (participantId, bookingId = null, title = null) => {
      if (!token || !participantId) return null;

      try {
        const res = await fetch(`${baseUrl}/messages/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participantId, bookingId, title }),
        });
        const data = await res.json();


        console.log(data,"datadata")

        if (res.ok) {
          const conv = data.conversation;
          const otherParticipant = conv.participants.find(
            (p) => p._id != user._id
          );



          console.log(otherParticipant,"otherParticipant")
          const newConversation = {
            id: conv._id,
            title:
              conv.title ||
              (otherParticipant
                ? `${otherParticipant.firstName} ${otherParticipant.lastName}`
                : "Unknown User"),
            avatarUrl: otherParticipant?.profileImage,
            lastMessage: "",
            lastMessageAt: "",
            unreadCount: 0,
            participants: conv.participants,
            booking: conv.booking,
            otherParticipant,
          };

          // Check if conversation already exists in list
          const existingIndex = conversations.findIndex(
            (c) => c.id === newConversation.id
          );
          if (existingIndex >= 0) {
            setActiveConversationAndFetch(conversations[existingIndex]);
            return conversations[existingIndex];
          } else {
            setConversations((prev) => [newConversation, ...prev]);
            setActiveConversationAndFetch(newConversation);
            return newConversation;
          }
        } else {
          message.error(data.message || "Failed to create conversation");
          return null;
        }
      } catch (err) {
        console.error("Create conversation error:", err);
        message.error("Network error while creating conversation");
        return null;
      }
    },
    [token, baseUrl, user, conversations]
  );

  // Mark messages as read
  const markAsRead = useCallback(
    async (conversationId) => {
      if (!token || !conversationId) return;

      try {
        const res = await fetch(
          `${baseUrl}/messages/conversations/${conversationId}/read`,
          {
            method: "PATCH",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.ok) {
          // Update conversation unread count to 0
          setConversations((prev) =>
            prev.map((conv) =>
              conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
            )
          );
          fetchUnreadCount();
        }
      } catch (err) {
        console.error("Mark as read error:", err);
      }
    },
    [token, baseUrl]
  );

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
  const setActiveConversationAndFetch = useCallback(
    (conversation) => {

      console.log(conversation,"conversationconversation")
      setActiveConversation(conversation);
      if (conversation) {
        fetchMessages(conversation.id);
        markAsRead(conversation.id); // This will reset unread count for this conversation
      }
    },
    [fetchMessages, markAsRead]
  );


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
    
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};