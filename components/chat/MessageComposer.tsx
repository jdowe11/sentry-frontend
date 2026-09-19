"use client";

import React, { useState, useRef, useEffect } from "react";
import { SendHorizontal, Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

interface MessageComposerProps {
  onSendMessage: (text: string) => Promise<void>;
  partnerName?: string;
  isSending: boolean;
  disabled?: boolean;
}

const MAX_MESSAGE_LENGTH = 1000;

export default function MessageComposer({
  onSendMessage,
  partnerName = "user",
  isSending,
  disabled = false,
}: MessageComposerProps) {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus input when active chat changes
  useEffect(() => {
    if (!disabled && !isSending) {
      textareaRef.current?.focus();
    }
  }, [partnerName, disabled, isSending]);

  // Dynamically calculate and adjust textarea height
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    const maxHeight = 160; // Max height in px before scrolling
    const newHeight = Math.min(textarea.scrollHeight, maxHeight);
    textarea.style.height = `${newHeight}px`;
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    adjustTextareaHeight();
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed || trimmed.length > MAX_MESSAGE_LENGTH || isSending || disabled) return;

    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }

    try {
      await onSendMessage(trimmed);
    } catch {
      // If send fails, restore the text so user doesn't lose it
      setText(trimmed);
      setTimeout(adjustTextareaHeight, 0);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const remainingChars = MAX_MESSAGE_LENGTH - text.length;
  const isNearLimit = text.length >= 400;

  return (
    <div className="p-3.5 sm:p-4 bg-card/70 backdrop-blur-md border-t border-border select-none shrink-0">
      <form
        onSubmit={handleSubmit}
        className="flex items-end gap-2.5 bg-input border border-border focus-within:border-primary/80 focus-within:ring-1 focus-within:ring-primary/40 rounded-xl px-3.5 py-2 transition-all shadow-2xs"
      >
        <div className="flex-1 flex flex-col min-w-0">
          <textarea
            ref={textareaRef}
            rows={1}
            value={text}
            maxLength={MAX_MESSAGE_LENGTH}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            disabled={disabled || isSending}
            placeholder={`Message ${partnerName}... (Shift+Enter for newline)`}
            className="w-full bg-transparent text-sm sm:text-[15px] text-foreground placeholder:text-muted-foreground/60 outline-none focus:outline-none py-1 resize-none max-h-40 overflow-y-auto leading-relaxed disabled:opacity-50"
          />
          {isNearLimit && (
            <div className="flex justify-end pr-1 pt-0.5">
              <span
                className={cn(
                  "text-[10px] font-mono",
                  remainingChars <= 20
                    ? "text-destructive font-bold"
                    : "text-muted-foreground"
                )}
              >
                {remainingChars} left
              </span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!text.trim() || text.length > MAX_MESSAGE_LENGTH || isSending || disabled}
          className={cn(
            "p-2.5 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer outline-none focus:outline-none shrink-0 mb-0.5",
            text.trim() && text.length <= MAX_MESSAGE_LENGTH && !isSending && !disabled
              ? "bg-primary text-white hover:bg-primary-hover shadow-xs active:scale-95"
              : "bg-secondary/60 text-muted-foreground/40 cursor-not-allowed"
          )}
          title="Send message (Enter)"
        >
          {isSending ? (
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <SendHorizontal className="w-4 h-4" />
          )}
        </button>
      </form>
    </div>
  );
}
