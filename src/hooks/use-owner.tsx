import { useCallback, useEffect, useRef, useState } from "react";
import type { PageOwner } from "../types";
import { useOwnershipContext } from "../context/ownership-context";

interface UseOwnerProps {
  pageId: string;
  pollingInterval?: number;
}

interface UseOwnerResult {
  owner: PageOwner | null;
  isFetching: boolean;
  error: string | null;
  refreshOwner: () => Promise<void>;
}

export const useOwner = ({
  pageId,
  pollingInterval,
}: UseOwnerProps): UseOwnerResult => {
  const { config, options } = useOwnershipContext();
  const [owner, setOwner] = useState<PageOwner | null>(null);
  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingIntervalRef = useRef(
    pollingInterval || options.pollingInterval
  );

  const fetchOwner = useCallback(async () => {
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

  useEffect(() => {
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
    refreshOwner: fetchOwner,
  };
};
