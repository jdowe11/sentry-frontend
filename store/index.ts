import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@/store/slices/authSlice";
import friendsReducer from "@/store/slices/friendsSlice";
import uiReducer from "@/store/slices/uiSlice";

export const makeStore = () => {
  return configureStore({
    reducer: {
      auth: authReducer,
      friends: friendsReducer,
      ui: uiReducer,
    },
    devTools: process.env.NODE_ENV !== "production",
  });
};

export type AppStore = ReturnType<typeof makeStore>;
export type RootState = ReturnType<AppStore["getState"]>;
export type AppDispatch = AppStore["dispatch"];
