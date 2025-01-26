"use client";
var __defProp = Object.defineProperty;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};

// src/components/ownership-modal.tsx
import { useRouter } from "next/navigation";

// src/hooks/use-page-ownership.tsx
import { useCallback, useEffect as useEffect2, useRef, useState as useState2 } from "react";

// src/context/ownership-context.tsx
import { createContext, useContext, useEffect, useState } from "react";
import { jsx } from "react/jsx-runtime";
var OwnershipContext = createContext(null);
function OwnershipProvider({
  children,
  config
}) {
  const [user, setUser] = useState(null);
  useEffect(() => {
    const initUser = async () => {
      const currentUser = await Promise.resolve(
        config.userAdapter.getCurrentUser()
      );
      setUser(currentUser);
    };
    initUser();
    if (config.userAdapter.subscribe) {
      return config.userAdapter.subscribe(setUser);
    }
  }, [config.userAdapter]);
  const value = {
    user,
    config,
    options: __spreadValues({
      pollingInterval: 3e3
    }, config.options)
  };
  return /* @__PURE__ */ jsx(OwnershipContext.Provider, { value, children });
}
function useOwnershipContext() {
  const context = useContext(OwnershipContext);
  if (!context) {
    throw new Error(
      "useOwnershipContext must be used within an OwnershipProvider"
    );
  }
  return context;
}

// src/hooks/use-page-ownership.tsx
var usePageOwnership = ({
  pageId,
  pollingInterval
}) => {
  var _a, _b;
  const { user, config, options } = useOwnershipContext();
  const [currentOwner, setCurrentOwner] = useState2(null);
  const [lockedPages, setLockedPages] = useState2();
  const [isAttemptingOwnership, setIsAttemptingOwnership] = useState2(false);
  const [isFetching, setIsFetching] = useState2(false);
  const [error, setError] = useState2(null);
  const isAttemptingOwnershipInternalRef = useRef(false);
  const previousPageIdRef = useRef(pageId);
  const currentOwnerRef = useRef(null);
  const pollingIntervalRef = useRef(
    pollingInterval || options.pollingInterval
  );
  const userId = (_a = user == null ? void 0 : user.id) != null ? _a : "";
  const userName = (_b = user == null ? void 0 : user.email) != null ? _b : "";
  const fetchLockedPages = useCallback(async () => {
    try {
      const pages = await config.ownershipAdapter.getAllPageOwners();
      setLockedPages(pages);
    } catch (err) {
      console.error("Failed to fetch locked pages:", err);
    }
  }, [config.ownershipAdapter]);
  const takeOwnership = useCallback(async () => {
    console.log("takeOwnership", isAttemptingOwnershipInternalRef.current);
    if (isAttemptingOwnershipInternalRef.current) return;
    try {
      isAttemptingOwnershipInternalRef.current = true;
      setIsAttemptingOwnership(true);
      setError(null);
      const owner = await config.ownershipAdapter.takePageOwnership(
        pageId,
        userId,
        userName
      );
      setCurrentOwner(owner);
      await fetchLockedPages();
    } catch (err) {
      setError(String(err));
    } finally {
      isAttemptingOwnershipInternalRef.current = false;
      setIsAttemptingOwnership(false);
    }
  }, [config.ownershipAdapter, pageId, userId, userName]);
  const fetchOwner = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const owner = await config.ownershipAdapter.getPageOwner(pageId);
      setCurrentOwner(
        (prev) => !!prev && prev.user_id === (owner == null ? void 0 : owner.user_id) ? prev : owner
      );
      if (!owner && !isAttemptingOwnershipInternalRef.current) {
        try {
          await takeOwnership();
        } catch (err) {
          setError(String(err));
        }
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setIsFetching(false);
    }
  }, [config.ownershipAdapter, pageId, takeOwnership]);
  useEffect2(() => {
    fetchOwner();
    fetchLockedPages();
    const interval = setInterval(() => {
      fetchOwner();
      fetchLockedPages();
    }, pollingIntervalRef.current);
    return () => clearInterval(interval);
  }, [pageId, pollingIntervalRef.current]);
  const lockPage = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const owner = await config.ownershipAdapter.lockPage(
        pageId,
        userId,
        userName
      );
      setCurrentOwner(owner);
      await fetchLockedPages();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsFetching(false);
    }
  }, [config.ownershipAdapter, pageId, userId, userName]);
  const unlockPage = async (page) => {
    try {
      setIsFetching(true);
      setError(null);
      await config.ownershipAdapter.unlockPage(page || pageId, userId);
      setCurrentOwner(null);
      await fetchLockedPages();
    } catch (err) {
      setError(String(err));
    } finally {
      setIsFetching(false);
    }
  };
  useEffect2(() => {
    if (pageId !== previousPageIdRef.current) {
      if ((currentOwner == null ? void 0 : currentOwner.user_id) === userId) {
        unlockPage(previousPageIdRef.current);
      }
      previousPageIdRef.current = pageId;
    }
  }, [pageId]);
  useEffect2(() => {
    currentOwnerRef.current = currentOwner;
  }, [currentOwner]);
  useEffect2(() => {
    return () => {
      var _a2;
      if (previousPageIdRef.current && ((_a2 = currentOwnerRef.current) == null ? void 0 : _a2.user_id) === userId) {
        unlockPage(previousPageIdRef.current);
      }
    };
  }, []);
  return {
    currentOwner,
    isFetching,
    isAttemptingOwnership,
    error,
    isOwnedByCurrentUser: (currentOwner == null ? void 0 : currentOwner.user_id) === userId,
    lockPage,
    unlockPage,
    takeOwnership,
    refreshOwnership: fetchOwner,
    lockedPages
  };
};

