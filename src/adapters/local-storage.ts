import type { OwnershipAdapter, PageOwner } from "../types";
import { StorageEventAction, dispatchStorageEvent } from "./util";

const STORAGE_KEY = "PageLock_page_owners";

interface LocalStorageAdapterOptions {
  /** Storage key prefix */
  prefix?: string;
}

export function createLocalStorageAdapter(
  options: LocalStorageAdapterOptions = {}
): OwnershipAdapter {
  const { prefix = "PageLock" } = options;
  const storageKey = `${prefix}_page_owners`;

  // Helper to get all owners from storage
  const getAllOwners = (): Record<string, PageOwner> => {

    if (typeof localStorage === "undefined") return {};
    const stored = localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  };

  // Helper to save owners to storage
  const saveOwners = (owners: Record<string, PageOwner>) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(owners));
  };

  return {
    getPageOwner: async (pageId) => {
      const owners = getAllOwners();
      return owners[pageId] || null;
    },

    getAllPageOwners: async () => {
      const owners = getAllOwners();
      dispatchStorageEvent({
        action: "getAllOwners",
        key: storageKey,
        newValue: JSON.stringify(owners),
        oldValue: JSON.stringify(owners),
        url: window.location.href,
        storageArea: window.localStorage,
      });
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
      dispatchStorageEvent({
        action: "lockPage",
        key: storageKey,
        newValue: JSON.stringify(owner),
        oldValue: JSON.stringify(owner),
        url: window.location.href,
        storageArea: window.localStorage,
      });

      return owner;
    },

    unlockPage: async (pageId, userId) => {
      const owners = getAllOwners();
      const owner = owners[pageId];

      if (!owner || (owner && owner.user_id === userId)) {
        delete owners[pageId];
        saveOwners(owners);
        dispatchStorageEvent({
          action: "unlockPage",
          key: storageKey,
          newValue: JSON.stringify(owner),
          oldValue: JSON.stringify(owner),
          url: window.location.href,
          storageArea: window.localStorage,
        });
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
      dispatchStorageEvent({
        action: "takePageOwnership",
        key: storageKey,
        newValue: JSON.stringify(owner),
        oldValue: JSON.stringify(owner),
        url: window.location.href,
        storageArea: window.localStorage,
      });

      return owner;
    },
  };
}
