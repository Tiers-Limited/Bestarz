import React, { useMemo, useState, useEffect } from "react";
import { Input, Spin } from "antd";
import AdminLayout from "../../components/AdminLayout";
import ConversationList from "../../components/ConversationList";
import ChatWindow from "../../components/ChatWindow";
import { useMessage } from "../../context/messages/MessageContext";
import { useAuth } from "../../context/AuthContext";

const AdminMessages = () => {
  const { user } = useAuth();

  console.log(user,"useruseruseruserAdmin")
  const {
    conversations,
    activeConversation,
    messages,
    loading,
    sendMessage,
    setActiveConversation,
  } = useMessage();
  

  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [query, conversations]);

  const handleSend = (text) => {
    if (activeConversation && text.trim()) {
      sendMessage(activeConversation.id, text);
    }
  };



  if (loading && conversations.length === 0) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)]">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="p-4 h-[calc(100vh-120px)]">
        <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Conversations List */}
          <div className="col-span-1 border border-[#222] rounded-lg overflow-hidden flex flex-col">
            <div className="p-3 border-b border-[#222]">
              <Input.Search
                placeholder="Search conversations"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                allowClear
              />
            </div>
            <ConversationList
              conversations={filtered}
              activeId={activeConversation?.id}
              onSelect={setActiveConversation}
            />
          </div>

          {/* Chat Window */}
          <div className="col-span-1 md:col-span-2 border border-[#222] rounded-lg overflow-hidden">
            {activeConversation ? (
              <ChatWindow
                header={{ 
                  title: activeConversation.title, 
                  subtitle: "Online", 
                  avatarUrl: activeConversation.avatarUrl 
                }}
                messages={messages}
                currentUserId={user?.id}
                onSend={handleSend}
                
                loading={loading}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                {conversations.length === 0 ? (
                  <div className="text-center">
                    <p className="text-lg mb-2">No conversations yet</p>
                    <p className="text-sm">Start a conversation with a provider</p>
                  </div>
                ) : (
                  "Select a conversation"
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminMessages;