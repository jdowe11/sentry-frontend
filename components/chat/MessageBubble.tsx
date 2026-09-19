"use client";

import React, { useState, useRef, useEffect } from "react";
import { MessageResponse } from "@/api/ChatApi";
import Avatar from "@/components/ui/Avatar";
import { ChevronsDown, ChevronsUp } from "lucide-react";
import { cn } from "@/utils/cn";

interface MessageBubbleProps {
  message: MessageResponse;
  isCurrentUser: boolean;
  showSenderHeader?: boolean;
}

export default function MessageBubble({
  message,
  isCurrentUser,
  showSenderHeader = true,
}: MessageBubbleProps) {
  const [isOverflowing, setIsOverflowing] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const formatTime = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
    } catch {
      return "";
    }
  };

  const senderName =
    message.sender?.displayName ||
    message.sender?.username ||
    (isCurrentUser ? "You" : `User #${message.senderId}`);

  // Check if content exceeds height threshold (200px)
  useEffect(() => {
    const el = contentRef.current;
    if (el) {
      if (el.scrollHeight > 200) {
        setIsOverflowing(true);
      }
    }
  }, [message.ciphertext]);

  return (
    <div
      className={cn(
        "flex w-full gap-3 select-text min-w-0 group",
        isCurrentUser ? "justify-end" : "justify-start",
        showSenderHeader ? "mt-4" : "mt-2"
      )}
    >
      {/* Avatar for incoming messages */}
      {!isCurrentUser && (
        <div className="shrink-0 w-8">
          {showSenderHeader ? (
            <Avatar fallback={senderName} size="sm" />
          ) : (
            <div className="w-8" />
          )}
        </div>
      )}

      {/* Message content column */}
      <div
        className={cn(
          "flex flex-col min-w-0 max-w-[75%]",
          isCurrentUser ? "items-end" : "items-start"
        )}
      >
        {/* Sender Name & Timestamp Header */}
        {showSenderHeader && (
          <div
            className={cn(
              "flex items-center gap-2 mb-1 px-1 text-xs",
              isCurrentUser ? "flex-row-reverse" : "flex-row"
            )}
          >
            <span className="font-semibold text-foreground truncate max-w-[180px]">
              {isCurrentUser ? "You" : senderName}
            </span>
            <span className="text-muted-foreground font-mono text-xs">
              {formatTime(message.createdAt)}
            </span>
          </div>
        )}

        {/* Bubble Box */}
        <div
          className={cn(
            "rounded-2xl text-[15px] leading-relaxed whitespace-pre-wrap break-words [overflow-wrap:anywhere] [word-break:break-word] max-w-full shadow-xs select-text relative px-4 pt-3 pb-2.5",
            isCurrentUser
              ? "bg-primary text-white rounded-br-xs"
              : "bg-card border border-border text-foreground rounded-bl-xs"
          )}
        >
          {/* Collapsible text body */}
          <div
            ref={contentRef}
            className={cn(
              "relative",
              isOverflowing && !isExpanded ? "max-h-[180px] overflow-hidden" : ""
            )}
          >
            {message.ciphertext}

            {/* Gradient fade overlay when collapsed */}
            {isOverflowing && !isExpanded && (
              <div
                className={cn(
                  "absolute inset-x-0 bottom-0 h-16 pointer-events-none",
                  isCurrentUser
                    ? "bg-gradient-to-t from-primary via-primary/80 to-transparent"
                    : "bg-gradient-to-t from-card via-card/85 to-transparent"
                )}
              />
            )}
          </div>

          {/* Centered Double-Arrow Toggle in stable layout position */}
          {isOverflowing && (
            <div
              className={cn(
                "flex items-center justify-center pt-2 mt-1.5 select-none",
                isCurrentUser ? "border-t border-white/20" : "border-t border-border/70"
              )}
            >
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className={cn(
                  "p-1.5 rounded-full transition-all duration-150 cursor-pointer select-none flex items-center justify-center hover:scale-110 active:scale-95",
                  isCurrentUser
                    ? "bg-white/20 hover:bg-white/30 text-white border border-white/25"
                    : "bg-secondary hover:bg-secondary-foreground/10 text-foreground border border-border"
                )}
                title={isExpanded ? "Collapse message" : "Expand message"}
                aria-label={isExpanded ? "Collapse message" : "Expand message"}
              >
                {isExpanded ? (
                  <ChevronsUp className="w-4 h-4 stroke-[2.5]" />
                ) : (
                  <ChevronsDown className="w-4 h-4 stroke-[2.5]" />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
