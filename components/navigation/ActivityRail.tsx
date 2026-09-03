"use client";

import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MessageSquare,
  Users,
  Settings,
  LogOut,
} from "lucide-react";
import Tooltip from "@/components/ui/Tooltip";
import Avatar from "@/components/ui/Avatar";
import { useAuth } from "@/store/hooks";
import { cn } from "@/utils/cn";

interface ActivityRailProps {
  pendingCount?: number;
}

export default function ActivityRail({ pendingCount = 0 }: ActivityRailProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const isDMsActive = pathname.startsWith("/home") || pathname.startsWith("/channels");
  const isFriendsActive = pathname.startsWith("/friends");
  const isProfileActive = pathname.startsWith("/profile");

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside className="w-16 h-screen bg-sidebar-rail border-r border-border/80 flex flex-col items-center justify-between py-3 shrink-0 select-none z-30">
      {/* Top: Brand Logo & Primary Navigation */}
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Sentry Rook / Logo */}
        <Tooltip content="Sentry Navbar" side="right">
          <button
            onClick={() => router.push("/home")}
            className="w-11 h-11 rounded-xl bg-card border border-border/90 flex items-center justify-center hover:border-primary/60 hover:shadow-md hover:shadow-primary/10 transition-colors duration-150 cursor-pointer group outline-none focus:outline-none"
          >
            <Image
              src="/logo.png"
              alt="Sentry"
              width={40}
              height={40}
              className="object-contain group-hover:scale-105 transition-transform"
            />
          </button>
        </Tooltip>

        <div className="w-8 h-[1px] bg-border my-1" />

        {/* Navigation Items */}
        <div className="flex flex-col items-center gap-2 w-full">
          {/* Direct Messages / Conversations */}
          <Tooltip content="Direct Messages" side="right">
            <div className="relative flex items-center justify-center w-full">
              {isDMsActive && (
                <span className="absolute left-0 w-1 h-7 bg-primary rounded-r-full" />
              )}
              <button
                onClick={() => router.push("/home")}
                className={cn(
                  "w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-150 cursor-pointer outline-none focus:outline-none",
                  isDMsActive
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <MessageSquare className="w-5 h-5" />
              </button>
            </div>
          </Tooltip>

          {/* Friends */}
          <Tooltip content="Friends" side="right">
            <div className="relative flex items-center justify-center w-full">
              {isFriendsActive && (
                <span className="absolute left-0 w-1 h-7 bg-primary rounded-r-full" />
              )}
              <button
                onClick={() => router.push("/friends")}
                className={cn(
                  "relative w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-150 cursor-pointer outline-none focus:outline-none",
                  isFriendsActive
                    ? "bg-primary text-white shadow-sm shadow-primary/30"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                )}
              >
                <Users className="w-5 h-5" />
                {pendingCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-destructive text-white text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {pendingCount}
                  </span>
                )}
              </button>
            </div>
          </Tooltip>

        </div>
      </div>

      {/* Bottom: Settings, User Avatar & Logout */}
      <div className="flex flex-col items-center gap-2 w-full">
        {/* Settings */}
        <Tooltip content="Settings & Profile" side="right">
          <div className="relative flex items-center justify-center w-full">
            {isProfileActive && (
              <span className="absolute left-0 w-1 h-7 bg-primary rounded-r-full" />
            )}
            <button
              onClick={() => router.push("/profile")}
              className={cn(
                "w-11 h-11 rounded-xl flex items-center justify-center transition-colors duration-150 cursor-pointer outline-none focus:outline-none",
                isProfileActive
                  ? "bg-primary text-white shadow-sm shadow-primary/30"
                  : "text-muted-foreground hover:bg-card hover:text-foreground"
              )}
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </Tooltip>

        {/* Logout */}
        <Tooltip content="Log Out" side="right">
          <button
            onClick={handleLogout}
            className="w-11 h-11 rounded-xl flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors duration-150 cursor-pointer outline-none focus:outline-none"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </Tooltip>

        <div className="w-8 h-[1px] bg-border my-1" />

        {/* Current User Avatar */}
        <Tooltip content={`@${user?.username || "user"}`} side="right">
          <div
            onClick={() => router.push("/profile")}
            className="cursor-pointer"
          >
            <Avatar
              fallback={user?.displayName || user?.username || "U"}
              size="sm"
              status="online"
            />
          </div>
        </Tooltip>
      </div>
    </aside>
  );
}