// src/components/ownership-modal.tsx
import { Fragment, jsx as jsx2, jsxs } from "react/jsx-runtime";
function OwnershipModal({
  initialIsOpen,
  initialCurrentOwner,
  onCancel,
  cancelText,
  pageId
}) {
  const router = useRouter();
  const onClose = () => {
    onCancel ? onCancel() : router.back();
  };
  const {
    takeOwnership,
    isOwnedByCurrentUser,
    currentOwner: redisOwner,
    isFetching,
    isAttemptingOwnership
  } = usePageOwnership({
    pageId
  });
  const owner = redisOwner || initialCurrentOwner;
  const isOpen = (owner == null ? void 0 : owner.user_name) ? !isOwnedByCurrentUser : initialIsOpen;
  if (!isOpen) return null;
  return /* @__PURE__ */ jsx2("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: /* @__PURE__ */ jsx2("div", { className: "bg-white p-6 rounded-lg shadow-lg max-w-lg w-full", children: /* @__PURE__ */ jsxs("div", { className: "space-y-4", children: [
    /* @__PURE__ */ jsxs("div", { children: [
      /* @__PURE__ */ jsx2("h2", { className: "text-lg font-semibold", children: "Take Ownership" }),
      /* @__PURE__ */ jsx2("p", { className: "text-gray-600", children: (owner == null ? void 0 : owner.user_name) ? /* @__PURE__ */ jsxs(Fragment, { children: [
        "This page is currently owned by",
        " ",
        /* @__PURE__ */ jsx2("strong", { children: owner.user_name }),
        ". Would you like to take ownership?"
      ] }) : /* @__PURE__ */ jsx2(Fragment, { children: "You are currently not the owner of this page. Would you like to take ownership?" }) })
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "flex justify-end space-x-2", children: [
      /* @__PURE__ */ jsx2(
        "button",
        {
          onClick: () => takeOwnership(),
          disabled: isFetching,
          className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50",
          children: isAttemptingOwnership ? "Taking ownership..." : "Take Ownership"
        }
      ),
      /* @__PURE__ */ jsx2(
        "button",
        {
          onClick: onClose,
          className: "px-4 py-2 border border-gray-300 rounded hover:bg-gray-50",
          children: cancelText || "Cancel"
        }
      )
    ] })
  ] }) }) });
}

