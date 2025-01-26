import { useCallback, useEffect, useRef, useState } from "react";
import type { PageOwner } from "../types";
import { useOwnershipContext } from "../context/ownership-context";

interface UsePageOwnershipProps {
  pageId: string;
  pollingInterval?: number;
}

interface UsePageOwnershipResult {
  currentOwner: PageOwner | null;
  isFetching: boolean;
  isAttemptingOwnership: boolean;
  error: string | null;
  isOwnedByCurrentUser: boolean;
  lockPage: () => void;
  unlockPage: () => void;
  takeOwnership: () => void;
  refreshOwnership: () => void;
  lockedPages: Record<string, PageOwner> | undefined;
}

export const usePageOwnership = ({
  pageId,
  pollingInterval,
}: UsePageOwnershipProps): UsePageOwnershipResult => {
  const { user, config, options } = useOwnershipContext();
  const [currentOwner, setCurrentOwner] = useState<PageOwner | null>(null);
  const [lockedPages, setLockedPages] = useState<Record<string, PageOwner>>();
  const [isAttemptingOwnership, setIsAttemptingOwnership] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAttemptingOwnershipInternalRef = useRef(false);
  const previousPageIdRef = useRef<string | null>(pageId);
  const currentOwnerRef = useRef<PageOwner | null>(null);
  const pollingIntervalRef = useRef(
    pollingInterval || options.pollingInterval
  );

  const userId = user?.id ?? "";
  const userName = user?.email ?? "";

  // Fetch all locked pages
  const fetchLockedPages = useCallback(async () => {
    try {
      const pages = await config.ownershipAdapter.getAllPageOwners();
      setLockedPages(pages);
    } catch (err) {
      console.error("Failed to fetch locked pages:", err);
    }
  }, [config.ownershipAdapter]);

  // Take ownership
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

  // Fetch current owner
  const fetchOwner = useCallback(async () => {
    try {
      setIsFetching(true);
      setError(null);
      const owner = await config.ownershipAdapter.getPageOwner(pageId);
      setCurrentOwner((prev) =>
        !!prev && prev.user_id === owner?.user_id ? prev : owner
      );

      // Only attempt to take ownership if we're not already attempting it
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

  // Set up polling
  useEffect(() => {
    fetchOwner();
    fetchLockedPages();

    const interval = setInterval(() => {
      fetchOwner();
      fetchLockedPages();
    }, pollingIntervalRef.current);

    return () => clearInterval(interval);
  }, [pageId, pollingIntervalRef.current]);

  // Lock page
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

  // Unlock page
  const unlockPage = async (page?: string | null) => {
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

  // Handle page changes
  useEffect(() => {
    if (pageId !== previousPageIdRef.current) {
      if (currentOwner?.user_id === userId) {
        unlockPage(previousPageIdRef.current);
      }
      previousPageIdRef.current = pageId;
    }
  }, [pageId]);

  // Update ref whenever currentOwner changes
  useEffect(() => {
    currentOwnerRef.current = currentOwner;
  }, [currentOwner]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (
        previousPageIdRef.current &&
        currentOwnerRef.current?.user_id === userId
      ) {
        unlockPage(previousPageIdRef.current);
      }
    };
  }, []);

  return {
    currentOwner,
    isFetching,
    isAttemptingOwnership,
    error,
    isOwnedByCurrentUser: currentOwner?.user_id === userId,
    lockPage,
    unlockPage,
    takeOwnership,
    refreshOwnership: fetchOwner,
    lockedPages,
  };
};
