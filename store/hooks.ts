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
