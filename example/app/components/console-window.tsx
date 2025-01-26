"use client";

import { cn } from "@/lib/utils";
import {
  StorageEventAction,
  StorageEventDetails,
} from "@joecarot/page-lock";
import { useEffect, useLayoutEffect, useState, useRef } from "react";

interface ConsoleEntry {
  id: number;
  timestamp: number;
  message: string;
  action: StorageEventAction;
  type: "info" | "success" | "error";
}

export function ConsoleWindow() {
  const [entries, setEntries] = useState<ConsoleEntry[]>([]);
  const [localStorageData, setLocalStorageData] = useState<string>("");

  // Function to add a new console entry
  const addEntry = (
    e: CustomEvent<StorageEventDetails>,
    message: string,
    type: ConsoleEntry["type"] = "info"
  ) => {
    setEntries((prev) => [
      ...prev,
      {
        id: e.timeStamp,
        timestamp: Date.now(),
        message,
        action: e.detail.action,
        type,
      },
    ]);
  };

  // Function to update local storage data display
  const updateLocalStorageData = () => {
    const data = localStorage.getItem("page:ownership_page_owners");
    setLocalStorageData(
      data ? JSON.stringify(JSON.parse(data), null, 2) : "No data"
    );
  };

  // Update local storage data periodically
  useEffect(() => {
    updateLocalStorageData();
    const interval = setInterval(updateLocalStorageData, 1000);
    return () => clearInterval(interval);
  }, []);

  // Listen for storage events
  useEffect(() => {
    const handleStorageChange = (e: CustomEvent<StorageEventDetails>) => {
      if (e.detail.key?.includes("page:ownership_page_owners")) {
        updateLocalStorageData();
        addEntry(e, `Local storage updated:`, "info");
      }
    };

    window.addEventListener(
      "storage-event",
      handleStorageChange as EventListener
    );
    return () =>
      window.removeEventListener(
        "storage-event",
        handleStorageChange as EventListener
      );
  }, []);

  return (
    <div className="border rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 col-span-2">
      {/* Console header */}
      <div className="bg-gray-100 dark:bg-gray-700 border-b p-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <span className="text-sm font-mono">PageLock Console</span>
        </div>
        <button
          onClick={() => setEntries([])}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          Clear
        </button>
      </div>

      {/* Console content */}
      <div className="grid grid-cols-2 divide-x h-64">
        {/* Console logs */}
        <div className="relative h-full">
          <Logs entries={entries} />
        </div>
        {/* Local storage data */}
        <div className="overflow-auto p-2 font-mono text-sm bg-gray-50 dark:bg-gray-900">
          <div className="text-xs text-gray-500 mb-1">Local Storage Data:</div>
          <pre className="text-gray-600 whitespace-pre-wrap">
            {localStorageData}
          </pre>
        </div>
      </div>
    </div>
  );
}

function Logs({ entries }: { entries: ConsoleEntry[] }) {
  const [isAtBottom, setIsAtBottom] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const previousLengthRef = useRef(entries.length);
  const isAutoScrollingRef = useRef(false);

  useLayoutEffect(() => {
    if (entries.length > previousLengthRef.current && containerRef.current && isAtBottom) {
      isAutoScrollingRef.current = true;
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
      // Reset the auto-scrolling flag after animation
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    }
    previousLengthRef.current = entries.length;
  }, [entries, isAtBottom]);

  const handleScroll = () => {
    if (containerRef.current && !isAutoScrollingRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isBottom = scrollHeight - scrollTop - clientHeight < 20;
      if (isAutoScrollingRef.current) {
        setIsAtBottom(true);
      } else {
        setIsAtBottom(isBottom);
      }
    }
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      isAutoScrollingRef.current = true;
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: "smooth",
      });
      setIsAtBottom(true);
      // Reset the auto-scrolling flag after animation
      setTimeout(() => {
        isAutoScrollingRef.current = false;
      }, 100);
    }
  };

  return (
    <div className="absolute inset-0">
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="absolute inset-0 overflow-auto p-2 font-mono text-sm"
      >
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`mb-1 ${entry.type === "error"
                ? "text-red-600"
                : entry.type === "success"
                  ? "text-green-600"
                  : "text-gray-600"
              }`}
          >
            <span className="text-gray-400">
              {new Date(entry.timestamp).toLocaleTimeString()} &gt;
            </span>{" "}
            {entry.message}
            <span
              className={cn(
                "text-xs px-1 py-0.5 rounded-md",
                entry.action === "lockPage"
                  ? "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
                  : entry.action === "unlockPage"
                    ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                    : entry.action === "takePageOwnership"
                      ? "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
                      : "bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
              )}
            >
              {entry.action}
            </span>
          </div>
        ))}
      </div>
      {!isAtBottom && (
        <>
          <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-white dark:from-gray-800 to-transparent z-10" />
          <button
            onClick={scrollToBottom}
            className="absolute bottom-2 right-1/2 translate-x-1/2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 rounded-full p-2 shadow-md transition-opacity z-10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </>
      )}
    </div>
  );
}