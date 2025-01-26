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

export function dispatchStorageEvent(details: StorageEventDetails) {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent("storage-event", { detail: details }));
}
