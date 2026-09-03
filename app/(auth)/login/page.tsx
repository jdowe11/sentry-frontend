"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/store/hooks";
import LoginCard from "@/components/LoginCard";
import Button from "@/components/ui/Button";
import { cn } from "@/utils/cn";

function LoginContent() {
  const { user, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // If arriving from register page (?view=login), start directly on login card
  const isDirectLogin = searchParams.get("view") === "login";
  const [isLoggingIn, setIsLoggingIn] = useState(isDirectLogin);

  // Redirect if already authenticated
  useEffect(() => {
    if (user) router.replace("/home");
  }, [user, router]);

  if (user) return null;

  return (
    <div className="w-full min-h-screen overflow-hidden relative select-none flex items-center justify-center">
      {/* Pane 1: Landing Hero with ANSI Shadow Font */}
      <div
        className={cn(
          "absolute inset-0 w-full min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 ease-in-out z-10",
          isLoggingIn
            ? "-translate-x-full opacity-0 pointer-events-none scale-95"
            : "translate-x-0 opacity-100 pointer-events-auto scale-100"
        )}
      >
        <div className="max-w-3xl flex flex-col items-center text-center gap-8">
          {/* Top Brand Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center shadow-lg shadow-black/40">
              <Image
                src="/logo.png"
                alt="Sentry Logo"
                width={200}
                height={200}
                className="object-contain"
              />
            </div>
          </div>

          {/* ANSI Shadow "SENTRY" ASCII Art */}
          <div className="relative overflow-x-auto max-w-full px-2 py-2 flex justify-center">
            <pre className="font-mono text-[9px] xs:text-[11px] sm:text-xs md:text-sm lg:text-base font-black leading-none tracking-tight select-none bg-gradient-to-b from-emerald-300 via-emerald-400 to-emerald-600 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(16,185,129,0.35)]">
{`███████╗███████╗███╗   ██╗████████╗██████╗ ██╗   ██╗
██╔════╝██╔════╝████╗  ██║╚══██╔══╝██╔══██╗╚██╗ ██╔╝
███████╗█████╗  ██╔██╗ ██║   ██║   ██████╔╝ ╚████╔╝ 
╚════██║██╔══╝  ██║╚██╗██║   ██║   ██╔══██╗  ╚██╔╝  
███████║███████╗██║ ╚████║   ██║   ██║  ██║   ██║   
╚══════╝╚══════╝╚═╝  ╚═══╝   ╚═╝   ╚═╝  ╚═╝   ╚═╝   `}
            </pre>
          </div>

          {/* Tagline & Subtext */}
          <div className="flex flex-col gap-2 max-w-lg">
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-foreground">
              Cryptographic Communication Platform
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              End-to-end encrypted direct messaging and real-time coordination engineered for privacy-conscious communities.
            </p>
          </div>

          {/* Welcome -> Action Button */}
          <div className="flex flex-col items-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setIsLoggingIn(true)}
              icon={<ArrowRight className="w-5 h-5 ml-1 transition-transform group-hover:translate-x-1" />}
              className="px-8 py-3.5 text-base font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40 group cursor-pointer"
            >
              Welcome
            </Button>
          </div>
        </div>
      </div>

      {/* Pane 2: Login Card Slide */}
      <div
        className={cn(
          "absolute inset-0 w-full min-h-screen flex flex-col items-center justify-center p-6 transition-all duration-700 ease-in-out z-10",
          isLoggingIn
            ? "translate-x-0 opacity-100 pointer-events-auto scale-100"
            : "translate-x-full opacity-0 pointer-events-none scale-95"
        )}
      >
        <LoginCard
          onLoginSuccess={(loggedInUser) => {
            login(loggedInUser);
            router.push("/home");
          }}
          onToggleMode={() => router.push("/register")}
          onBack={() => setIsLoggingIn(false)}
          autoFocus={isLoggingIn}
        />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="w-full min-h-screen bg-background" />}>
      <LoginContent />
    </Suspense>
  );
}
