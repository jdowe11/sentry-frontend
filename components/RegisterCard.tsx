"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  User as UserIcon,
  Lock,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { User, createUser, getUserByUsername } from "@/api/UserApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

interface RegisterCardProps {
  onRegisterSuccess: (user: User) => void;
  onToggleMode: () => void;
}

export default function RegisterCard({
  onRegisterSuccess,
  onToggleMode,
}: RegisterCardProps) {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [registerStep, setRegisterStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleRegisterStep1 = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!username.trim() || !password.trim() || !confirmPassword.trim()) {
      setErrorMsg("Please fill out all fields.");
      return;
    }

    const usernameRegex = /^[a-zA-Z0-9-_]+$/;
    if (!usernameRegex.test(username.trim())) {
      setErrorMsg("Username can only contain alphanumeric characters, hyphens, and underscores.");
      return;
    }

    if (username.trim().length > 32) {
      setErrorMsg("Username cannot exceed 32 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const existingUser = await getUserByUsername(username.trim());
      if (existingUser) {
        setErrorMsg("Username is already taken.");
      } else {
        setRegisterStep(2);
        setErrorMsg(null);
      }
    } catch {
      setErrorMsg("Unable to connect to backend server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!displayName.trim()) {
      setErrorMsg("Display name cannot be blank.");
      return;
    }

    if (displayName.trim().length > 50) {
      setErrorMsg("Display name cannot exceed 50 characters.");
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const createdUser = await createUser({
        username: username.trim(),
        displayName: displayName.trim(),
        passwordHash: password,
      });

      setSuccessMsg("Account created successfully!");
      onRegisterSuccess(createdUser);
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Failed to create account. Please check inputs.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-card border border-border rounded-2xl p-8 shadow-2xl shadow-black/60 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200 select-none">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center gap-2">
        <div className="w-16 h-16 rounded-2xl bg-secondary/80 border border-border flex items-center justify-center mb-1 shadow-sm p-2">
          <Image
            src="/logo.png"
            alt="Sentry Logo"
            width={44}
            height={44}
            unoptimized
            className="object-contain"
          />
        </div>

        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Create Sentry Account
        </h2>

        {/* Step Indicator */}
        <div className="flex items-center gap-2 mt-1">
          <span
            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
              registerStep === 1
                ? "bg-primary text-white"
                : "bg-emerald-950 text-emerald-400 border border-emerald-800"
            }`}
          >
            1
          </span>
          <div className="w-8 h-[2px] bg-border" />
          <span
            className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
              registerStep === 2
                ? "bg-primary text-white"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            2
          </span>
        </div>
      </div>

      {/* Error / Success Alerts */}
      {errorMsg && (
        <div className="bg-destructive/10 border border-destructive/30 text-red-400 rounded-xl p-3.5 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          <span>{errorMsg}</span>
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl p-3.5 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Step 1: Credentials Form */}
      {registerStep === 1 && (
        <form onSubmit={handleRegisterStep1} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Username
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="e.g. jdizzle"
              icon={<UserIcon className="w-4 h-4" />}
              required
              autoFocus
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
              placeholder="Enter password"
              icon={<Lock className="w-4 h-4" />}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Confirm Password
            </label>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm password"
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
            Continue
          </Button>
        </form>
      )}

      {/* Step 2: Display Profile Form */}
      {registerStep === 2 && (
        <form onSubmit={handleRegisterSubmit} className="flex flex-col gap-4">
          <div className="p-3 bg-secondary/50 rounded-xl border border-border/80 text-xs flex items-center justify-between">
            <span className="text-muted-foreground">Account handle:</span>
            <span className="font-mono text-primary font-bold">@{username}</span>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Display Name
            </label>
            <Input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Jayden Dowell"
              icon={<Sparkles className="w-4 h-4" />}
              required
              autoFocus
            />
          </div>

          <div className="flex items-center gap-3 mt-2">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setRegisterStep(1)}
              icon={<ArrowLeft className="w-4 h-4" />}
              disabled={isLoading}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isLoading}
              className="flex-1"
            >
              Create Account
            </Button>
          </div>
        </form>
      )}

      {/* Switch Mode Footer */}
      <div className="flex items-center justify-between text-xs pt-4 border-t border-border/70">
        <span className="text-muted-foreground">Already have an account?</span>
        <button
          onClick={onToggleMode}
          className="text-primary hover:text-primary-hover font-semibold transition-colors cursor-pointer"
        >
          Sign in
        </button>
      </div>
    </div>
  );
}
