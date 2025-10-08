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

  // Function to enable notifications
  const enableNotifications = async () => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        try {
          const permission = await Notification.requestPermission();
          if (permission === "granted") {
            message.success("Notifications enabled! You'll receive message notifications.");
            // Test notification
            new Notification("Notifications enabled!", {
              body: "You'll now receive message notifications",
              icon: "/default-avatar.png",
            });
          } else if (permission === "denied") {
            message.warning("Notification permission denied. You can enable notifications in your browser settings.");
          } else {
            message.info("Notification permission dismissed.");
          }
          return permission;
        } catch (error) {
          console.error("Error requesting notification permission:", error);
          message.error("Failed to enable notifications.");
          return "error";
        }
      } else if (Notification.permission === "granted") {
        message.info("Notifications are already enabled.");
        return "granted";
      } else if (Notification.permission === "denied") {
        message.warning(
          "Notifications are blocked. To enable notifications: " +
          "1. Click the lock/tune icon next to the URL in your browser's address bar " +
          "2. Find notification settings and allow notifications for this site " +
          "3. Refresh the page and try again."
        );
        return "denied";
      }
    } else {
      message.warning("Notifications are not supported in this browser.");
      return "not-supported";
    }
  };

  // Initialize Socket.IO connection
  useEffect(() => {
    if (token && user) {
      const socketInstance = io(socketUrl, {
        auth: { token },
        transports: ["websocket", "polling"],
      });

      socketInstance.on("connect", async () => {
        console.log("🔌 Socket connected successfully");
        // Join user room for receiving conversation updates
        socketInstance.emit("join_user_room", user._id);
        
        // Request notification permission for message notifications
        if ("Notification" in window) {
          if (Notification.permission === "default") {
            try {
              const permission = await Notification.requestPermission();
              console.log("🔔 Notification permission:", permission);
              if (permission === "granted") {
                // Test notification to verify it's working
                new Notification("Notifications enabled!", {
                  body: "You'll now receive message notifications",
                  icon: "/default-avatar.png",
                });
              }
            } catch (error) {
              console.error("❌ Error requesting notification permission:", error);
            }
          } else if (Notification.permission === "denied") {
            console.log("🚫 Notification permission denied by user - not requesting again");
          } else {
            console.log("✅ Notification permission already granted");
          }
        } else {
          console.log("🚫 Notifications not supported in this browser");
        }
      });

      socketInstance.on("disconnect", () => {
        console.log("🔌 Socket disconnected");
      });

      socketInstance.on("connect_error", (error) => {
        console.error("🔌 Socket connection error:", error);
      });

      // 🔹 new_message - Handle incoming messages
      // socketInstance.on("new_message", (newMessage) => {
      //   console.log("Received new message:", newMessage);
      //   const conversationId = newMessage.conversation;
        
      //   setMessages((prev) => ({
      //     ...prev,
      //     [conversationId]: [
      //       ...(prev[conversationId] || []),
      //       formatMessage(newMessage),
      //     ],
      //   }));

      //   // Update conversation list
      //   if (newMessage.sender._id !== user._id) {
      //     setConversations((prev) =>
      //       prev.map((conv) =>
      //         conv.id === conversationId
      //           ? {
      //               ...conv,
      //               lastMessage: newMessage.content,
      //               lastMessageAt: formatTime(newMessage.createdAt),
      //               unreadCount:
      //                 conv.id === activeConversation?.id
      //                   ? 0 // Don't increment if this conversation is active
      //                   : conv.unreadCount + 1,
      //             }
      //           : conv
      //       )
      //     );
          
      //     // Only update total unread count if conversation is not active


      //     console.log(conversationId,activeConversation?.id,"NEWW");

      //     if (conversationId !== activeConversation?.id) {
      //       fetchUnreadCount();
      //     }
      //   }
      // });


      socketInstance.on("new_message", (newMessage) => {
        console.log("📨 Received new_message event:", newMessage);
        console.log("👤 Current user:", user._id);
        console.log("💬 Message sender:", newMessage.sender._id);
        console.log("🏠 Active conversation:", activeConversation?.id);
        const conversationId = newMessage.conversation;
        
        // Update messages in real-time for active conversation
        setMessages((prev) => ({
          ...prev,
          [conversationId]: [
            ...(prev[conversationId] || []),
            formatMessage(newMessage),
          ],
        }));
      
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
                        ? 0
                        : conv.unreadCount + 1,
                  }
                : conv
            )
          );
      
          if (conversationId !== activeConversation?.id) {
            fetchUnreadCount();
      
            // ✅ Show desktop notification with role context
            const senderRole = newMessage.sender.role || 'User';
            const roleText = senderRole === 'admin' ? 'Admin' : senderRole === 'provider' ? 'Provider' : 'Client';
            
            if ("Notification" in window) {
              if (Notification.permission === "granted") {
                try {
                  const notification = new Notification(`New message from ${roleText}: ${newMessage.sender.firstName || 'Unknown'}`, {
                    body: newMessage.content,
                    icon: newMessage.sender.profileImage || "/default-avatar.png",
                    tag: `message-${conversationId}`, // Prevents duplicate notifications
                    requireInteraction: false, // Auto-close after a few seconds
                    badge: "/favicon.ico", // Small icon for notification badge
                  });
                  
                  // Auto-close notification after 5 seconds
                  setTimeout(() => {
                    notification.close();
                  }, 5000);
                  
                  console.log("Desktop notification shown for message");
                  // Add click handler to open conversation
                  notification.onclick = () => {
                    window.focus();
                    // Navigate to messages page based on user role
                    const messageRoute = user.role === 'admin' ? '/admin/messages' : 
                                       user.role === 'provider' ? '/provider/messages' : 
                                       '/client/messages';
                    window.location.href = messageRoute;
                  };
                  
                  // Play notification sound (if supported)
                  try {
                    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSmN1fLNeSsFIXjK8N2OPwkWYbjq66NSDw1MpePtx2gebjyQ1fLNeSsFInfJ8N+OPQkUYLjq6qNTEg1JpOLxwmgeByeN1/LNeSsFInfJ8N2QQAoUXrTp66hVFAlFn+HyvmwhBymM1fLNeSsFInfI8N+OPQkUYLjq6qJUFAxFnOLywmgeAByhzPS9cCIEB1CH1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyvmwhByeM1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFInnI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFIXnI8N6QPQkUXrXp66hWFAlGnOHyv2whBSaM1fLNeSsFIXjI8N6PPwkUXrPp66hVFAlGneDyv2seByaL1fHNeSsFIXjI8N+OQAkUXrPp66hWFAlGneDyv2whBSWM1fLNeSsFIXnI8N+OQAkUXrTp66hWFAlGneDyvmwhBSaM1fLNeSsFIXjI8N+OQAoUXrTp66hWFAlGneDyvmwhBSWM1fLNeSsFIXnI8N+OQAoUXrTp66hWFAlGneDywG0gBiWM1fLMeSsFInfJ8N+OQAkUYLXq66dWFAlGnODyv2whBSaM1fLNeSsFInbJ8N6QQAoUXrTp66hWFAlGneDyv2whBSaM1vLNeSsFInbH8N6QQAkUYLTm66hWFQxGneLyv2whBCaM1/PNCS4E');
                    audio.volume = 0.3;
                    audio.play().catch(e => console.log('Could not play notification sound'));
                  } catch (e) {
                    console.log('Notification sound not supported');
                  }
                  
                } catch (error) {
                  console.error("Error showing notification:", error);
                  // Fallback to in-app notification with sound
                  message.info(`💬 New message from ${roleText}: ${newMessage.sender.firstName || 'Unknown'}`);
                  // Play sound even if desktop notification fails
                  try {
                    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSmN1fLNeSsFIXjK8N2OPwkWYbjq66NSDw1MpePtx2gebjyQ1fLNeSsFInfJ8N+OPQkUYLjq6qNTEg1JpOLxwmgeByeN1/LNeSsFInfJ8N2QQAoUXrTp66hVFAlFn+HyvmwhBymM1fLNeSsFInfI8N+OPQkUYLjq6qJUFAxFnOLywmgeAByhzPS9cCIEB1CH1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyvmwhByeM1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFInnI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFIXnI8N6QPQkUXrXp66hWFAlGnOHyv2whBSaM1fLNeSsFIXjI8N6PPwkUXrPp66hVFAlGneDyv2seByaL1fHNeSsFIXjI8N+OQAkUXrPp66hWFAlGneDyv2whBSWM1fLNeSsFIXnI8N+OQAkUXrTp66hWFAlGneDyvmwhBSaM1fLNeSsFIXjI8N+OQAoUXrTp66hWFAlGneDyvmwhBSWM1fLNeSsFIXnI8N+OQAoUXrTp66hWFAlGneDywG0gBiWM1fLMeSsFInfJ8N+OQAkUYLXq66dWFAlGnODyv2whBSaM1fLNeSsFInbJ8N6QQAoUXrTp66hWFAlGneDyv2whBSaM1vLNeSsFInbH8N6QQAkUYLTm66hWFQxGneLyv2whBCaM1/PNCS4E');
                    audio.volume = 0.3;
                    audio.play().catch(e => console.log('Could not play notification sound'));
                  } catch (e) {
                    console.log('Notification sound not supported');
                  }
                }
              } else {
                console.log("Notification permission not granted:", Notification.permission);
                // Fallback to in-app notification - more prominent when browser notifications are blocked
                message.info({
                  content: `💬 New message from ${roleText}: ${newMessage.sender.firstName || 'Unknown'}`,
                  duration: 5,
                  style: {
                    marginTop: '60px', // Push below header
                  },
                });
                // Play notification sound for in-app notifications too
                try {
                  const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSmN1fLNeSsFIXjK8N2OPwkWYbjq66NSDw1MpePtx2gebjyQ1fLNeSsFInfJ8N+OPQkUYLjq6qNTEg1JpOLxwmgeByeN1/LNeSsFInfJ8N2QQAoUXrTp66hVFAlFn+HyvmwhBymM1fLNeSsFInfI8N+OPQkUYLjq6qJUFAxFnOLywmgeAByhzPS9cCIEB1CH1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyvmwhByeM1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFInnI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFIXnI8N6QPQkUXrXp66hWFAlGnOHyv2whBSaM1fLNeSsFIXjI8N6PPwkUXrPp66hVFAlGneDyv2seByaL1fHNeSsFIXjI8N+OQAkUXrPp66hWFAlGneDyv2whBSWM1fLNeSsFIXnI8N+OQAkUXrTp66hWFAlGneDyvmwhBSaM1fLNeSsFIXjI8N+OQAoUXrTp66hWFAlGneDyvmwhBSWM1fLNeSsFIXnI8N+OQAoUXrTp66hWFAlGneDywG0gBiWM1fLMeSsFInfJ8N+OQAkUYLXq66dWFAlGnODyv2whBSaM1fLNeSsFInbJ8N6QQAoUXrTp66hWFAlGneDyv2whBSaM1vLNeSsFInbH8N6QQAkUYLTm66hWFQxGneLyv2whBCaM1/PNCS4E');
                  audio.volume = 0.3;
                  audio.play().catch(e => console.log('Could not play notification sound'));
                } catch (e) {
                  console.log('Notification sound not supported');
                }
              }
            } else {
              console.log("Notifications not supported in this browser");
              // Fallback to in-app notification
              message.info({
                content: `💬 New message from ${roleText}: ${newMessage.sender.firstName || 'Unknown'}`,
                duration: 5,
                style: {
                  marginTop: '60px', // Push below header
                },
              });
              // Play notification sound for in-app notifications too
              try {
                const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSmN1fLNeSsFIXjK8N2OPwkWYbjq66NSDw1MpePtx2gebjyQ1fLNeSsFInfJ8N+OPQkUYLjq6qNTEg1JpOLxwmgeByeN1/LNeSsFInfJ8N2QQAoUXrTp66hVFAlFn+HyvmwhBymM1fLNeSsFInfI8N+OPQkUYLjq6qJUFAxFnOLywmgeAByhzPS9cCIEB1CH1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyvmwhByeM1fLNeSsFInfI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFInnI8N6QPQkUXrXp66hWFAlFnOHyv2whBSaM1fLNeSsFIXnI8N6QPQkUXrXp66hWFAlGnOHyv2whBSaM1fLNeSsFIXjI8N6PPwkUXrPp66hVFAlGneDyv2seByaL1fHNeSsFIXjI8N+OQAkUXrPp66hWFAlGneDyv2whBSWM1fLNeSsFIXnI8N+OQAkUXrTp66hWFAlGneDyvmwhBSaM1fLNeSsFIXjI8N+OQAoUXrTp66hWFAlGneDyvmwhBSWM1fLNeSsFIXnI8N+OQAoUXrTp66hWFAlGneDywG0gBiWM1fLMeSsFInfJ8N+OQAkUYLXq66dWFAlGnODyv2whBSaM1fLNeSsFInbJ8N6QQAoUXrTp66hWFAlGneDyv2whBSaM1vLNeSsFInbH8N6QQAkUYLTm66hWFQxGneLyv2whBCaM1/PNCS4E');
                audio.volume = 0.3;
                audio.play().catch(e => console.log('Could not play notification sound'));
              } catch (e) {
                console.log('Notification sound not supported');
              }
            }
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
          title: otherParticipant && otherParticipant.firstName && otherParticipant.lastName
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
    senderName: msg.sender?.firstName && msg.sender?.lastName 
      ? `${msg.sender.firstName} ${msg.sender.lastName}` 
      : 'Unknown User',
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
              title: otherParticipant && otherParticipant.firstName && otherParticipant.lastName
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
    async (participantId = null, bookingId = null, title = null, withAdmin = false) => {
      // Must have token, and either participantId or withAdmin flag
      if (!token || (!participantId && !withAdmin)) return null;
  
      try {
        const res = await fetch(`${baseUrl}/messages/conversations`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ participantId, bookingId, title, withAdmin }),
        });
        const data = await res.json();
  
        console.log(data, "datadata");
  
        if (res.ok) {
          const conv = data.conversation;
          const otherParticipant = conv.participants.find((p) => p._id !== user._id);
  
          console.log(otherParticipant, "otherParticipant");
  
          const newConversation = {
            id: conv._id,
            title:
              conv.title ||
              (otherParticipant && otherParticipant.firstName && otherParticipant.lastName
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
  
          const existingIndex = conversations.findIndex((c) => c.id === newConversation.id);
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
    enableNotifications,
    
  };

  return (
    <MessageContext.Provider value={value}>{children}</MessageContext.Provider>
  );
};