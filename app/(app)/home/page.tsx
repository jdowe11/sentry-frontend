"use client";

import { useAuth } from "@/store/hooks";
import AuthenticatedView from "@/components/AuthenticatedView";

export default function HomePage() {
  const { user } = useAuth();

  if (!user) return null;

  return <AuthenticatedView />;
}
