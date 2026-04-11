"use client";

import { createClient } from "@mfc/supabase-config";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type UseSupabaseLoaderOptions<T> = {
  enabled?: boolean;
  initialData: T;
};

export function useSupabaseLoader<T>(
  loader: (supabase: SupabaseClient) => Promise<T>,
  { enabled = true, initialData }: UseSupabaseLoaderOptions<T>
) {
  const supabase = useMemo(() => createClient(), []);
  const initialDataRef = useRef(initialData);
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initialDataRef.current = initialData;
  }, [initialData]);

  const refetch = useCallback(async () => {
    if (!enabled) {
      setData(initialDataRef.current);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const nextData = await loader(supabase);
      setData(nextData);
    } catch (nextError) {
      setError(nextError as Error);
      setData(initialDataRef.current);
    } finally {
      setLoading(false);
    }
  }, [enabled, loader, supabase]);

  useEffect(() => {
    void refetch();
  }, [refetch]);

  return {
    data,
    error,
    loading,
    refetch,
  };
}
