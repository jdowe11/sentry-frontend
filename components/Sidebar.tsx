"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  Lock,
  MessageSquare,
} from "lucide-react";
import { useAuth } from "@/store/hooks";
import Avatar from "@/components/ui/Avatar";
import { getFriends } from "@/api/FriendshipApi";
import { User } from "@/api/UserApi";
import { cn } from "@/utils/cn";

export default function Sidebar() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Width tracking state with resizable drag handle
  const [sidebarWidth, setSidebarWidth] = useState(240);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<User[]>([]);
  const [activeChatId, setActiveChatId] = useState<number | null>(null);

  // Check for mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch friends for the DM list
  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    getFriends(user.id)
      .then((data) => {
        if (isMounted) {
          setFriends(data || []);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user]);

  const currentWidth = isMobile ? 220 : sidebarWidth;

  // Mouse event handlers for resizing
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    if (isMobile) return;
    mouseDownEvent.preventDefault();
    const startWidth = sidebarWidth;
    const startX = mouseDownEvent.clientX;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;

      const MIN_WIDTH = 200;
      const MAX_WIDTH = 340;

      if (newWidth < MIN_WIDTH) newWidth = MIN_WIDTH;
      if (newWidth > MAX_WIDTH) newWidth = MAX_WIDTH;

      setSidebarWidth(newWidth);
    };

    const stopDrag = () => {
      document.removeEventListener("mousemove", doDrag);
      document.removeEventListener("mouseup", stopDrag);
    };

    document.addEventListener("mousemove", doDrag);
    document.addEventListener("mouseup", stopDrag);
  };

  const filteredFriends = friends.filter((f) => {
    const q = searchQuery.toLowerCase();
    return (
      f.username?.toLowerCase().includes(q) ||
      f.displayName?.toLowerCase().includes(q)
    );
  });

  const isFriendsActive = pathname === "/friends";

  return (
    <aside
      className="bg-sidebar-panel relative flex flex-col justify-between border-r border-border h-screen shrink-0 overflow-hidden select-none"
      style={{ width: `${currentWidth}px` }}
    >
      {/* Resizer handle (Desktop only) */}
      {!isMobile && (
        <div
          onMouseDown={startResizing}
          className="hidden md:block absolute top-0 right-0 w-1.5 h-full cursor-col-resize hover:bg-primary/50 transition-colors z-40 select-none"
          title="Drag to resize sidebar"
        />
      )}

      {/* Top Section: Header & Search */}
      <div className="flex flex-col p-3 gap-2 overflow-hidden border-b border-border/70">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Conversations
          </span>
          <button
            onClick={() => router.push("/friends")}
            className="text-muted-foreground hover:text-foreground p-1 rounded-md hover:bg-card transition-colors"
            title="Add Friend or New Message"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative flex items-center w-full">
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Find a conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border border-border text-foreground placeholder:text-muted-foreground/60 text-xs rounded-lg pl-8 pr-2.5 py-1.5 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Middle Section: Channel / DM List */}
      <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
        {/* Friends Shortcut Button */}
        <button
          onClick={() => router.push("/friends")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer text-left border outline-none focus:outline-none",
            isFriendsActive
              ? "bg-card text-foreground border-border/80 shadow-xs"
              : "text-muted-foreground hover:bg-card/60 hover:text-foreground border-transparent"
          )}
        >
          <div className="w-6 h-6 rounded-md bg-secondary flex items-center justify-center text-primary shrink-0">
            <Users className="w-3.5 h-3.5" />
          </div>
          <span className="truncate flex-1">Friends</span>
          {friends.length > 0 && (
            <span className="text-[10px] bg-secondary text-muted-foreground px-1.5 py-0.5 rounded font-mono font-bold">
              {friends.length}
            </span>
          )}
        </button>

        {/* Direct Messages Subheader */}
        <div className="flex items-center justify-between px-2 pt-3 pb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground/80">
            Direct Messages
          </span>
        </div>

        {/* DM Conversations List */}
        {filteredFriends.length === 0 ? (
          <div className="px-3 py-6 text-center text-xs text-muted-foreground flex flex-col items-center gap-2">
            <MessageSquare className="w-5 h-5 text-muted-foreground/50" />
            <span>No active chats yet</span>
            <button
              onClick={() => router.push("/friends")}
              className="text-xs text-primary hover:underline font-medium outline-none"
            >
              Start one with a friend
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-0.5">
            {filteredFriends.map((friend) => {
              const isSelected = activeChatId === friend.id;
              return (
                <button
                  key={friend.id}
                  onClick={() => {
                    setActiveChatId(friend.id);
                    router.push("/home");
                  }}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs transition-colors duration-150 cursor-pointer text-left group border outline-none focus:outline-none",
                    isSelected
                      ? "bg-card text-foreground border-border/80 font-medium"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground border-transparent"
                  )}
                >
                  <Avatar
                    fallback={friend.displayName || friend.username}
                    size="xs"
                    status="online"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-xs font-medium text-foreground">
                      {friend.displayName || friend.username}
                    </span>
                    <span className="truncate text-[10px] text-muted-foreground font-mono">
                      @{friend.username}
                    </span>
                  </div>
                  <Lock className="w-3 h-3 text-muted-foreground/40 group-hover:text-primary/70 shrink-0 transition-colors" />
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom User Bar */}
      <div className="p-2.5 border-t border-border/80 bg-sidebar-rail/80 flex items-center justify-between gap-2 shrink-0">
        <div
          onClick={() => router.push("/profile")}
          className="flex items-center gap-2.5 min-w-0 flex-1 p-1 rounded-lg hover:bg-card cursor-pointer transition-colors"
        >
          <Avatar
            fallback={user?.displayName || user?.username || "U"}
            size="sm"
            status="online"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs font-semibold text-foreground truncate">
              {user?.displayName || user?.username}
            </span>
            <span className="text-[10px] font-mono text-muted-foreground truncate">
              @{user?.username}
            </span>
          </div>
        </div>

      </div>
    </aside>
  );
}
