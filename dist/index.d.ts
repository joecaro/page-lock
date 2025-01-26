import * as react_jsx_runtime from 'react/jsx-runtime';
import React from 'react';

interface PageOwner {
    user_id: string;
    user_name: string;
    page_id: string;
    timestamp: number;
}
interface User {
    id: string;
    email: string;
    name?: string;
}
interface UserAdapter {
    /** Get the current user's information */
    getCurrentUser: () => Promise<User | null> | User | null;
    /** Subscribe to user changes */
    subscribe?: (callback: (user: User | null) => void) => () => void;
}
interface OwnershipAdapter {
    /** Get the current owner of a page */
    getPageOwner: (pageId: string) => Promise<PageOwner | null>;
    /** Get all locked pages */
    getAllPageOwners: () => Promise<Record<string, PageOwner>>;
    /** Lock a page for a user */
    lockPage: (pageId: string, userId: string, userName: string) => Promise<PageOwner>;
    /** Unlock a page */
    unlockPage: (pageId: string, userId: string) => Promise<void>;
    /** Take ownership of a page */
    takePageOwnership: (pageId: string, userId: string, userName: string) => Promise<PageOwner>;
}
interface ApiAdapter {
    /** Base URL for API endpoints */
    baseUrl?: string;
    /** Custom fetch implementation */
    fetch?: typeof fetch;
    /** Headers to include in API requests */
    headers?: HeadersInit;
    /** Transform API response */
    transformResponse?: <T>(response: Response) => Promise<T>;
}

interface OwnershipModalProps {
    pageId: string;
    tenant?: string;
    onCancel?: () => void;
    cancelText?: string;
    initialIsOpen?: boolean;
    initialCurrentOwner?: PageOwner | null;
}
declare function OwnershipModal({ initialIsOpen, initialCurrentOwner, onCancel, cancelText, pageId, }: OwnershipModalProps): react_jsx_runtime.JSX.Element | null;

interface OwnerBadgeProps {
    pageId: string;
    className?: string;
}
declare const OwnerBadge: ({ pageId, className }: OwnerBadgeProps) => react_jsx_runtime.JSX.Element;

interface UsePageOwnershipProps {
    pageId: string;
    pollingInterval?: number;
}
interface UsePageOwnershipResult {
    currentOwner: PageOwner | null;
    isFetching: boolean;
    isAttemptingOwnership: boolean;
    error: string | null;
    isOwnedByCurrentUser: boolean;
    lockPage: () => void;
    unlockPage: () => void;
    takeOwnership: () => void;
    refreshOwnership: () => void;
    lockedPages: Record<string, PageOwner> | undefined;
}
declare const usePageOwnership: ({ pageId, pollingInterval, }: UsePageOwnershipProps) => UsePageOwnershipResult;

interface OwnershipConfig {
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
interface OwnershipProviderProps {
    children: React.ReactNode;
    config: OwnershipConfig;
}
declare function OwnershipProvider({ children, config, }: OwnershipProviderProps): react_jsx_runtime.JSX.Element;

interface LocalStorageAdapterOptions {
    /** Storage key prefix */
    prefix?: string;
}
type StorageEventAction = "getAllOwners" | "lockPage" | "unlockPage" | "takePageOwnership";
interface StorageEventDetails {
    action: StorageEventAction;
    key: string;
    newValue: string;
    oldValue: string;
    url: string;
    storageArea: Storage;
}
declare function createLocalStorageAdapter(options?: LocalStorageAdapterOptions): OwnershipAdapter;

export { OwnerBadge, type OwnershipAdapter, type OwnershipConfig, OwnershipModal, OwnershipProvider, type PageOwner, type StorageEventAction, type StorageEventDetails, type User, type UserAdapter, createLocalStorageAdapter, usePageOwnership };
