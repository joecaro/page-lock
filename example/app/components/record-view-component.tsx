"use client";

import { OwnerBadge, OwnershipModal } from "@joecarot/page-lock";

interface Record {
  id: string;
  title: string;
  content: string;
}

interface RecordViewProps {
  record: Record;
  onClose: () => void;
}

export function RecordViewComponent({ record, onClose }: RecordViewProps) {
  return (
    <div className="absolute top-0 left-0 w-full h-full bg-black/50 flex items-center justify-center">
      <OwnershipModal
        pageId={`record-${record.id}`}
        initialIsOpen={true}
        onCancel={onClose}
        cancelText="Close"
      />
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4">
        {/* Header */}
        <div className="border-b p-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-semibold">{record.title}</h2>
            <p className="text-sm text-gray-500">ID: {record.id}</p>
          </div>
          <OwnerBadge pageId={`record-${record.id}`} />
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
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

        {/* Content */}
        <div className="p-4">
          <div className="prose prose-sm max-w-none">
            <p>{record.content}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-xs hover:bg-gray-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
