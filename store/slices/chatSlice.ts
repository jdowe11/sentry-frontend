import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatResponse, MessageResponse } from "@/api/ChatApi";
import type { RootState } from "@/store/index";

export interface ChatState {
  activeChatId: number | null;
  activeChat: ChatResponse | null;
  chats: ChatResponse[];
  messagesByChatId: Record<number, MessageResponse[]>;
  isLoadingChats: boolean;
  isLoadingMessages: boolean;
  isSending: boolean;
}

const initialState: ChatState = {
  activeChatId: null,
  activeChat: null,
  chats: [],
  messagesByChatId: {},
  isLoadingChats: false,
  isLoadingMessages: false,
  isSending: false,
};

export const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setActiveChatId: (state, action: PayloadAction<number | null>) => {
      state.activeChatId = action.payload;
      if (action.payload === null) {
        state.activeChat = null;
      } else {
        const found = state.chats.find((c) => c.id === action.payload);
        if (found) {
          state.activeChat = found;
        }
      }
    },
    setActiveChat: (state, action: PayloadAction<ChatResponse | null>) => {
      state.activeChat = action.payload;
      state.activeChatId = action.payload?.id ?? null;
      if (action.payload) {
        const index = state.chats.findIndex((c) => c.id === action.payload!.id);
        if (index >= 0) {
          state.chats[index] = action.payload;
        } else {
          state.chats.unshift(action.payload);
        }
      }
    },
    setChats: (state, action: PayloadAction<ChatResponse[]>) => {
      state.chats = action.payload;
      if (state.activeChatId) {
        const active = action.payload.find((c) => c.id === state.activeChatId);
        if (active) {
          state.activeChat = active;
        }
      }
    },
    upsertChat: (state, action: PayloadAction<ChatResponse>) => {
      const index = state.chats.findIndex((c) => c.id === action.payload.id);
      if (index >= 0) {
        state.chats[index] = action.payload;
      } else {
        state.chats.unshift(action.payload);
      }
      if (state.activeChatId === action.payload.id) {
        state.activeChat = action.payload;
      }
    },
    setMessages: (
      state,
      action: PayloadAction<{ chatId: number; messages: MessageResponse[] }>
    ) => {
      state.messagesByChatId[action.payload.chatId] = action.payload.messages;
    },
    prependMessages: (
      state,
      action: PayloadAction<{ chatId: number; messages: MessageResponse[] }>
    ) => {
      const existing = state.messagesByChatId[action.payload.chatId] || [];
      const existingIds = new Set(existing.map((m) => m.id));
      const newUnique = action.payload.messages.filter((m) => !existingIds.has(m.id));
      state.messagesByChatId[action.payload.chatId] = [...newUnique, ...existing];
    },
    appendMessage: (
      state,
      action: PayloadAction<{ chatId: number; message: MessageResponse }>
    ) => {
      const { chatId, message } = action.payload;
      const existing = state.messagesByChatId[chatId] || [];
      if (!existing.some((m) => m.id === message.id)) {
        state.messagesByChatId[chatId] = [...existing, message];
      }

      // Update lastMessage in chat list
      const chatIndex = state.chats.findIndex((c) => c.id === chatId);
      if (chatIndex >= 0) {
        state.chats[chatIndex] = {
          ...state.chats[chatIndex],
          lastMessage: message,
        };
      }
      if (state.activeChat?.id === chatId) {
        state.activeChat = {
          ...state.activeChat,
          lastMessage: message,
        };
      }
    },
    setLoadingChats: (state, action: PayloadAction<boolean>) => {
      state.isLoadingChats = action.payload;
    },
    setLoadingMessages: (state, action: PayloadAction<boolean>) => {
      state.isLoadingMessages = action.payload;
    },
    setIsSending: (state, action: PayloadAction<boolean>) => {
      state.isSending = action.payload;
    },
    clearActiveChat: (state) => {
      state.activeChatId = null;
      state.activeChat = null;
    },
  },
});

export const {
  setActiveChatId,
  setActiveChat,
  setChats,
  upsertChat,
  setMessages,
  prependMessages,
  appendMessage,
  setLoadingChats,
  setLoadingMessages,
  setIsSending,
  clearActiveChat,
} = chatSlice.actions;

// Selectors
export const selectActiveChatId = (state: RootState) => state.chat.activeChatId;
export const selectActiveChat = (state: RootState) => state.chat.activeChat;
export const selectChats = (state: RootState) => state.chat.chats;
export const selectMessagesForChat = (chatId: number | null) => (state: RootState) =>
  chatId ? state.chat.messagesByChatId[chatId] || [] : [];
export const selectIsLoadingChats = (state: RootState) => state.chat.isLoadingChats;
export const selectIsLoadingMessages = (state: RootState) => state.chat.isLoadingMessages;
export const selectIsSending = (state: RootState) => state.chat.isSending;

export default chatSlice.reducer;
