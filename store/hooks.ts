import { useCallback } from "react";
import { TypedUseSelectorHook, useDispatch, useSelector, useStore } from "react-redux";
import type { AppDispatch, AppStore, RootState } from "@/store/index";
import {
  setCredentials,
  logout as logoutAction,
  updateUser as updateUserAction,
  selectCurrentUser,
  selectIsAuthenticated,
  selectAuthLoading,
} from "@/store/slices/authSlice";
import { User } from "@/api/UserApi";

import {
  setActiveChat,
  setActiveChatId,
  clearActiveChat,
  setChats,
  setMessages,
  appendMessage,
  setLoadingChats,
  setLoadingMessages,
  setIsSending,
  selectActiveChatId,
  selectActiveChat,
  selectChats,
  selectMessagesForChat,
  selectIsLoadingChats,
  selectIsLoadingMessages,
  selectIsSending,
} from "@/store/slices/chatSlice";
import {
  ChatResponse,
  MessageResponse,
  getUserChats,
  getChatMessages,
  sendMessage as apiSendMessage,
} from "@/api/ChatApi";

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export const useAppStore: () => AppStore = useStore;

/**
 * Convenience hook providing reactive auth state and actions backed by Redux.
 */
export function useAuth() {
  const dispatch = useAppDispatch();
  const user = useAppSelector(selectCurrentUser);
  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const isLoading = useAppSelector(selectAuthLoading);

  const login = useCallback(
    (loggedInUser: User) => {
      dispatch(setCredentials(loggedInUser));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    dispatch(clearActiveChat());
  }, [dispatch]);

  const updateUser = useCallback(
    (updatedUser: User) => {
      dispatch(updateUserAction(updatedUser));
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    updateUser,
  };
}

/**
 * Convenience hook providing chat state and dispatch actions.
 */
export function useChat() {
  const dispatch = useAppDispatch();
  const { user } = useAuth();
  const activeChatId = useAppSelector(selectActiveChatId);
  const activeChat = useAppSelector(selectActiveChat);
  const chats = useAppSelector(selectChats);
  const activeMessages = useAppSelector(selectMessagesForChat(activeChatId));
  const isLoadingChats = useAppSelector(selectIsLoadingChats);
  const isLoadingMessages = useAppSelector(selectIsLoadingMessages);
  const isSending = useAppSelector(selectIsSending);

  const openChat = useCallback(
    (chat: ChatResponse) => {
      dispatch(setActiveChat(chat));
    },
    [dispatch]
  );

  const setChatId = useCallback(
    (chatId: number | null) => {
      dispatch(setActiveChatId(chatId));
    },
    [dispatch]
  );

  const closeChat = useCallback(() => {
    dispatch(clearActiveChat());
  }, [dispatch]);

  const fetchUserChats = useCallback(async () => {
    if (!user) return [];
    dispatch(setLoadingChats(true));
    try {
      const data = await getUserChats(user.id);
      dispatch(setChats(data));
      return data;
    } finally {
      dispatch(setLoadingChats(false));
    }
  }, [user, dispatch]);

  const fetchChatMessages = useCallback(
    async (chatId: number) => {
      if (!user) return [];
      dispatch(setLoadingMessages(true));
      try {
        const data = await getChatMessages(user.id, chatId);
        dispatch(setMessages({ chatId, messages: data }));
        return data;
      } finally {
        dispatch(setLoadingMessages(false));
      }
    },
    [user, dispatch]
  );

  const sendChatMessage = useCallback(
    async (chatId: number, ciphertext: string) => {
      if (!user) throw new Error("Not authenticated");
      dispatch(setIsSending(true));
      try {
        const sentMessage = await apiSendMessage(user.id, chatId, ciphertext);
        dispatch(appendMessage({ chatId, message: sentMessage }));
        return sentMessage;
      } finally {
        dispatch(setIsSending(false));
      }
    },
    [user, dispatch]
  );

  const pushMessage = useCallback(
    (chatId: number, message: MessageResponse) => {
      dispatch(appendMessage({ chatId, message }));
    },
    [dispatch]
  );

  return {
    activeChatId,
    activeChat,
    chats,
    activeMessages,
    isLoadingChats,
    isLoadingMessages,
    isSending,
    openChat,
    setChatId,
    closeChat,
    fetchUserChats,
    fetchChatMessages,
    sendChatMessage,
    pushMessage,
  };
}

