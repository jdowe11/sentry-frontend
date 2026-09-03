"use client";

import { useRef, useState, useCallback } from "react";
import {
  User as UserIcon,
  CheckCircle2,
  Calendar,
  Edit2,
  Check,
  X,
} from "lucide-react";
import { useAuth } from "@/store/hooks";
import { updateDisplayName, updateUsername, getMe, User } from "@/api/UserApi";
import ConfirmModal from "@/components/ConfirmModal";
import { useDataLoader } from "@/hooks/useDataLoader";
import SkeletonLoader from "@/components/SkeletonLoader";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Badge from "@/components/ui/Badge";
import { getErrorMessage } from "@/utils/error";

function InlineEditField({
  label,
  currentValue,
  hint,
  onSave,
  validate,
  confirmPrompt,
}: {
  label: string;
  currentValue: string;
  hint?: string;
  onSave: (newValue: string) => Promise<void>;
  validate?: (value: string) => string | null;
  confirmPrompt?: { title: string; description?: string };
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(currentValue);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const startEditing = () => {
    setDraft(currentValue);
    setError(null);
    setIsEditing(true);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleCancel = () => {
    setDraft(currentValue);
    setIsEditing(false);
    setError(null);
    setShowConfirm(false);
  };

  const handleSaveClick = () => {
    const trimmed = draft.trim();

    if (validate) {
      const validationError = validate(trimmed);
      if (validationError) {
        setError(validationError);
        return;
      }
    }

    if (trimmed === currentValue) {
      setIsEditing(false);
      return;
    }

    if (confirmPrompt) {
      setShowConfirm(true);
    } else {
      executeSave(trimmed);
    }
  };

  const executeSave = async (value: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await onSave(value);
      setIsEditing(false);
      setShowConfirm(false);
    } catch (err: unknown) {
      setShowConfirm(false);
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {showConfirm && confirmPrompt && (
        <ConfirmModal
          title={confirmPrompt.title}
          description={confirmPrompt.description}
          isLoading={isLoading}
          onConfirm={() => executeSave(draft.trim())}
          onCancel={() => {
            setShowConfirm(false);
            setTimeout(() => inputRef.current?.focus(), 0);
          }}
        />
      )}

      <div className="flex flex-col gap-1.5 p-3.5 rounded-xl bg-secondary/30 border border-border/80 transition-colors">
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider select-none">
            {label}
          </label>
          {!isEditing && (
            <button
              onClick={startEditing}
              className="text-xs text-primary hover:text-primary-hover flex items-center gap-1 font-medium transition-colors cursor-pointer"
            >
              <Edit2 className="w-3.5 h-3.5" />
              <span>Edit</span>
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="flex flex-col gap-2 mt-1">
            <input
              ref={inputRef}
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSaveClick();
                if (e.key === "Escape") handleCancel();
              }}
              className="w-full px-3 py-2 rounded-lg bg-input border border-primary text-foreground text-sm outline-none focus:ring-1 focus:ring-primary"
            />

            {error && (
              <p className="text-destructive text-xs font-medium">{error}</p>
            )}

            <div className="flex items-center justify-end gap-2 mt-1">
              <Button
                type="button"
                variant="secondary"
                size="xs"
                onClick={handleCancel}
                disabled={isLoading}
                icon={<X className="w-3.5 h-3.5" />}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="primary"
                size="xs"
                onClick={handleSaveClick}
                isLoading={isLoading}
                icon={<Check className="w-3.5 h-3.5" />}
              >
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-foreground">
              {currentValue || "Not set"}
            </span>
          </div>
        )}

        {hint && !isEditing && (
          <p className="text-[11px] text-muted-foreground mt-0.5">{hint}</p>
        )}
      </div>
    </>
  );
}

export default function UpdateProfileView() {
  const { user, updateUser } = useAuth();
  const [globalSuccess, setGlobalSuccess] = useState<string | null>(null);

  const fetchProfile = useCallback(async () => {
    if (!user) throw new Error("No authenticated user session.");
    return getMe(user.id);
  }, [user]);

  const {
    data: activeUser,
    isLoading,
    setData: setActiveUser,
  } = useDataLoader(fetchProfile, [user]);

  if (!user) return null;

  const handleSaveUsername = async (newUsername: string) => {
    const updated: User = await updateUsername(user.id, newUsername);
    updateUser(updated);
    setActiveUser(updated);
    flashSuccess("Username updated successfully.");
  };

  const handleSaveDisplayName = async (newDisplayName: string) => {
    const updated: User = await updateDisplayName(user.id, newDisplayName);
    updateUser(updated);
    setActiveUser(updated);
    flashSuccess("Display name updated successfully.");
  };

  const flashSuccess = (msg: string) => {
    setGlobalSuccess(msg);
    setTimeout(() => setGlobalSuccess(null), 3000);
  };

  const validateUsername = (val: string): string | null => {
    if (!val) return "Username cannot be blank.";
    if (val.length > 32) return "Username cannot exceed 32 characters.";
    if (!/^[a-zA-Z0-9-_]+$/.test(val))
      return "Only alphanumeric characters, hyphens, and underscores allowed.";
    return null;
  };

  const validateDisplayName = (val: string): string | null => {
    if (!val) return "Display name cannot be blank.";
    if (val.length > 50) return "Display name cannot exceed 50 characters.";
    return null;
  };

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
    <div className="w-full max-w-4xl mx-auto flex flex-col gap-6 select-none animate-in fade-in duration-200">
      {/* Header Profile Card */}
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 shadow-sm">
        <div className="flex items-center gap-4">
          <Avatar
            fallback={resolvedUser.displayName || resolvedUser.username}
            size="lg"
            status="online"
          />
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-foreground">
                {resolvedUser.displayName || resolvedUser.username}
              </h2>
              <Badge variant="emerald">Active</Badge>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/70">
          <Calendar className="w-3.5 h-3.5 text-muted-foreground" />
          <span>Member since {formatDate(resolvedUser.createdAt)}</span>
        </div>
      </div>

      {globalSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-800/40 text-emerald-400 rounded-xl p-3.5 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in duration-150 shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{globalSuccess}</span>
        </div>
      )}

      {/* Main Settings Sections */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Editable fields */}
        <div className="md:col-span-2 bg-card border border-border rounded-2xl p-6 flex flex-col gap-5 shadow-sm">
          <div className="flex items-center gap-2 pb-3 border-b border-border/80 text-sm font-semibold text-foreground">
            <UserIcon className="w-4 h-4 text-primary" />
            <span>Profile Identity</span>
          </div>

          {isLoading ? (
            <SkeletonLoader type="list" count={2} />
          ) : (
            <div className="flex flex-col gap-4">
              <InlineEditField
                label="Username"
                currentValue={resolvedUser.username}
                hint="Unique handle used for friend requests and identification."
                onSave={handleSaveUsername}
                validate={validateUsername}
                confirmPrompt={{
                  title: "Change Username?",
                  description:
                    "Changing your username will affect how others find you on Sentry. This change takes effect immediately.",
                }}
              />

              <InlineEditField
                label="Display Name"
                currentValue={resolvedUser.displayName}
                hint="Your public name visible to other Sentry users and servers."
                onSave={handleSaveDisplayName}
                validate={validateDisplayName}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
