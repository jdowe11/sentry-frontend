import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/index";

export type FriendTab = "online" | "all" | "pending" | "add-friend";

export interface FriendsState {
  activeTab: FriendTab;
  isAddFriendModalOpen: boolean;
  // Slots prepared for future real-time WebSocket events:
  // onlineUserIds: number[];
  // pendingRequestsCount: number;
}

const initialState: FriendsState = {
  activeTab: "online",
  isAddFriendModalOpen: false,
};

export const friendsSlice = createSlice({
  name: "friends",
  initialState,
  reducers: {
    setActiveTab: (state, action: PayloadAction<FriendTab>) => {
      state.activeTab = action.payload;
    },
    setAddFriendModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isAddFriendModalOpen = action.payload;
    },
    // Future real-time WebSocket actions can be added here cleanly:
    // e.g., friendRequestReceived, friendPresenceChanged, etc.
  },
});

export const { setActiveTab, setAddFriendModalOpen } = friendsSlice.actions;

// Selectors
export const selectActiveFriendTab = (state: RootState) => state.friends.activeTab;
export const selectIsAddFriendModalOpen = (state: RootState) => state.friends.isAddFriendModalOpen;

export default friendsSlice.reducer;
