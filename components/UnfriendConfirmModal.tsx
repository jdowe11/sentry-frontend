"use client";

import React from "react";
import { UserMinus } from "lucide-react";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";

interface UnfriendConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  friendName: string;
  friendUsername: string;
  isLoading?: boolean;
}

export default function UnfriendConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  friendName,
  friendUsername,
  isLoading = false,
}: UnfriendConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Remove Connection"
      maxWidth="sm"
      footer={
        <>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            size="sm"
            isLoading={isLoading}
            onClick={onConfirm}
            icon={<UserMinus className="w-4 h-4" />}
          >
            Remove Friend
          </Button>
        </>
      }
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-destructive/10 border border-destructive/30 flex items-center justify-center text-destructive shrink-0">
          <UserMinus className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <span className="text-sm text-foreground">
            Are you sure you want to remove{" "}
            <strong className="text-white">{friendName}</strong> (
            <span className="font-mono text-muted-foreground">@{friendUsername}</span>
            )?
          </span>
          <span className="text-xs text-muted-foreground mt-1">
            They will be removed from your friends list and active direct messages.
          </span>
        </div>
      </div>
    </Modal>
  );
}
