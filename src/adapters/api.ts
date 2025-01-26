import type { OwnershipAdapter, PageOwner } from "../types";
import { dispatchStorageEvent, StorageEventAction } from "./util";

export interface ApiStorageAdapterOptions {
  getAllOwners: () => Promise<Record<string, PageOwner>>;
  lockPage: (
    pageId: string,
    userId: string,
    userName: string
  ) => Promise<PageOwner>;
  unlockPage: (pageId: string, userId: string) => Promise<void>;
  takePageOwnership: (
    pageId: string,
    userId: string,
    userName: string
  ) => Promise<PageOwner>;
  storageKey: string;
}

export function createApiStorageAdapter(options: ApiStorageAdapterOptions): OwnershipAdapter {
  const { getAllOwners, lockPage, unlockPage, takePageOwnership, storageKey } =
    options;

  return {
    getPageOwner: async (pageId) => {
      const owners = await getAllOwners();
      return owners[pageId] || null;
    },

    getAllPageOwners: async () => {
      const owners = await getAllOwners();
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

      await lockPage(pageId, userId, userName);
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
      const owner = await unlockPage(pageId, userId);
      dispatchStorageEvent({
        action: "unlockPage",
        key: storageKey,
        newValue: JSON.stringify(owner),
        oldValue: JSON.stringify(owner),
        url: window.location.href,
        storageArea: window.localStorage,
      });
    },

    takePageOwnership: async (pageId, userId, userName) => {
      const owner: PageOwner = {
        page_id: pageId,
        user_id: userId,
        user_name: userName,
        timestamp: Date.now(),
      };

      await takePageOwnership(pageId, userId, userName);

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
