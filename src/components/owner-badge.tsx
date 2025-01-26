import React from "react";
import { useOwner } from "../hooks/use-owner";
import { cn } from "../utils";

interface OwnerBadgeProps {
  pageId: string;
  className?: string;
}

const OwnerBadge = ({ pageId, className }: OwnerBadgeProps) => {
  const { owner, isFetching } = useOwner({ pageId });

  if (isFetching && !owner) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-gray-100 text-gray-500 animate-pulse",
          className
        )}
      >
        Loading...
      </div>
    );
  }

  if (!owner) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
          className
        )}
      >
        No active owner
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 text-sm rounded-md bg-blue-50 text-blue-700 border border-blue-100",
        className
      )}
    >
      <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
      <span>Owned by {owner.user_name}</span>
    </div>
  );
};

export default OwnerBadge;