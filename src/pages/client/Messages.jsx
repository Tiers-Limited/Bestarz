import React, { useMemo, useState } from "react";
import { Input } from "antd";
import ClientLayout from "../../components/ClientLayout";
import ConversationList from "../../components/ConversationList";
import ChatWindow from "../../components/ChatWindow";

const mockConversations = [
  {
    id: "ClientMessages",
    title: "Bestraz ClientMessages",
    avatarUrl: undefined,
    lastMessage: "How can we help today?",
    lastMessageAt: "now",
    unreadCount: 0,
  },
  {
    id: "prov-123",
    title: "John's Plumbing",
    avatarUrl: undefined,
    lastMessage: "Your booking is confirmed",
    lastMessageAt: "2h",
    unreadCount: 2,
  },
];

const mockMessagesByConv = {
  ClientMessages: [
    {
      id: "m1",
      senderId: "agent",
      senderName: "ClientMessages Agent",
      text: "Hi! How can we help today?",
      timestamp: "Just now",
    },
  ],
  "prov-123": [
    {
      id: "m2",
      senderId: "prov-123",
      senderName: "John",
      text: "Your booking for Fri 10 AM is confirmed.",
      timestamp: "2h ago",
    },
  ],
};

const ClientMessages = () => {
  const currentUserId = "client-user";
  const [query, setQuery] = useState("");
  const [conversations, setConversations] = useState(mockConversations);
  const [active, setActive] = useState(conversations[0]);
  const [messagesByConv, setMessagesByConv] = useState(mockMessagesByConv);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter((c) => c.title.toLowerCase().includes(q));
  }, [query, conversations]);

  const messages = messagesByConv[active?.id] || [];

  const handleSend = (text) => {
    setMessagesByConv((prev) => ({
      ...prev,
      [active.id]: [
        ...(prev[active.id] || []),
        {
          id: `${active.id}-${Date.now()}`,
          senderId: currentUserId,
          senderName: "You",
          text,
          timestamp: new Date().toLocaleTimeString(),
        },
      ],
    }));
    setConversations((prev) =>
      prev.map((c) =>
        c.id === active.id
          ? { ...c, lastMessage: text, lastMessageAt: "now", unreadCount: 0 }
          : c
      )
    );
  };

  return (
    <ClientLayout>
      <div className="p-4 h-[calc(100vh-120px)]">
        <div className="h-full grid grid-cols-1 md:grid-cols-3 gap-4">
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
              activeId={active?.id}
              onSelect={(c) => setActive(c)}
            />
          </div>

          <div className="col-span-1 md:col-span-2 border border-[#222] rounded-lg overflow-hidden">
            {active ? (
              <ChatWindow
                header={{ title: active.title, subtitle: "Online", avatarUrl: active.avatarUrl }}
                messages={messages}
                currentUserId={currentUserId}
                onSend={handleSend}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400">
                Select a conversation
              </div>
            )}
          </div>
        </div>
      </div>
    </ClientLayout>
  );
};

export default ClientMessages;


