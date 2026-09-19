"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Settings,
  Calendar,
  User as UserIcon,
} from "lucide-react";
import { useAuth, useChat } from "@/store/hooks";
import { getMe } from "@/api/UserApi";
import { useDataLoader } from "@/hooks/useDataLoader";
import SkeletonLoader from "@/components/SkeletonLoader";
import Avatar from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";

export default function AuthenticatedView() {
  const { user } = useAuth();
  const { chats, openChat } = useChat();
  const router = useRouter();

  const fetchProfile = useCallback(async () => {
    if (!user) throw new Error("No authenticated user session.");
    return getMe(user.id);
  }, [user]);

  const { data: activeUser, isLoading } = useDataLoader(fetchProfile, [user]);

  if (!user) return null;

  const resolvedUser = activeUser || user;

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col gap-6 select-none animate-in fade-in duration-200">
      {/* Welcome Banner */}
      <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="flex items-center gap-5 z-10">
          <Avatar
            fallback={resolvedUser.displayName || resolvedUser.username}
            size="xl"
            status="online"
          />
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-foreground tracking-tight">
                Welcome back, {resolvedUser.displayName || resolvedUser.username}
              </h1>
            </div>
          </div>
        </div>

        {/* Quick Jump Action */}
        <div className="flex items-center gap-2.5 z-10 w-full md:w-auto">
          <Button
            variant="primary"
            size="md"
            onClick={() => router.push("/friends")}
            icon={<Users className="w-4 h-4" />}
            className="w-full md:w-auto"
          >
            Manage Friends
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-card border border-border rounded-xl p-6">
          <SkeletonLoader type="profile" count={1} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* 1. Account Details Card */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-border/70 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <UserIcon className="w-4 h-4 text-primary" />
              <span>Identity Profile</span>
            </div>

            <div className="flex flex-col gap-3.5 text-sm">
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground font-medium">Username</span>
                <span className="font-mono text-foreground font-semibold">
                  @{resolvedUser.username}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground font-medium">Display Name</span>
                <span className="text-foreground font-semibold">
                  {resolvedUser.displayName || "Not set"}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-border/50">
                <span className="text-muted-foreground font-medium">Member Since</span>
                <span className="text-foreground flex items-center gap-1.5 font-medium">
                  <Calendar className="w-4 h-4 text-muted-foreground" />
                  {formatDate(resolvedUser.createdAt)}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-muted-foreground font-medium">Status</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Online
                </span>
              </div>
            </div>

            <Button
              variant="secondary"
              size="sm"
              onClick={() => router.push("/profile")}
              icon={<Settings className="w-4 h-4" />}
              className="mt-auto"
            >
              Edit Profile
            </Button>
          </div>

          {/* 2. Direct Conversations Card */}
          <div className="bg-card border border-border rounded-xl p-5 sm:p-6 flex flex-col gap-4 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between pb-2.5 border-b border-border/70 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <div className="flex items-center gap-2.5">
                <Users className="w-4 h-4 text-primary" />
                <span>Recent Conversations</span>
              </div>
              {chats.length > 0 && (
                <span className="font-mono text-xs text-muted-foreground">
                  {chats.length} {chats.length === 1 ? "chat" : "chats"}
                </span>
              )}
            </div>

            {chats.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-10 text-sm text-muted-foreground gap-3">
                <p>No active conversations yet.</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push("/friends")}
                  icon={<Users className="w-4 h-4" />}
                >
                  Start a Chat with a Friend
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 flex-1">
                {chats.slice(0, 4).map((chat) => {
                  const partner =
                    chat.participants.find((p) => p.id !== user.id) ||
                    chat.participants[0];
                  const partnerName =
                    partner?.displayName || partner?.username || `Chat #${chat.id}`;

                  return (
                    <div
                      key={chat.id}
                      onClick={() => openChat(chat)}
                      className="bg-secondary/40 hover:bg-secondary/70 border border-border/80 rounded-xl p-3.5 flex items-center gap-3.5 cursor-pointer transition-colors group"
                    >
                      <Avatar
                        fallback={partnerName}
                        size="md"
                        status="online"
                      />
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="text-sm font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                          {partnerName}
                        </span>
                        {chat.lastMessage ? (
                          <span className="text-xs text-muted-foreground truncate mt-0.5">
                            {chat.lastMessage.ciphertext}
                          </span>
                        ) : partner?.username ? (
                          <span className="text-xs text-muted-foreground font-mono truncate mt-0.5">
                            @{partner.username}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
