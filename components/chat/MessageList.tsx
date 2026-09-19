"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { MessageResponse } from "@/api/ChatApi";
import MessageBubble from "@/components/chat/MessageBubble";
import Avatar from "@/components/ui/Avatar";
import { Loader2, ArrowDown } from "lucide-react";

interface MessageListProps {
  messages: MessageResponse[];
  currentUserId: number;
  partnerName: string;
  partnerUsername?: string;
  isLoading: boolean;
}

function formatDateDivider(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();

    const isToday =
      date.getDate() === now.getDate() &&
      date.getMonth() === now.getMonth() &&
      date.getFullYear() === now.getFullYear();

    if (isToday) return "Today";

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      date.getDate() === yesterday.getDate() &&
      date.getMonth() === yesterday.getMonth() &&
      date.getFullYear() === yesterday.getFullYear();

    if (isYesterday) return "Yesterday";

    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
    });
  } catch {
    return dateStr;
  }
}

function isSameDay(d1Str: string, d2Str: string): boolean {
  try {
    const d1 = new Date(d1Str);
    const d2 = new Date(d2Str);
    return (
      d1.getFullYear() === d2.getFullYear() &&
      d1.getMonth() === d2.getMonth() &&
      d1.getDate() === d2.getDate()
    );
  } catch {
    return false;
  }
}

function shouldGroupWithPrevious(
  current: MessageResponse,
  prev?: MessageResponse
): boolean {
  if (!prev) return false;
  if (current.senderId !== prev.senderId) return false;

  try {
    const t1 = new Date(current.createdAt).getTime();
    const t2 = new Date(prev.createdAt).getTime();
    // Group if sent within 3 minutes
    return t1 - t2 < 3 * 60 * 1000;
  } catch {
    return false;
  }
}

export default function MessageList({
  messages,
  currentUserId,
  partnerName,
  partnerUsername,
  isLoading,
}: MessageListProps) {
  const scrollEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const prevMessagesCount = useRef(messages.length);

  // Detect scroll position to display the scroll-to-bottom arrow
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el || messages.length === 0 || isLoading) return;
    const distanceToBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceToBottom > 35);
  }, [messages.length, isLoading]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    el.addEventListener("scroll", handleScroll, { passive: true });
    return () => el.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  const snapToBottom = useCallback(() => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: "instant" as ScrollBehavior });
    }
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, []);

  const scrollToBottom = () => {
    if (scrollEndRef.current) {
      scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
    } else if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  };

  // Always default directly to the bottom on chat open or message load
  useEffect(() => {
    if (isLoading || messages.length === 0) return;

    if (messages.length > prevMessagesCount.current) {
      // Live incoming/sent message
      const el = containerRef.current;
      const wasNearBottom = el ? el.scrollHeight - el.scrollTop - el.clientHeight <= 90 : true;
      if (wasNearBottom && scrollEndRef.current) {
        scrollEndRef.current.scrollIntoView({ behavior: "smooth" });
      }
    } else {
      // Initial load / chat switch: instant snap to bottom
      snapToBottom();
      const raf = requestAnimationFrame(() => {
        snapToBottom();
        setShowScrollBottom(false);
      });
      return () => cancelAnimationFrame(raf);
    }
    prevMessagesCount.current = messages.length;
  }, [messages.length, isLoading, snapToBottom]);

  return (
    <div className="relative flex-1 flex flex-col min-h-0 overflow-hidden">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 flex flex-col justify-start"
      >
        {/* Loading indicator */}
        {isLoading && messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-2.5 text-muted-foreground text-sm">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <span>Loading messages...</span>
            </div>
          </div>
        ) : messages.length === 0 ? (
          /* Empty Chat State */
          <div className="flex-1 flex flex-col items-center justify-center text-center py-16 px-4 select-none animate-in fade-in duration-200">
            <div className="mb-4">
              <Avatar
                fallback={partnerName}
                size="xl"
                status="online"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-foreground">
              {partnerName}
            </h2>
            {partnerUsername && (
              <p className="text-sm font-mono text-muted-foreground mt-1">
                @{partnerUsername}
              </p>
            )}
            <p className="text-sm text-muted-foreground max-w-md mt-3 leading-relaxed">
              This is the start of your direct conversation with <span className="font-semibold text-foreground">{partnerName}</span>. Send a message below to start chatting.
            </p>
          </div>
        ) : (
          /* Render Message History */
          <div className="flex flex-col min-h-0 w-full overflow-x-hidden min-w-0">
            {/* Conversation Beginning Banner */}
            <div className="flex flex-col items-start gap-1 pb-6 pt-2 select-none border-b border-border/40 mb-4">
              <Avatar fallback={partnerName} size="lg" />
              <h3 className="text-lg font-bold text-foreground mt-3">
                {partnerName}
              </h3>
              {partnerUsername && (
                <p className="text-sm font-mono text-muted-foreground">
                  @{partnerUsername}
                </p>
              )}
              <p className="text-sm text-muted-foreground mt-1">
                This is the beginning of your direct message history with {partnerName}.
              </p>
            </div>

            {messages.map((msg, index) => {
              const prevMsg = index > 0 ? messages[index - 1] : undefined;
              const showDateDivider =
                !prevMsg || !isSameDay(msg.createdAt, prevMsg.createdAt);
              const isCurrentUser = msg.senderId === currentUserId;
              const isGrouped = shouldGroupWithPrevious(msg, prevMsg);

              return (
                <React.Fragment key={msg.id || `${msg.senderId}-${index}`}>
                  {showDateDivider && (
                    <div className="relative flex items-center justify-center my-5 select-none">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-border/60" />
                      </div>
                      <span className="relative bg-background px-3.5 py-0.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider rounded-full border border-border/70 shadow-2xs">
                        {formatDateDivider(msg.createdAt)}
                      </span>
                    </div>
                  )}
                  <MessageBubble
                    message={msg}
                    isCurrentUser={isCurrentUser}
                    showSenderHeader={!isGrouped || showDateDivider}
                  />
                </React.Fragment>
              );
            })}
            <div ref={scrollEndRef} className="h-2 shrink-0" />
          </div>
        )}
      </div>

      {/* Floating Green Arrow Button to Jump to Bottom */}
      <div
        className={`absolute bottom-5 left-1/2 -translate-x-1/2 z-40 transition-all duration-200 ${
          showScrollBottom
            ? "opacity-100 translate-y-0 pointer-events-auto scale-100"
            : "opacity-0 translate-y-3 pointer-events-none scale-90"
        }`}
      >
        <button
          type="button"
          onClick={scrollToBottom}
          className="w-10 h-10 rounded-full bg-emerald-500 hover:bg-emerald-600 active:scale-90 text-white shadow-xl shadow-emerald-500/40 border border-emerald-400/50 transition-all flex items-center justify-center cursor-pointer select-none group"
          title="Scroll to latest messages"
          aria-label="Scroll to latest messages"
        >
          <ArrowDown className="w-5 h-5 stroke-[2.5] group-hover:translate-y-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
}
