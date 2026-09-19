"use client";

import { usePathname } from "next/navigation";
import { Users, MessageSquare, Settings } from "lucide-react";

export default function TopHeader() {
  const pathname = usePathname();

  const getHeaderInfo = () => {
    if (pathname.startsWith("/friends")) {
      return {
        title: "Friends",
        icon: <Users className="w-4 h-4 text-primary" />,
        subtitle: "Manage connections & friend requests",
      };
    }
    if (pathname.startsWith("/profile")) {
      return {
        title: "Account Settings",
        icon: <Settings className="w-4 h-4 text-primary" />,
        subtitle: "Profile details & preferences",
      };
    }
    return {
      title: "Direct Messages",
      icon: <MessageSquare className="w-5 h-5 text-primary" />,
      subtitle: "End-to-End Encrypted Session",
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <header className="h-16 bg-card/60 backdrop-blur-md border-b border-border px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: View Title & Icon */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center">
          {headerInfo.icon}
        </div>
        <div className="flex flex-col">
          <h1 className="text-base font-semibold text-foreground tracking-tight leading-none">
            {headerInfo.title}
          </h1>
          <span className="text-xs text-muted-foreground mt-1">
            {headerInfo.subtitle}
          </span>
        </div>
      </div>
    </header>
  );
}
