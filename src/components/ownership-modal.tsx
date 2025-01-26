import React from "react";
import { useRouter } from "next/navigation";
import { usePageOwnership } from "../hooks/use-page-ownership";
import type { PageOwner } from "../types";

interface OwnershipModalProps {
  pageId: string;
  tenant?: string;
  onCancel?: () => void;
  cancelText?: string;
  initialIsOpen?: boolean;
  initialCurrentOwner?: PageOwner | null;
}

export default function OwnershipModal({
  initialIsOpen,
  initialCurrentOwner,
  onCancel,
  cancelText,
  pageId,
}: OwnershipModalProps) {
  const router = useRouter();
  const onClose = () => {
    onCancel ? onCancel() : router.back();
  };

  const {
    takeOwnership,
    isOwnedByCurrentUser,
    currentOwner: redisOwner,
    isFetching,
    isAttemptingOwnership,
  } = usePageOwnership({
    pageId,
  });

  const owner = redisOwner || initialCurrentOwner;
  const isOpen = owner?.user_name ? !isOwnedByCurrentUser : initialIsOpen;

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Take Ownership</h2>
            <p className="text-gray-600">
              {owner?.user_name ? (
                <>
                  This page is currently owned by{" "}
                  <strong>{owner.user_name}</strong>. Would you like to take
                  ownership?
                </>
              ) : (
                <>
                  You are currently not the owner of this page. Would you like
                  to take ownership?
                </>
              )}
            </p>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => takeOwnership()}
              disabled={isFetching}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {isAttemptingOwnership ? "Taking ownership..." : "Take Ownership"}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
            >
              {cancelText || "Cancel"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
