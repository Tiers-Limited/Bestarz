// hooks/useCreateConversation.js
import { useNavigate } from "react-router-dom";
import { useMessage } from "../context/messages/MessageContext";
import { message as antMessage } from "antd";
import { useAuth } from "../context/AuthContext";

export const useCreateConversation = () => {
  const { createConversation, setActiveConversation } = useMessage();

  const navigate = useNavigate();

  const { user } = useAuth();

  const createAndNavigateToConversation = async (participantId, bookingId = null, title = null) => {
    try {
      const conversation = await createConversation(participantId, bookingId, title);
      if (conversation) {
        setActiveConversation(conversation);
        antMessage.success("Conversation started successfully");



        navigate('/client/messages')

        if (user.role == "client") {
          navigate('/client/messages')
        }

        if (user.role == "provider") {
          navigate('/provider/messages')
        }
        if (user.role == "admin") {
          navigate('/admin/messages')
        }
        return conversation;
      }
      return null;
    } catch (error) {
      console.error("Error creating conversation:", error);
      antMessage.error("Failed to start conversation");
      return null;
    }
  };


  const createAndNavigateToAdminConversation = async () => {
    try {
      const conversation = await createConversation(null, null, "Admin Support", true);


      if (conversation) {
        setActiveConversation(conversation);
        antMessage.success("Conversation with admin started successfully");
        if (user.role == "client") {
          navigate('/client/messages')
        }

        if (user.role == "provider") {
          navigate('/provider/messages')
        }
        if (user.role == "admin") {
          navigate('/admin/messages')
        }
        return conversation;
      }
      return null;
    } catch (error) {
      console.error("Error creating admin conversation:", error);
      antMessage.error("Failed to start conversation with admin");
      return null;
    }
  };

  return { createAndNavigateToConversation, createAndNavigateToAdminConversation };
};