export interface PageOwner {
  user_id: string;
  user_name: string;
  page_id: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name?: string;
}

export interface UserAdapter {
  /** Get the current user's information */
  getCurrentUser: () => Promise<User | null> | User | null;
  /** Subscribe to user changes */
  subscribe?: (callback: (user: User | null) => void) => () => void;
}

export interface OwnershipAdapter {
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

export interface ApiAdapter {
  /** Base URL for API endpoints */
  baseUrl?: string;
  /** Custom fetch implementation */
  fetch?: typeof fetch;
  /** Headers to include in API requests */
  headers?: HeadersInit;
  /** Transform API response */
  transformResponse?: <T>(response: Response) => Promise<T>;
}