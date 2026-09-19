import { BASE_URL } from "@/api/config";
import { User } from "@/api/UserApi";

export interface MessageResponse {
  id: number;
  chatId: number;
  senderId: number;
  ciphertext: string;
  createdAt: string;
  sender?: User;
}

export interface ChatResponse {
  id: number;
  createdAt: string;
  participants: User[];
  lastMessage?: MessageResponse;
}

export interface CreateDirectChatRequest {
  recipientId: number;
}

export interface SendMessageRequest {
  ciphertext: string;
}

/**
 * Retrieves or creates a direct 1-on-1 chat with a recipient.
 * POST /chats/direct
 */
export async function getOrCreateDirectChat(
  userId: number,
  recipientId: number
): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/chats/direct`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify({ recipientId }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to initiate direct conversation.");
  }

  return response.json();
}

/**
 * Retrieves all chats the current user participates in.
 * GET /chats
 */
export async function getUserChats(userId: number): Promise<ChatResponse[]> {
  const response = await fetch(`${BASE_URL}/chats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userId}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load chats.");
  }

  return response.json();
}

/**
 * Retrieves details and participants for a specific chat.
 * GET /chats/{chatId}
 */
export async function getChatById(
  userId: number,
  chatId: number
): Promise<ChatResponse> {
  const response = await fetch(`${BASE_URL}/chats/${chatId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${userId}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load chat details.");
  }

  return response.json();
}

/**
 * Sends a message to a chat.
 * POST /chats/{chatId}/messages
 */
export async function sendMessage(
  userId: number,
  chatId: number,
  ciphertext: string
): Promise<MessageResponse> {
  const response = await fetch(`${BASE_URL}/chats/${chatId}/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${userId}`,
    },
    body: JSON.stringify({ ciphertext }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to send message.");
  }

  return response.json();
}

/**
 * Retrieves messages for a chat with optional pagination.
 * GET /chats/{chatId}/messages?limit={limit}&before={before}
 */
export async function getChatMessages(
  userId: number,
  chatId: number,
  limit: number = 50,
  before?: number
): Promise<MessageResponse[]> {
  const params = new URLSearchParams({ limit: limit.toString() });
  if (before) {
    params.append("before", before.toString());
  }

  const response = await fetch(
    `${BASE_URL}/chats/${chatId}/messages?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${userId}`,
      },
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to load messages.");
  }

  return response.json();
}

/**
 * Leaves a chat.
 * DELETE /chats/{chatId}/participants/me
 */
export async function leaveChat(userId: number, chatId: number): Promise<void> {
  const response = await fetch(`${BASE_URL}/chats/${chatId}/participants/me`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${userId}`,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(errorText || "Failed to leave chat.");
  }
}
