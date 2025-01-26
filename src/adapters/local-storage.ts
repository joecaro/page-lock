import type { OwnershipAdapter, PageOwner } from "../types";

const STORAGE_KEY = "locksmith_page_owners";

interface LocalStorageAdapterOptions {
  /** Storage key prefix */
  prefix?: string;
}

export type StorageEventAction =
  | "getAllOwners"
  | "lockPage"
  | "unlockPage"
  | "takePageOwnership";

export interface StorageEventDetails {
  action: StorageEventAction;
  key: string;
  newValue: string;
  oldValue: string;
  url: string;
  storageArea: Storage;
}

export function createLocalStorageAdapter(
  options: LocalStorageAdapterOptions = {}
): OwnershipAdapter {
  const { prefix = "locksmith" } = options;
  const storageKey = `${prefix}_page_owners`;

  // Helper to get all owners from storage
  const getAllOwners = (): Record<string, PageOwner> => {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  };

  // Helper to save owners to storage
  const saveOwners = (owners: Record<string, PageOwner>) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(owners));
  };

  // Helper to dispatch storage events
  const dispatchStorageEvent = (action: StorageEventAction, value: any) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("storage-event", {
        detail: {
          action,
          key: storageKey,
          newValue: JSON.stringify(value),
          oldValue: JSON.stringify(value),
          url: window.location.href,
          storageArea: window.localStorage,
        },
      })
    );
  };

  return {
    getPageOwner: async (pageId) => {
      const owners = getAllOwners();
      return owners[pageId] || null;
    },

    getAllPageOwners: async () => {
      const owners = getAllOwners();
      dispatchStorageEvent("getAllOwners", owners);
      return owners;
    },

    lockPage: async (pageId, userId, userName) => {
      const owner: PageOwner = {
        page_id: pageId,
        user_id: userId,
        user_name: userName,
        timestamp: Date.now(),
      };

      const owners = getAllOwners();
      owners[pageId] = owner;
      saveOwners(owners);
      dispatchStorageEvent("lockPage", owner);

      return owner;
    },

    unlockPage: async (pageId, userId) => {
      const owners = getAllOwners();
      const owner = owners[pageId];

      if (!owner || (owner && owner.user_id === userId)) {
        delete owners[pageId];
        saveOwners(owners);
        dispatchStorageEvent("unlockPage", { pageId, userId });
      } else {
        throw new Error("Not authorized to unlock this page");
      }
    },

    takePageOwnership: async (pageId, userId, userName) => {
      const owner: PageOwner = {
        page_id: pageId,
        user_id: userId,
        user_name: userName,
        timestamp: Date.now(),
      };

      const owners = getAllOwners();
      owners[pageId] = owner;
      saveOwners(owners);
      dispatchStorageEvent("takePageOwnership", owner);

      return owner;
    },
  };
}
