"use client";

import { useState } from "react";
import {
  OwnershipProvider,
  createLocalStorageAdapter,
} from "@joecarot/page-lock";
import type { User } from "@joecarot/page-lock";
import { RecordListItem } from "./record-list-item";
import { RecordViewHook } from "./record-view-hook";
import { RecordViewComponent } from "./record-view-component";

interface Record {
  id: string;
  title: string;
  content: string;
}

interface BrowserWindowProps {
  user: User;
  records: Record[];
}

export function BrowserWindow({ user, records }: BrowserWindowProps) {
  const [selectedRecord, setSelectedRecord] = useState<Record | null>(null);

  const ownershipAdapter = createLocalStorageAdapter({
    prefix: `page:ownership`,
  });

  const userAdapter = {
    getCurrentUser: () => Promise.resolve(user),
  };

  const config = {
    userAdapter,
    ownershipAdapter,
    options: {
      pollingInterval: 500,
    },
  };

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex-1 border rounded-lg shadow-lg overflow-hidden bg-white dark:bg-gray-800 relative">
        {/* Browser chrome */}
        <div className="bg-gray-100 dark:bg-gray-700 border-b p-2 flex items-center space-x-2">
          <div className="w-3 h-3 rounded-full bg-red-500" />
          <div className="w-3 h-3 rounded-full bg-yellow-500" />
          <div className="w-3 h-3 rounded-full bg-green-500" />
          <div className="flex-1 bg-white dark:bg-gray-800 px-3 py-1 rounded-xs text-sm text-gray-500 dark:text-gray-400 text-center">
            localhost:3000
          </div>
        </div>

        {/* Browser content */}
        <div className="p-4">
          <div className="mb-4 flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
              {user.name?.[0] || user.email[0]}
            </div>
            <div>
              <div className="font-medium">{user.name}</div>
              <div className="text-sm text-gray-500">{user.email}</div>
            </div>
          </div>

          <OwnershipProvider config={config}>
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-4">Records</h2>
              {records.map((record) => (
                <RecordListItem
                  key={record.id}
                  record={record}
                  onSelect={setSelectedRecord}
                />
              ))}
            </div>
            {selectedRecord && (
              <>
                {user.id === "1" ? (
                  <RecordViewHook
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                  />
                ) : (
                  <RecordViewComponent
                    record={selectedRecord}
                    onClose={() => setSelectedRecord(null)}
                  />
                )}
              </>
            )}
          </OwnershipProvider>
        </div>
      </div>
    </div>
  );
}
