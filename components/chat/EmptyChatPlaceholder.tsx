"use client";

import React from "react";
import { MessageSquare, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";

export default function EmptyChatPlaceholder() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center p-6 select-none animate-in fade-in duration-200">
      <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
        <MessageSquare className="w-7 h-7 text-primary" />
      </div>

      <h2 className="text-xl font-bold text-foreground">
        No conversation selected
      </h2>
      <p className="text-sm text-muted-foreground mt-2 max-w-sm leading-relaxed">
        Choose a direct message from the sidebar to continue chatting, or start a new conversation with a friend.
      </p>

      <div className="flex items-center gap-3 mt-6">
        <Button
          variant="primary"
          size="md"
          onClick={() => router.push("/friends")}
          icon={<Users className="w-4 h-4" />}
        >
          Find Friends
        </Button>
      </div>
    </div>
  );
}
