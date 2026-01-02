import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UseEntityDataOptions<T> {
  loadFn: () => Promise<T>;
  onError?: (error: any) => void;
  errorMessage?: string;
}

export function useEntityData<T>({
  loadFn,
  onError,
  errorMessage = "Failed to load data"
}: UseEntityDataOptions<T>) {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await loadFn();
      setData(result);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || errorMessage;
      setError(errorMsg);
      console.error(errorMessage, err);
      toast.error(errorMsg);
      onError?.(err);
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    loadData();
  };

  return {
    data,
    isLoading,
    error,
    refetch,
  };
}
