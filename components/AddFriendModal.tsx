"use client";

import React, { useState } from "react";
import { UserPlus, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "@/store/hooks";
import { sendFriendRequest } from "@/api/FriendRequestApi";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { getErrorMessage } from "@/utils/error";

interface AddFriendModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestSent: () => void;
}

export default function AddFriendModal({
  isOpen,
  onClose,
  onRequestSent,
}: AddFriendModalProps) {
  const { user } = useAuth();
  const [targetUsername, setTargetUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{ success?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const trimmed = targetUsername.trim();
    if (!trimmed) {
      setStatus({ error: "Please enter a username." });
      return;
    }

    setIsLoading(true);
    setStatus(null);

    try {
      await sendFriendRequest(user.id, trimmed);
      setStatus({ success: `Friend request sent to @${trimmed}` });
      setTargetUsername("");
      onRequestSent();
      setTimeout(onClose, 1200);
    } catch (err: unknown) {
      const errMsg = getErrorMessage(err);
      setStatus({ error: errMsg });
      setIsLoading(false);
    }
  };

  if (!isOpen || !user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Friend"
      description="You can connect with others using their unique Sentry username."
      maxWidth="md"
    >
      {/* Status Alerts */}
      {status?.error && (
        <div className="bg-destructive/10 border border-destructive/30 text-red-400 rounded-lg p-3 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 text-destructive" />
          <span>{status.error}</span>
        </div>
      )}
      {status?.success && (
        <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-lg p-3 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{status.success}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Username
          </label>
          <Input
            type="text"
            placeholder="e.g. jdizzle"
            value={targetUsername}
            onChange={(e) => setTargetUsername(e.target.value)}
            disabled={isLoading || !!status?.success}
            icon={<UserPlus className="w-4 h-4" />}
            autoFocus
            required
          />
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border/70">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading || !!status?.success}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!!status?.success}
            icon={<UserPlus className="w-4 h-4" />}
          >
            Send Friend Request
          </Button>
        </div>
      </form>
    </Modal>
  );
}
