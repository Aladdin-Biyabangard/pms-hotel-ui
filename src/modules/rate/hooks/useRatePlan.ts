import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { ratePlanApi, RatePlanResponse } from "../RatePlan/api";

export function useRatePlan(id?: string) {
  const navigate = useNavigate();
  const [ratePlan, setRatePlan] = useState<RatePlanResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadRatePlan();
    } else {
      setIsLoading(false);
    }
  }, [id]);

  const loadRatePlan = async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);
      setNotFound(false);
      const data = await ratePlanApi.getRatePlan(parseInt(id));
      setRatePlan(data);
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || "Failed to load rate plan";
      setError(errorMsg);
      console.error("Failed to load rate plan", err);

      // Check if it's a 404 error
      if (err?.response?.status === 404) {
        setNotFound(true);
      } else {
        toast.error(errorMsg);
        navigate("/rate-plans");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const refetch = () => {
    loadRatePlan();
  };

  return {
    ratePlan,
    isLoading,
    error,
    notFound,
    refetch,
  };
}
