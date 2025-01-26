"use client";
"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
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
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.tsx
var index_exports = {};
__export(index_exports, {
  OwnerBadge: () => owner_badge_default,
  OwnershipModal: () => OwnershipModal,
  OwnershipProvider: () => OwnershipProvider,
  createLocalStorageAdapter: () => createLocalStorageAdapter,
  usePageOwnership: () => usePageOwnership
});
module.exports = __toCommonJS(index_exports);

// src/components/ownership-modal.tsx
var import_navigation = require("next/navigation");

// src/hooks/use-page-ownership.tsx
var import_react2 = require("react");

// src/context/ownership-context.tsx
var import_react = require("react");
var import_jsx_runtime = require("react/jsx-runtime");
var OwnershipContext = (0, import_react.createContext)(null);
function OwnershipProvider({
  children,
  config
}) {
  const [user, setUser] = (0, import_react.useState)(null);
  (0, import_react.useEffect)(() => {
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
  return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(OwnershipContext.Provider, { value, children });
}
function useOwnershipContext() {
  const context = (0, import_react.useContext)(OwnershipContext);
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
  const [currentOwner, setCurrentOwner] = (0, import_react2.useState)(null);
  const [lockedPages, setLockedPages] = (0, import_react2.useState)();
  const [isAttemptingOwnership, setIsAttemptingOwnership] = (0, import_react2.useState)(false);
  const [isFetching, setIsFetching] = (0, import_react2.useState)(false);
  const [error, setError] = (0, import_react2.useState)(null);
  const isAttemptingOwnershipInternalRef = (0, import_react2.useRef)(false);
  const previousPageIdRef = (0, import_react2.useRef)(pageId);
  const currentOwnerRef = (0, import_react2.useRef)(null);
  const pollingIntervalRef = (0, import_react2.useRef)(
    pollingInterval || options.pollingInterval
  );
  const userId = (_a = user == null ? void 0 : user.id) != null ? _a : "";
  const userName = (_b = user == null ? void 0 : user.email) != null ? _b : "";
  const fetchLockedPages = (0, import_react2.useCallback)(async () => {
    try {
      const pages = await config.ownershipAdapter.getAllPageOwners();
      setLockedPages(pages);
    } catch (err) {
      console.error("Failed to fetch locked pages:", err);
    }
  }, [config.ownershipAdapter]);
  const takeOwnership = (0, import_react2.useCallback)(async () => {
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
  const fetchOwner = (0, import_react2.useCallback)(async () => {
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
  (0, import_react2.useEffect)(() => {
    fetchOwner();
    fetchLockedPages();
    const interval = setInterval(() => {
      fetchOwner();
      fetchLockedPages();
    }, pollingIntervalRef.current);
    return () => clearInterval(interval);
  }, [pageId, pollingIntervalRef.current]);
  const lockPage = (0, import_react2.useCallback)(async () => {
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
  (0, import_react2.useEffect)(() => {
    if (pageId !== previousPageIdRef.current) {
      if ((currentOwner == null ? void 0 : currentOwner.user_id) === userId) {
        unlockPage(previousPageIdRef.current);
      }
      previousPageIdRef.current = pageId;
    }
  }, [pageId]);
  (0, import_react2.useEffect)(() => {
    currentOwnerRef.current = currentOwner;
  }, [currentOwner]);
  (0, import_react2.useEffect)(() => {
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
var import_jsx_runtime2 = require("react/jsx-runtime");
function OwnershipModal({
  initialIsOpen,
  initialCurrentOwner,
  onCancel,
  cancelText,
  pageId
}) {
  const router = (0, import_navigation.useRouter)();
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
  return /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "absolute inset-0 bg-black/50 flex items-center justify-center", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("div", { className: "bg-white p-6 rounded-lg shadow-lg max-w-lg w-full", children: /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "space-y-4", children: [
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("h2", { className: "text-lg font-semibold", children: "Take Ownership" }),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("p", { className: "text-gray-600", children: (owner == null ? void 0 : owner.user_name) ? /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)(import_jsx_runtime2.Fragment, { children: [
        "This page is currently owned by",
        " ",
        /* @__PURE__ */ (0, import_jsx_runtime2.jsx)("strong", { children: owner.user_name }),
        ". Would you like to take ownership?"
      ] }) : /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(import_jsx_runtime2.Fragment, { children: "You are currently not the owner of this page. Would you like to take ownership?" }) })
    ] }),
    /* @__PURE__ */ (0, import_jsx_runtime2.jsxs)("div", { className: "flex justify-end space-x-2", children: [
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
        "button",
        {
          onClick: () => takeOwnership(),
          disabled: isFetching,
          className: "px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50",
          children: isAttemptingOwnership ? "Taking ownership..." : "Take Ownership"
        }
      ),
      /* @__PURE__ */ (0, import_jsx_runtime2.jsx)(
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
var import_react3 = require("react");
var useOwner = ({
  pageId,
  pollingInterval
}) => {
  const { config, options } = useOwnershipContext();
  const [owner, setOwner] = (0, import_react3.useState)(null);
  const [isFetching, setIsFetching] = (0, import_react3.useState)(false);
  const [error, setError] = (0, import_react3.useState)(null);
  const pollingIntervalRef = (0, import_react3.useRef)(
    pollingInterval || options.pollingInterval
  );
  const fetchOwner = (0, import_react3.useCallback)(async () => {
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
  (0, import_react3.useEffect)(() => {
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
var import_clsx = require("clsx");
var import_tailwind_merge = require("tailwind-merge");
function cn(...inputs) {
  return (0, import_tailwind_merge.twMerge)((0, import_clsx.clsx)(inputs));
}

// src/components/owner-badge.tsx
var import_jsx_runtime3 = require("react/jsx-runtime");
var OwnerBadge = ({ pageId, className }) => {
  const { owner, isFetching } = useOwner({ pageId });
  if (isFetching && !owner) {
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
    return /* @__PURE__ */ (0, import_jsx_runtime3.jsx)(
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
  return /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)(
    "div",
    {
      className: cn(
        "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-blue-50 text-blue-700 border border-blue-100",
        className
      ),
      children: [
        /* @__PURE__ */ (0, import_jsx_runtime3.jsx)("div", { className: "w-2 h-2 rounded-full bg-blue-500 animate-pulse" }),
        /* @__PURE__ */ (0, import_jsx_runtime3.jsxs)("span", { children: [
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
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  OwnerBadge,
  OwnershipModal,
  OwnershipProvider,
  createLocalStorageAdapter,
  usePageOwnership
});
//# sourceMappingURL=index.js.map