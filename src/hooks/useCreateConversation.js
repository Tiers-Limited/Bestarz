// hooks/useCreateConversation.js
import { useNavigate } from "react-router-dom";
import { useMessage } from "../context/messages/MessageContext";
import { message as antMessage } from "antd";

export const useCreateConversation = () => {
  const { createConversation, setActiveConversation } = useMessage();

  const navigate=useNavigate();

  const createAndNavigateToConversation = async (participantId, bookingId = null, title = null) => {
    try {
      const conversation = await createConversation(participantId, bookingId, title);
      if (conversation) {
        setActiveConversation(conversation);
        antMessage.success("Conversation started successfully");

        navigate('/client/messages')
        return conversation;
      }
      return null;
    } catch (error) {
      console.error("Error creating conversation:", error);
      antMessage.error("Failed to start conversation");
      return null;
    }
  };

  return { createAndNavigateToConversation };
};