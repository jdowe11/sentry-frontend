import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "@/store/index";

export interface UiState {
  isSidebarOpen: boolean;
  isUpdateProfileOpen: boolean;
}

const initialState: UiState = {
  isSidebarOpen: false,
  isUpdateProfileOpen: false,
};

export const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    setSidebarOpen: (state, action: PayloadAction<boolean>) => {
      state.isSidebarOpen = action.payload;
    },
    setUpdateProfileOpen: (state, action: PayloadAction<boolean>) => {
      state.isUpdateProfileOpen = action.payload;
    },
  },
});

export const { setSidebarOpen, setUpdateProfileOpen } = uiSlice.actions;

// Selectors
export const selectIsSidebarOpen = (state: RootState) => state.ui.isSidebarOpen;
export const selectIsUpdateProfileOpen = (state: RootState) => state.ui.isUpdateProfileOpen;

export default uiSlice.reducer;
