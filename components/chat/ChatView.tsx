"use client";

import React, { useEffect, useMemo } from "react";
import { useAuth, useChat } from "@/store/hooks";
import { ChatResponse } from "@/api/ChatApi";
import { useChatWebSocket } from "@/hooks/useChatWebSocket";
import MessageList from "@/components/chat/MessageList";
import MessageComposer from "@/components/chat/MessageComposer";
import Avatar from "@/components/ui/Avatar";

interface ChatViewProps {
  chat: ChatResponse;
}

export default function ChatView({ chat }: ChatViewProps) {
  const { user } = useAuth();
  const {
    activeMessages,
    isLoadingMessages,
    isSending,
    fetchChatMessages,
    sendChatMessage,
  } = useChat();

  // Subscribe to real-time WebSocket events for this chat
  useChatWebSocket(chat.id);

  // Load message history on chat switch
  useEffect(() => {
    if (chat.id) {
      fetchChatMessages(chat.id).catch((err) => {
        console.error("Failed to load chat messages:", err);
      });
    }
  }, [chat.id, fetchChatMessages]);

  // Identify the other participant in this 1-on-1 chat
  const partner = useMemo(() => {
    if (!user) return null;
    return (
      chat.participants.find((p) => p.id !== user.id) ||
      chat.participants[0] ||
      null
    );
  }, [chat.participants, user]);

  const partnerDisplayName =
    partner?.displayName || partner?.username || `Chat #${chat.id}`;
  const partnerUsername = partner?.username;

  const handleSendMessage = async (text: string) => {
    try {
      await sendChatMessage(chat.id, text);
    } catch (err) {
      console.error("Failed to send message:", err);
      alert("Failed to send message. Please try again.");
      throw err;
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background">
      {/* 1. Chat Header */}
      <header className="h-16 bg-card/60 backdrop-blur-md border-b border-border px-5 sm:px-6 flex items-center justify-between shrink-0 select-none z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <Avatar
            fallback={partnerDisplayName}
            size="md"
            status="online"
          />
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-foreground truncate">
                {partnerDisplayName}
              </h2>
              {partnerUsername && (
                <span className="text-xs text-muted-foreground font-mono truncate hidden sm:inline">
                  @{partnerUsername}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span className="text-xs text-muted-foreground font-medium">
                Online
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. Message History Stream */}
      <MessageList
        key={chat.id}
        messages={activeMessages}
        currentUserId={user.id}
        partnerName={partnerDisplayName}
        partnerUsername={partnerUsername}
        isLoading={isLoadingMessages}
      />

      {/* 3. Message Composer */}
      <MessageComposer
        onSendMessage={handleSendMessage}
        partnerName={partnerDisplayName}
        isSending={isSending}
      />
    </div>
  );
}
