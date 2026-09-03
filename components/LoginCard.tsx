"use client";

import React, { useState } from "react";
import Image from "next/image";
import { User, Lock, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { User as UserType } from "@/api/UserApi";
import { loginUser } from "@/api/LoginApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface LoginCardProps {
  onLoginSuccess: (user: UserType) => void;
  onToggleMode: () => void;
  onBack?: () => void;
  autoFocus?: boolean;
}

export default function LoginCard({
  onLoginSuccess,
  onToggleMode,
  onBack,
  autoFocus = false,
}: LoginCardProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setErrorMsg("Please enter both username and password.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const authenticatedUser = await loginUser(username.trim(), password);
      onLoginSuccess(authenticatedUser);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Unable to connect to backend server.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/60 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 select-none relative">
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="absolute top-6 left-6 text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-secondary transition-colors cursor-pointer"
          title="Back to Welcome"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
      )}

      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-12 h-12 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center shadow-lg shadow-black/40">
          <Image
            src="/logo.png"
            alt="Sentry Logo"
            width={200}
            height={200}
            className="object-contain"
          />
        </div>

        <div className="flex items-center gap-2">
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Sign In
          </h2>
        </div>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/30 text-red-400 rounded-xl p-3.5 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Username
          </label>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Enter your username"
            icon={<User className="w-4 h-4" />}
            required
            autoFocus={autoFocus}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Password
          </label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            icon={<Lock className="w-4 h-4" />}
            required
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          size="md"
          isLoading={isLoading}
          icon={<ArrowRight className="w-4 h-4" />}
          className="w-full mt-2"
        >
          Sign In
        </Button>
      </form>

      {/* Switch Mode Footer */}
      <div className="flex items-center justify-between text-xs pt-4 border-t border-border/70">
        <span className="text-muted-foreground">Need an account?</span>
        <button
          onClick={onToggleMode}
          className="text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer"
        >
          Create account
        </button>
      </div>
    </div>
  );
}
