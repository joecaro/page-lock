# 🔒 Page Lock

![Screen Recording 2025-01-26 at 10 53 11 AM (1)](https://github.com/user-attachments/assets/6fb8b5df-efea-4994-a4da-8103c0caac5c)

A React library for elegant page ownership management in modern web applications. Page Lock provides a simple way to manage page ownership and locking in real-time React applications.

## Features

- 🔐 Real-time page ownership tracking
- 🔄 Automatic ownership transfer
- 🌐 Client-side state management
- 🎨 Beautiful UI components with Tailwind CSS
- 📱 Mobile-friendly design
- 🎯 TypeScript support
- 🔍 Built-in ownership monitoring
- 🚀 Next.js ready
- ⚛️ Built for React applications

## Installation

```bash
npm install @joecarot/page-lock
```

## Quick Start

```tsx
import {
  OwnershipProvider,
  createApiStorageAdapter
} from '@joecarot/page-lock';

// Create a adapter for fetching and saving ownership state
const ownershipAdapter = createApiStorageAdapter({
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
});

// Create a user adapter
const userAdapter = {
  getCurrentUser: () => Promise<User>,
};

// Create the config
const config = {
  userAdapter,
  ownershipAdapter,
  options: {
    pollingInterval: 3000, // Optional: customize polling interval
  },
};

// Wrap your app with the provider
function App() {
  return (
    <OwnershipProvider config={config}>
      <YourPages />
    </OwnershipProvider>
  );
}
```

## Components

### Using the Component Approach

The `OwnerBadge` and `OwnershipModal` components are used to display and manage page ownership. This is the recommended approach for most applications. The `OwnershipModal` will automatically handle the ownership transfer flow on mount, and release the page ownership when the modal is unmounted.

```tsx
import { OwnerBadge, OwnershipModal } from '@joecarot/page-lock';

function RecordView({ recordId }) {
  return (
    <div>
      {/* Simple ownership badge */}
      <OwnerBadge pageId={`record-${recordId}`} />

      {/* Ownership modal with built-in management */}
      <OwnershipModal
        pageId={`record-${recordId}`}
        initialIsOpen={true}
        onCancel={() => {}}
        cancelText="Close"
      />
    </div>
  );
}
```

### Using the Hook Approach

The `usePageOwnership` hook is used to manage page ownership. This has more fine-grained control over the ownership state, but requires more manual handling of the ownership flow.

```tsx
import { usePageOwnership } from '@joecarot/page-lock';

function RecordView({ recordId }) {
  const {
    currentOwner,
    isOwnedByCurrentUser,
    lockPage,
    unlockPage,
    takeOwnership,
    isFetching,
    error,
  } = usePageOwnership({
    pageId: `record-${recordId}`,
  });

  return (
    <div>
      {/* Ownership Status */}
      {currentOwner ? (
        <div className="flex items-center space-x-2">
          <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
            Locked by {currentOwner.user_name}
          </span>
          {isOwnedByCurrentUser ? (
            <button onClick={unlockPage} disabled={isFetching}>
              Release Lock
            </button>
          ) : (
            <button onClick={takeOwnership} disabled={isFetching}>
              Take Over
            </button>
          )}
        </div>
      ) : (
        <button onClick={lockPage} disabled={isFetching}>
          Lock Record
        </button>
      )}

      {/* Error Handling */}
      {error && (
        <div className="mt-4 p-2 bg-red-50 text-red-500 rounded">
          Error: {error}
        </div>
      )}
    </div>
  );
}
```

## API Reference

### Hooks

#### `usePageOwnership`

```tsx
const {
  currentOwner, // Current page owner
  isOwnedByCurrentUser, // Whether current user owns the page
  lockPage, // Function to lock the page
  unlockPage, // Function to unlock the page
  takeOwnership, // Function to take ownership
  isFetching, // Loading state
  error, // Error state
  refreshOwnership, // Function to refresh ownership
  lockedPages, // All locked pages
} = usePageOwnership({
  pageId, // Unique page identifier
  pollingInterval, // Optional: Polling interval in ms (default: 3000)
});
```

#### `useOwner`

```tsx
const {
  owner, // Current page owner
  isFetching, // Loading state
  error, // Error state
  refreshOwner, // Function to refresh owner
} = useOwner({
  pageId, // Unique page identifier
  pollingInterval, // Optional: Polling interval in ms
});
```

### Components

#### `OwnershipProvider`

Provider component that manages ownership state.

```tsx
<OwnershipProvider config={config}>{children}</OwnershipProvider>
```

#### `OwnerBadge`

A simple badge component that displays the current owner.

```tsx
<OwnerBadge
  pageId="page-id"
  className="custom-class" // Optional: custom styling
/>
```

#### `OwnershipModal`

Modal component for handling ownership transfers.

```tsx
<OwnershipModal
  pageId="page-id"
  initialIsOpen={true}
  onCancel={() => {}}
  cancelText="Cancel"
/>
```

### Adapters

#### `createApiStorageAdapter`

Creates an adapter that uses an API for ownership state. Useful for testing functionality in isolation.

```tsx
const adapter = createApiStorageAdapter({
  getAllOwners: () => Promise<Record<string, PageOwner>>,
  lockPage: (pageId: string, userId: string, userName: string) => Promise<PageOwner>,
  unlockPage: (pageId: string, userId: string) => Promise<void>,
  takePageOwnership: (pageId: string, userId: string, userName: string) => Promise<PageOwner>,
  storageKey: "my-app", // Optional storage key prefix
});
```

### Types

```tsx
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

interface OwnershipConfig {
  userAdapter: UserAdapter;
  ownershipAdapter: OwnershipAdapter;
  options?: {
    pollingInterval?: number;
  };
}
```

#### `createLocalStorageAdapter`

Creates an adapter that uses localStorage for ownership state.

```tsx
const adapter = createLocalStorageAdapter({
  prefix: "my-app", // Optional storage key prefix
});
```

### Types

```tsx
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

interface OwnershipConfig {
  userAdapter: UserAdapter;
  ownershipAdapter: OwnershipAdapter;
  options?: {
    pollingInterval?: number;
  };
}
```

## Real-World Example

Check out the `examples` directory for a complete demo application showcasing:

- Real-time ownership tracking
- Multiple user simulation
- Console monitoring
- Different implementation approaches (hooks vs components)
- Ownership transfer flows
- Error handling

## Contributing

We welcome contributions! Please see our contributing guide for details.

## License

MIT © [Joe Carothers](https://josephcarothers.com)
