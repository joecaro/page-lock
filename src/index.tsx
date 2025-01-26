export { default as OwnershipModal } from './components/ownership-modal';
export { default as OwnerBadge } from './components/owner-badge';
export { usePageOwnership } from './hooks/use-page-ownership';
export { OwnershipProvider } from './context/ownership-context';
export { createLocalStorageAdapter } from './adapters/local-storage';
export type { StorageEventAction, StorageEventDetails } from './adapters/local-storage';
export type { PageOwner, User, UserAdapter, OwnershipAdapter } from './types';
export type { OwnershipConfig } from './context/ownership-context';
