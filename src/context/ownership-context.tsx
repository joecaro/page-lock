import React, { createContext, useContext, useEffect, useState } from "react";
import type { User, UserAdapter, OwnershipAdapter, ApiAdapter } from "../types";

export interface OwnershipConfig {
  /** User state adapter */
  userAdapter: UserAdapter;
  /** Ownership operations adapter */
  ownershipAdapter: OwnershipAdapter;
  /** API adapter */
  apiAdapter?: ApiAdapter;
  options?: {
    /** Whether to use the local storage adapter */
    pollingInterval?: number;
  };
}

interface OwnershipConfigOptions {
  pollingInterval: number;
}

interface OwnershipContextValue {
  user: User | null;
  config: OwnershipConfig;
  options: OwnershipConfigOptions;
}

const OwnershipContext = createContext<OwnershipContextValue | null>(null);

export interface OwnershipProviderProps {
  children: React.ReactNode;
  config: OwnershipConfig;
}

export function OwnershipProvider({
  children,
  config,
}: OwnershipProviderProps) {
  const [user, setUser] = useState<User | null>(null);

  // Initialize and subscribe to user changes
  useEffect(() => {
    const initUser = async () => {
      const currentUser = await Promise.resolve(
        config.userAdapter.getCurrentUser()
      );
      setUser(currentUser);
    };
    initUser();

    // Subscribe to user changes if adapter provides subscription
    if (config.userAdapter.subscribe) {
      return config.userAdapter.subscribe(setUser);
    }
  }, [config.userAdapter]);

  const value: OwnershipContextValue = {
    user,
    config,
    options: {
      pollingInterval: 3000,
      ...config.options,
    },
  };

  return (
    <OwnershipContext.Provider value={value}>
      {children}
    </OwnershipContext.Provider>
  );
}

export function useOwnershipContext() {
  const context = useContext(OwnershipContext);
  if (!context) {
    throw new Error(
      "useOwnershipContext must be used within an OwnershipProvider"
    );
  }
  return context;
}
