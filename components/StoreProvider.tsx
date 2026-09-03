"use client";

import { useEffect, useState, ReactNode } from "react";
import { Provider } from "react-redux";
import { makeStore } from "@/store";
import { hydrateAuth } from "@/store/slices/authSlice";

export default function StoreProvider({ children }: { children: ReactNode }) {
  const [store] = useState(() => makeStore());

  // Hydrate session from localStorage on client mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const saved = localStorage.getItem("sentry_user");
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        store.dispatch(hydrateAuth(parsedUser));
      } catch {
        localStorage.removeItem("sentry_user");
        store.dispatch(hydrateAuth(null));
      }
    } else {
      store.dispatch(hydrateAuth(null));
    }
  }, [store]);

  return <Provider store={store}>{children}</Provider>;
}
