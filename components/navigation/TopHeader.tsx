"use client";

import { usePathname } from "next/navigation";
import { ShieldCheck, Search, Users, MessageSquare, Settings } from "lucide-react";
import Badge from "@/components/ui/Badge";

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
      icon: <MessageSquare className="w-4 h-4 text-primary" />,
      subtitle: "End-to-End Encrypted Session",
    };
  };

  const headerInfo = getHeaderInfo();

  return (
    <header className="h-14 bg-card/60 backdrop-blur-md border-b border-border px-6 flex items-center justify-between shrink-0 select-none z-20">
      {/* Left: View Title & Icon */}
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center">
          {headerInfo.icon}
        </div>
        <div className="flex flex-col">
          <h1 className="text-sm font-semibold text-foreground tracking-tight leading-none">
            {headerInfo.title}
          </h1>
          <span className="text-[11px] text-muted-foreground mt-0.5">
            {headerInfo.subtitle}
          </span>
        </div>
      </div>
    </header>
  );
}
