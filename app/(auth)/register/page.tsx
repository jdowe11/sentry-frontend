"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/store/hooks";
import RegisterCard from "@/components/RegisterCard";

export default function RegisterPage() {
  const { user, login } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  if (user) return null;

  return (
    <div className="w-full flex items-center justify-center p-4">
      <RegisterCard
        onRegisterSuccess={(newUser) => {
          login(newUser);
          router.push("/home");
        }}
        onToggleMode={() => router.push("/login?view=login")}
      />
    </div>
  );
}
