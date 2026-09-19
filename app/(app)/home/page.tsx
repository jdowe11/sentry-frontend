"use client";

import { useAuth, useChat } from "@/store/hooks";
import AuthenticatedView from "@/components/AuthenticatedView";
import ChatView from "@/components/chat/ChatView";

export default function HomePage() {
  const { user } = useAuth();
  const { activeChat } = useChat();

  if (!user) return null;

  if (activeChat) {
    return <ChatView chat={activeChat} />;
  }

  return <AuthenticatedView />;
}
