"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Users,
  Search,
  Plus,
  MessageSquare,
} from "lucide-react";
import { useAuth, useChat } from "@/store/hooks";
import Avatar from "@/components/ui/Avatar";
import { getFriends } from "@/api/FriendshipApi";
import { getOrCreateDirectChat, ChatResponse } from "@/api/ChatApi";
import { User } from "@/api/UserApi";
import { cn } from "@/utils/cn";

export default function Sidebar() {
  const { user } = useAuth();
  const {
    chats,
    activeChatId,
    openChat,
    fetchUserChats,
  } = useChat();
  const router = useRouter();
  const pathname = usePathname();

  // Width tracking state with resizable drag handle
  const [sidebarWidth, setSidebarWidth] = useState(280);
  const [isMobile, setIsMobile] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [friends, setFriends] = useState<User[]>([]);

  // Check for mobile breakpoint
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Fetch friends and user chats on mount or user change
  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    fetchUserChats().catch(() => {});
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
  }, [user, fetchUserChats]);

  const currentWidth = isMobile ? 240 : sidebarWidth;

  // Mouse event handlers for resizing
  const startResizing = (mouseDownEvent: React.MouseEvent) => {
    if (isMobile) return;
    mouseDownEvent.preventDefault();
    const startWidth = sidebarWidth;
    const startX = mouseDownEvent.clientX;

    const doDrag = (mouseMoveEvent: MouseEvent) => {
      const deltaX = mouseMoveEvent.clientX - startX;
      let newWidth = startWidth + deltaX;

      const MIN_WIDTH = 240;
      const MAX_WIDTH = 380;

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

  // Helper to resolve partner for a chat
  const getChatPartner = React.useCallback(
    (chat: ChatResponse): User | null => {
      if (!user) return null;
      return (
        chat.participants.find((p) => p.id !== user.id) ||
        chat.participants[0] ||
        null
      );
    },
    [user]
  );

  // Open existing chat or start new direct chat with a friend
  const handleSelectFriend = async (friend: User) => {
    if (!user) return;
    try {
      const chat = await getOrCreateDirectChat(user.id, friend.id);
      openChat(chat);
      if (pathname !== "/home") {
        router.push("/home");
      }
    } catch (err) {
      console.error("Failed to start chat:", err);
    }
  };

  const handleSelectChat = (chat: ChatResponse) => {
    openChat(chat);
    if (pathname !== "/home") {
      router.push("/home");
    }
  };

  // Filtered chats based on partner username/displayName
  const filteredChats = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return chats;
    return chats.filter((chat) => {
      const partner = getChatPartner(chat);
      if (!partner) return false;
      return (
        partner.username?.toLowerCase().includes(q) ||
        partner.displayName?.toLowerCase().includes(q)
      );
    });
  }, [chats, searchQuery, getChatPartner]);

  // Friend IDs already in active chat list
  const existingChatPartnerIds = useMemo(() => {
    const set = new Set<number>();
    chats.forEach((c) => {
      c.participants.forEach((p) => {
        if (p.id !== user?.id) set.add(p.id);
      });
    });
    return set;
  }, [chats, user]);

  // Filtered friends not yet having an active chat
  const directFriendsAvailable = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return friends.filter((f) => {
      const matchesSearch =
        !q ||
        f.username?.toLowerCase().includes(q) ||
        f.displayName?.toLowerCase().includes(q);
      return matchesSearch && !existingChatPartnerIds.has(f.id);
    });
  }, [friends, existingChatPartnerIds, searchQuery]);

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
      <div className="flex flex-col p-3.5 gap-2.5 overflow-hidden border-b border-border/70">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Conversations
          </span>
          <button
            onClick={() => router.push("/friends")}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-card transition-colors cursor-pointer"
            title="Add Friend or New Message"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Search */}
        <div className="relative flex items-center w-full">
          <Search className="w-4 h-4 text-muted-foreground absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Find a conversation..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-input border border-border text-foreground placeholder:text-muted-foreground/60 text-sm rounded-lg pl-9 pr-3 py-2 outline-none focus:border-primary transition-colors"
          />
        </div>
      </div>

      {/* Middle Section: Channel / DM List */}
      <div className="flex-1 overflow-y-auto px-2.5 py-2 flex flex-col gap-1.5">
        {/* Friends Shortcut Button */}
        <button
          onClick={() => router.push("/friends")}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 cursor-pointer text-left border outline-none focus:outline-none",
            isFriendsActive
              ? "bg-card text-foreground border-border/80 shadow-xs"
              : "text-muted-foreground hover:bg-card/60 hover:text-foreground border-transparent"
          )}
        >
          <div className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center text-primary shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <span className="truncate flex-1">Friends</span>
          {friends.length > 0 && (
            <span className="text-xs bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-mono font-bold">
              {friends.length}
            </span>
          )}
        </button>

        {/* Direct Messages Subheader */}
        <div className="flex items-center justify-between px-2 pt-3 pb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
            Direct Messages
          </span>
        </div>

        {/* Existing Conversations List */}
        {filteredChats.length === 0 && directFriendsAvailable.length === 0 ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground flex flex-col items-center gap-2.5">
            <MessageSquare className="w-6 h-6 text-muted-foreground/50" />
            <span>No active chats yet</span>
            <button
              onClick={() => router.push("/friends")}
              className="text-sm text-primary hover:underline font-medium outline-none cursor-pointer"
            >
              Start one with a friend
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {/* Active Chats */}
            {filteredChats.map((chat) => {
              const partner = getChatPartner(chat);
              const partnerName =
                partner?.displayName || partner?.username || `Chat #${chat.id}`;
              const isSelected = activeChatId === chat.id && pathname === "/home";

              return (
                <button
                  key={chat.id}
                  onClick={() => handleSelectChat(chat)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors duration-150 cursor-pointer text-left group border outline-none focus:outline-none",
                    isSelected
                      ? "bg-card text-foreground border-border/80 font-medium shadow-2xs"
                      : "text-muted-foreground hover:bg-card/50 hover:text-foreground border-transparent"
                  )}
                >
                  <Avatar
                    fallback={partnerName}
                    size="sm"
                    status="online"
                  />
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="truncate text-sm font-semibold text-foreground">
                      {partnerName}
                    </span>
                    {chat.lastMessage ? (
                      <span className="truncate text-xs text-muted-foreground">
                        {chat.lastMessage.ciphertext}
                      </span>
                    ) : partner?.username ? (
                      <span className="truncate text-xs text-muted-foreground font-mono">
                        @{partner.username}
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}

            {/* Other Friends Available for Direct Chat */}
            {directFriendsAvailable.length > 0 && (
              <>
                <div className="flex items-center px-2 pt-3 pb-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60">
                    Friends
                  </span>
                </div>
                {directFriendsAvailable.map((friend) => (
                  <button
                    key={friend.id}
                    onClick={() => handleSelectFriend(friend)}
                    className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors duration-150 cursor-pointer text-left group border border-transparent text-muted-foreground hover:bg-card/50 hover:text-foreground outline-none focus:outline-none"
                  >
                    <Avatar
                      fallback={friend.displayName || friend.username}
                      size="sm"
                      status="online"
                    />
                    <div className="flex flex-col min-w-0 flex-1">
                      <span className="truncate text-sm font-medium text-foreground">
                        {friend.displayName || friend.username}
                      </span>
                      <span className="truncate text-xs text-muted-foreground font-mono">
                        @{friend.username}
                      </span>
                    </div>
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom User Bar */}
      <div className="p-3 border-t border-border/80 bg-sidebar-rail/80 flex items-center justify-between gap-2.5 shrink-0">
        <div
          onClick={() => router.push("/profile")}
          className="flex items-center gap-3 min-w-0 flex-1 p-1 rounded-lg hover:bg-card cursor-pointer transition-colors"
        >
          <Avatar
            fallback={user?.displayName || user?.username || "U"}
            size="md"
            status="online"
          />
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-sm font-semibold text-foreground truncate">
              {user?.displayName || user?.username}
            </span>
            <span className="text-xs font-mono text-muted-foreground truncate">
              @{user?.username}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}
