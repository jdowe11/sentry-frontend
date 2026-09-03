"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";
import ActivityRail from "@/components/navigation/ActivityRail";
import Sidebar from "@/components/Sidebar";
import TopHeader from "@/components/navigation/TopHeader";
import { getPendingRequests } from "@/api/FriendRequestApi";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [pendingCount, setPendingCount] = useState(0);

  // Fetch pending incoming requests to display notification badge in ActivityRail
  useEffect(() => {
    let isMounted = true;
    if (!user) return;

    getPendingRequests(user.id)
      .then((res) => {
        if (isMounted) {
          setPendingCount(res.incoming?.length || 0);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [user]);

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      const saved = localStorage.getItem("sentry_user");
      if (!saved) router.replace("/login");
    }
  }, [user, router]);

  // Don't render the protected layout until we have a user
  if (!user) return null;

  return (
    <div className="flex flex-row w-full h-screen overflow-hidden bg-background text-foreground">
      {/* 1. Far Left Activity Rail */}
      <ActivityRail pendingCount={pendingCount} />

      {/* 2. Resizable Conversation / Context Sidebar */}
      <Sidebar />

      {/* 3. Main Stage with Header */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden bg-background">
        <TopHeader />
        <main className="flex-1 overflow-y-auto p-6 flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}
