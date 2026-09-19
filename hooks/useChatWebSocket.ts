"use client";

import { useEffect, useRef, useCallback } from "react";
import { Client, StompSubscription } from "@stomp/stompjs";
import { useAppDispatch } from "@/store/hooks";
import { appendMessage } from "@/store/slices/chatSlice";
import { MessageResponse } from "@/api/ChatApi";
import { BASE_URL } from "@/api/config";

function getWebSocketUrl(): string {
  try {
    const url = new URL(BASE_URL);
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${url.host}/ws`;
  } catch {
    return "ws://localhost:8080/ws";
  }
}

/**
 * Hook to manage real-time STOMP WebSocket connection and subscriptions for active chats.
 */
export function useChatWebSocket(activeChatId: number | null) {
  const dispatch = useAppDispatch();
  const clientRef = useRef<Client | null>(null);
  const subscriptionRef = useRef<StompSubscription | null>(null);
  const isConnectedRef = useRef(false);

  const subscribeToChat = useCallback(
    (chatId: number) => {
      if (!clientRef.current || !isConnectedRef.current) return;

      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }

      const topic = `/topic/chats/${chatId}`;
      subscriptionRef.current = clientRef.current.subscribe(topic, (message) => {
        try {
          const received: MessageResponse = JSON.parse(message.body);
          dispatch(
            appendMessage({
              chatId: received.chatId || chatId,
              message: received,
            })
          );
        } catch (err) {
          console.error("Failed to parse incoming WebSocket message:", err);
        }
      });
    },
    [dispatch]
  );

  // Initialize STOMP client
  useEffect(() => {
    const wsUrl = getWebSocketUrl();

    const client = new Client({
      brokerURL: wsUrl,
      reconnectDelay: 4000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        isConnectedRef.current = true;
        if (activeChatId) {
          subscribeToChat(activeChatId);
        }
      },
      onDisconnect: () => {
        isConnectedRef.current = false;
        subscriptionRef.current = null;
      },
      onStompError: (frame) => {
        console.warn("STOMP protocol error:", frame.headers["message"]);
      },
      onWebSocketError: (event) => {
        console.warn("WebSocket transport error:", event);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
        subscriptionRef.current = null;
      }
      client.deactivate();
      clientRef.current = null;
      isConnectedRef.current = false;
    };
  }, [activeChatId, subscribeToChat]);

  // When activeChatId changes, re-subscribe
  useEffect(() => {
    if (activeChatId && isConnectedRef.current) {
      subscribeToChat(activeChatId);
    } else if (!activeChatId && subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
  }, [activeChatId, subscribeToChat]);
}
