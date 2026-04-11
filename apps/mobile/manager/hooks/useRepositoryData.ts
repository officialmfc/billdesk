import { useCallback, useEffect, useRef, useState } from "react";

import { useSync } from "@/contexts/SyncContext";

type State<T> = {
  data: T | null;
  error: Error | null;
  loading: boolean;
};

export function useRepositoryData<T>(
  loader: () => Promise<T> | T,
  deps: ReadonlyArray<unknown> = []
) {
  const loaderRef = useRef(loader);
  const { revision } = useSync();
  const [state, setState] = useState<State<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    loaderRef.current = loader;
  }, [loader]);

  const reload = useCallback(async () => {
    setState((current) => ({
      data: current.data,
      error: null,
      loading: true,
    }));

    try {
      const data = await Promise.resolve(loaderRef.current());
      setState({
        data,
        error: null,
        loading: false,
      });
    } catch (error) {
      setState({
        data: null,
        error: error instanceof Error ? error : new Error("Failed to load data"),
        loading: false,
      });
    }
  }, [...deps]);

  useEffect(() => {
    reload().catch(() => undefined);
  }, [reload, revision]);

  return {
    ...state,
    reload,
  };
}
