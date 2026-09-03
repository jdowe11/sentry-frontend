"use client";

import React, { useState, useCallback } from "react";
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  MessageSquare,
  Search,
  Check,
  X,
  RefreshCw,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";
import { User } from "@/api/UserApi";
import {
  getPendingRequests,
  updateFriendRequestStatus,
} from "@/api/FriendRequestApi";
import {
  getFriends,
  removeFriend,
} from "@/api/FriendshipApi";
import AddFriendModal from "@/components/AddFriendModal";
import UnfriendConfirmModal from "@/components/UnfriendConfirmModal";
import SkeletonLoader from "@/components/SkeletonLoader";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { getErrorMessage } from "@/utils/error";
import { useDataLoader } from "@/hooks/useDataLoader";
import { cn } from "@/utils/cn";

type TabType = "friends" | "incoming" | "outgoing";

export default function FriendsList() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("friends");
  const [filterQuery, setFilterQuery] = useState("");

  // Modal visibility states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isUnfriendModalOpen, setIsUnfriendModalOpen] = useState(false);
  const [unfriendTarget, setUnfriendTarget] = useState<User | null>(null);

  // Loading state trackers for button disablers
  const [processingActionId, setProcessingActionId] = useState<number | null>(null);
  const [isUnfriendLoading, setIsUnfriendLoading] = useState(false);

  // Fetch pending requests and friends list in parallel
  const fetchAllData = useCallback(async () => {
    if (!user) throw new Error("No authenticated user session.");
    const [pendingRes, friendsRes] = await Promise.all([
      getPendingRequests(user.id),
      getFriends(user.id),
    ]);
    return {
      pending: pendingRes,
      friends: friendsRes,
    };
  }, [user]);

  // Data loader hook
  const {
    data,
    isLoading: isInitialLoad,
    isRefreshing,
    reloadData: loadData,
  } = useDataLoader(fetchAllData, [user]);

  const friends = data?.friends || [];
  const incomingRequests = data?.pending.incoming || [];
  const outgoingRequests = data?.pending.outgoing || [];

  // Handle updating status (accept, decline, cancel)
  const handleStatusUpdate = async (
    requestId: number,
    action: "accepted" | "declined" | "cancelled"
  ) => {
    if (!user || processingActionId !== null) return;
    setProcessingActionId(requestId);
    try {
      await updateFriendRequestStatus(user.id, requestId, action);
      await loadData();
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setProcessingActionId(null);
    }
  };

  // Trigger unfriend modal
  const triggerRemoveFriend = (target: User) => {
    setUnfriendTarget(target);
    setIsUnfriendModalOpen(true);
  };

  // Handle removing a friend relationship
  const handleRemoveConfirm = async () => {
    if (!user || !unfriendTarget || isUnfriendLoading) return;
    setIsUnfriendLoading(true);
    try {
      await removeFriend(user.id, unfriendTarget.id);
      await loadData();
      setIsUnfriendModalOpen(false);
      setUnfriendTarget(null);
    } catch (err: unknown) {
      alert(getErrorMessage(err));
    } finally {
      setIsUnfriendLoading(false);
    }
  };

  if (!user) return null;

  const filteredFriends = friends.filter((f) => {
    const q = filterQuery.toLowerCase();
    return (
      f.username?.toLowerCase().includes(q) ||
      f.displayName?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="w-full flex-1 flex flex-col gap-6 select-none animate-in fade-in duration-200">
      {/* Top Action Bar & Segmented Tabs */}
      <div className="bg-card border border-border rounded-xl p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
        {/* Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setActiveTab("friends")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-2 border",
              activeTab === "friends"
                ? "bg-secondary text-foreground border-border shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-transparent"
            )}
          >
            <span>All Friends</span>
            {friends.length > 0 && (
              <Badge variant="default" className="text-[10px] py-0 px-1.5">
                {friends.length}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab("incoming")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-2 border",
              activeTab === "incoming"
                ? "bg-secondary text-foreground border-border shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-transparent"
            )}
          >
            <span>Incoming</span>
            {incomingRequests.length > 0 && (
              <Badge variant="destructive" className="text-[10px] py-0 px-1.5">
                {incomingRequests.length}
              </Badge>
            )}
          </button>

          <button
            onClick={() => setActiveTab("outgoing")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors duration-150 cursor-pointer flex items-center gap-2 border",
              activeTab === "outgoing"
                ? "bg-secondary text-foreground border-border shadow-xs"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-transparent"
            )}
          >
            <span>Outgoing</span>
            {outgoingRequests.length > 0 && (
              <Badge variant="default" className="text-[10px] py-0 px-1.5">
                {outgoingRequests.length}
              </Badge>
            )}
          </button>
        </div>

        {/* Right side: Add Friend Button */}
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {isRefreshing && (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground mr-1">
              <RefreshCw className="w-3 h-3 animate-spin text-primary" />
              <span>Syncing</span>
            </span>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsAddModalOpen(true)}
            icon={<UserPlus className="w-4 h-4" />}
            className="w-full sm:w-auto"
          >
            Add Friend
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-card border border-border rounded-xl p-5 flex-1 flex flex-col gap-4 shadow-sm min-h-[400px]">
        {/* Search bar inside friends tab */}
        {activeTab === "friends" && friends.length > 0 && (
          <div className="w-full max-w-sm pb-1">
            <Input
              placeholder="Filter friends..."
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              icon={<Search className="w-4 h-4" />}
            />
          </div>
        )}

        {isInitialLoad ? (
          <div className="flex flex-col gap-3 py-4">
            <div className="h-4 bg-secondary rounded w-32 animate-pulse mb-2" />
            <SkeletonLoader type="list" count={3} />
          </div>
        ) : (
          <>
            {/* 1. Friends Tab */}
            {activeTab === "friends" && (
              <div className="flex flex-col gap-2 flex-1">
                {friends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
                      <Users className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-foreground font-semibold text-base">
                      No friends added yet
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1.5 max-w-xs leading-relaxed">
                      Connect with others by clicking the Add Friend button above. All conversations are secured with end-to-end encryption.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsAddModalOpen(true)}
                      icon={<UserPlus className="w-4 h-4" />}
                      className="mt-4"
                    >
                      Find Friends
                    </Button>
                  </div>
                ) : filteredFriends.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground text-xs">
                    <p>No friends match &ldquo;{filterQuery}&rdquo;</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                    {filteredFriends.map((friend) => (
                      <div
                        key={friend.id}
                        className="bg-secondary/40 hover:bg-secondary/70 border border-border/80 rounded-xl p-3 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <Avatar
                            fallback={friend.displayName || friend.username}
                            size="md"
                            status="online"
                          />
                          <div className="flex flex-col min-w-0">
                            <span className="text-sm font-semibold text-foreground truncate">
                              {friend.displayName || "Anonymous User"}
                            </span>
                            <span className="text-xs text-muted-foreground font-mono truncate">
                              @{friend.username}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.push("/home")}
                            title="Open direct message"
                          >
                            <MessageSquare className="w-4 h-4 text-muted-foreground hover:text-primary" />
                          </Button>
                          <Button
                            variant="destructive-outline"
                            size="sm"
                            onClick={() => triggerRemoveFriend(friend)}
                            disabled={
                              processingActionId !== null || isUnfriendLoading
                            }
                            icon={<UserX className="w-3.5 h-3.5" />}
                          >
                            Unfriend
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. Incoming Requests Tab */}
            {activeTab === "incoming" && (
              <div className="flex flex-col gap-2 flex-1">
                {incomingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
                      <UserCheck className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-foreground font-semibold text-base">
                      No incoming requests
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1.5 max-w-xs">
                      When someone sends you a friend request on Sentry, it will appear here for verification.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {incomingRequests.map((req) => {
                      const senderName = req.sender?.displayName || req.sender?.username || "User";
                      const senderUsername = req.sender?.username || String(req.senderId);
                      return (
                        <div
                          key={req.id}
                          className="bg-secondary/40 border border-border/80 rounded-xl p-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              fallback={senderName}
                              size="md"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-foreground truncate">
                                {senderName}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono truncate">
                                @{senderUsername}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleStatusUpdate(req.id, "accepted")}
                              disabled={processingActionId === req.id}
                              isLoading={processingActionId === req.id}
                              icon={<Check className="w-4 h-4" />}
                            >
                              Accept
                            </Button>
                            <Button
                              variant="destructive-outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(req.id, "declined")}
                              disabled={processingActionId === req.id}
                              icon={<X className="w-4 h-4" />}
                            >
                              Decline
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* 3. Outgoing Requests Tab */}
            {activeTab === "outgoing" && (
              <div className="flex flex-col gap-2 flex-1">
                {outgoingRequests.length === 0 ? (
                  <div className="flex flex-col items-center justify-center flex-1 text-center py-16">
                    <div className="w-14 h-14 rounded-2xl bg-secondary border border-border flex items-center justify-center text-muted-foreground mb-4 shadow-sm">
                      <Users className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-foreground font-semibold text-base">
                      No outgoing requests
                    </h3>
                    <p className="text-muted-foreground text-xs mt-1.5 max-w-xs">
                      You haven&apos;t sent any pending friend requests. Use the Add Friend button to connect with friends.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    {outgoingRequests.map((req) => {
                      const receiverName = req.receiver?.displayName || req.receiver?.username || "User";
                      const receiverUsername = req.receiver?.username || String(req.receiverId);
                      return (
                        <div
                          key={req.id}
                          className="bg-secondary/40 border border-border/80 rounded-xl p-3.5 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Avatar
                              fallback={receiverName}
                              size="md"
                            />
                            <div className="flex flex-col min-w-0">
                              <span className="text-sm font-semibold text-foreground truncate">
                                {receiverName}
                              </span>
                              <span className="text-xs text-muted-foreground font-mono truncate">
                                @{receiverUsername}
                              </span>
                            </div>
                          </div>

                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleStatusUpdate(req.id, "cancelled")}
                            disabled={processingActionId === req.id}
                            isLoading={processingActionId === req.id}
                            icon={<X className="w-3.5 h-3.5" />}
                          >
                            Cancel Request
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Add Friend Modal */}
      <AddFriendModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onRequestSent={loadData}
      />

      {/* Unfriend Confirm Modal */}
      {unfriendTarget && (
        <UnfriendConfirmModal
          isOpen={isUnfriendModalOpen}
          onClose={() => {
            setIsUnfriendModalOpen(false);
            setUnfriendTarget(null);
          }}
          onConfirm={handleRemoveConfirm}
          friendName={unfriendTarget.displayName || unfriendTarget.username}
          friendUsername={unfriendTarget.username}
          isLoading={isUnfriendLoading}
        />
      )}
    </div>
  );
}
