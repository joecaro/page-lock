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
          <span className="text-sm font-mono">Locksmith Console</span>
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
        <Logs entries={entries} />
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
  const previousLengthRef = useRef(entries.length);

  useLayoutEffect(() => {
    if (entries.length > previousLengthRef.current) {
      const target = document.getElementById("scroll-target");
      if (target) {
        target.scrollIntoView({ behavior: "smooth" });
      }
    }
    previousLengthRef.current = entries.length;
  }, [entries]);

  return (
    <div className="overflow-auto p-2 font-mono text-sm">
      {entries.map((entry, i) => (
        <div
          key={i}
          className={`mb-1 ${
            entry.type === "error"
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
      <div id="scroll-target" />
    </div>
  );
}