// src/hooks/use-owner.tsx
import { useCallback as useCallback2, useEffect as useEffect3, useRef as useRef2, useState as useState3 } from "react";
var useOwner = ({
  pageId,
  pollingInterval
}) => {
  const { config, options } = useOwnershipContext();
  const [owner, setOwner] = useState3(null);
  const [isFetching, setIsFetching] = useState3(false);
  const [error, setError] = useState3(null);
  const pollingIntervalRef = useRef2(
    pollingInterval || options.pollingInterval
  );
  const fetchOwner = useCallback2(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const currentOwner = await config.ownershipAdapter.getPageOwner(pageId);
      setOwner(currentOwner);
    } catch (err) {
      setError(String(err));
    } finally {
      setIsFetching(false);
    }
  }, [config.ownershipAdapter, pageId]);
  useEffect3(() => {
    fetchOwner();
    const interval = setInterval(() => {
      fetchOwner();
    }, pollingInterval);
    return () => clearInterval(interval);
  }, [pageId, pollingInterval, fetchOwner]);
  return {
    owner,
    isFetching,
    error,
    refreshOwner: fetchOwner
  };
};

// src/utils.ts
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// src/components/owner-badge.tsx
import { jsx as jsx3, jsxs as jsxs2 } from "react/jsx-runtime";
var OwnerBadge = ({ pageId, className }) => {
  const { owner, isFetching } = useOwner({ pageId });
  if (isFetching && !owner) {
    return /* @__PURE__ */ jsx3(
      "div",
      {
        className: cn(
          "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-gray-100 text-gray-500 animate-pulse",
          className
        ),
        children: "Loading..."
      }
    );
  }
  if (!owner) {
    return /* @__PURE__ */ jsx3(
      "div",
      {
        className: cn(
          "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-gray-100 text-gray-500",
          className
        ),
        children: "No active owner"
      }
    );
  }
  return /* @__PURE__ */ jsxs2(
    "div",
    {
      className: cn(
        "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-blue-50 text-blue-700 border border-blue-100",
        className
      ),
      children: [
        /* @__PURE__ */ jsx3("div", { className: "w-2 h-2 rounded-full bg-blue-500 animate-pulse" }),
        /* @__PURE__ */ jsxs2("span", { children: [
          "Owned by ",
          owner.user_name
        ] })
      ]
    }
  );
};
var owner_badge_default = OwnerBadge;

// src/adapters/local-storage.ts
function createLocalStorageAdapter(options = {}) {
  const { prefix = "locksmith" } = options;
  const storageKey = `${prefix}_page_owners`;
  const getAllOwners = () => {
    if (typeof window === "undefined") return {};
    const stored = window.localStorage.getItem(storageKey);
    return stored ? JSON.parse(stored) : {};
  };
  const saveOwners = (owners) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(storageKey, JSON.stringify(owners));
  };
  const dispatchStorageEvent = (action, value) => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(
      new CustomEvent("storage-event", {
        detail: {
          action,
          key: storageKey,
          newValue: JSON.stringify(value),
          oldValue: JSON.stringify(value),
          url: window.location.href,
          storageArea: window.localStorage
        }
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
      const owner = {
        page_id: pageId,
        user_id: userId,
        user_name: userName,
        timestamp: Date.now()
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
      if (!owner || owner && owner.user_id === userId) {
        delete owners[pageId];
        saveOwners(owners);
        dispatchStorageEvent("unlockPage", { pageId, userId });
      } else {
        throw new Error("Not authorized to unlock this page");
      }
    },
    takePageOwnership: async (pageId, userId, userName) => {
      const owner = {
        page_id: pageId,
        user_id: userId,
        user_name: userName,
        timestamp: Date.now()
      };
      const owners = getAllOwners();
      owners[pageId] = owner;
      saveOwners(owners);
      dispatchStorageEvent("takePageOwnership", owner);
      return owner;
    }
  };
}
export {
  owner_badge_default as OwnerBadge,
  OwnershipModal,
  OwnershipProvider,
  createLocalStorageAdapter,
  usePageOwnership
};
//# sourceMappingURL=index.mjs.map