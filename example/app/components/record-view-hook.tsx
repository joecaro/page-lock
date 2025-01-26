"use client";

import { usePageOwnership } from "@joecarot/page-lock";

interface Record {
  id: string;
  title: string;
  content: string;
}

interface RecordViewProps {
  record: Record;
  onClose: () => void;
}

export function RecordViewHook({ record, onClose }: RecordViewProps) {
  const {
    currentOwner,
    isOwnedByCurrentUser,
    lockPage,
    unlockPage,
    takeOwnership,
    isFetching,
    error,
  } = usePageOwnership({
    pageId: `record-${record.id}`,
  });

  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{record.title}</h2>
            <p className="text-sm text-gray-500">ID: {record.id}</p>
          </div>
          <div className="flex items-center space-x-2">
            {currentOwner ? (
              <div className="flex items-center space-x-2">
                <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 rounded-full text-xs">
                  Locked by {currentOwner.user_name}
                </span>
                {isOwnedByCurrentUser ? (
                  <button
                    onClick={() => unlockPage()}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                    disabled={isFetching}
                  >
                    Release Lock
                  </button>
                ) : (
                  <button
                    onClick={() => takeOwnership()}
                    className="text-blue-500 hover:text-blue-600 text-sm"
                    disabled={isFetching}
                  >
                    Take Over
                  </button>
                )}
              </div>
            ) : (
              <button
                onClick={() => lockPage()}
                className="px-3 py-1 bg-blue-500 dark:bg-blue-600 text-white rounded-full text-xs hover:bg-blue-600 dark:hover:bg-blue-700"
                disabled={isFetching}
              >
                Lock Record
              </button>
            )}
            <button
              onClick={onClose}
              className="ml-4 text-gray-400 hover:text-gray-500"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="prose prose-sm max-w-none">
            <p>{record.content}</p>
          </div>

          {error && (
            <div className="mt-4 p-2 bg-red-50 dark:bg-red-900/50 text-red-500 dark:text-red-200 rounded-xs text-sm">
              Error: {error}
            </div>
          )}

          {isFetching && (
            <div className="mt-4 text-sm text-gray-500">Updating...</div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xs hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
