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

export interface ApiStorageAdapterOptions {
  getAllOwners: jest.Mock<Promise<Record<string, PageOwner>>> | (() => Promise<Record<string, PageOwner>>);
  lockPage: jest.Mock<Promise<PageOwner>> | ((pageId: string, userId: string, userName: string) => Promise<PageOwner>);
  unlockPage: jest.Mock<Promise<void>> | ((pageId: string, userId: string) => Promise<void>);
  takePageOwnership: jest.Mock<Promise<PageOwner>> | ((pageId: string, userId: string, userName: string) => Promise<PageOwner>);
  storageKey: string;
}

export interface OwnershipAdapter {
  getAllPageOwners: () => Promise<Record<string, PageOwner>>;
  getPageOwner: (pageId: string) => Promise<PageOwner | null>;
  lockPage: (pageId: string, userId: string, userName: string) => Promise<PageOwner>;
  unlockPage: (pageId: string, userId: string) => Promise<void>;
  takePageOwnership: (pageId: string, userId: string, userName: string) => Promise<PageOwner>;
}

export interface UserAdapter {
  getCurrentUser: () => Promise<User>;
  subscribe?: (callback: (user: User | null) => void) => () => void;
}

export interface OwnershipConfig {
  userAdapter: UserAdapter;
  ownershipAdapter: OwnershipAdapter;
  options?: {
    pollingInterval?: number;
  };
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