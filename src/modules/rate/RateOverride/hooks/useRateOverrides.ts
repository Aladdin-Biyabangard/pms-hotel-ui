import {useCallback, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {
    CreateRateOverrideRequest,
    RateOverrideResponse,
    rateOverridesApi,
    UpdateRateOverrideRequest
} from '../api/rateOverride.api';

export interface UseRateOverridesOptions {
  ratePlanId?: number;
  autoLoad?: boolean;
}

export const useRateOverrides = ({ ratePlanId, autoLoad = true }: UseRateOverridesOptions = {}) => {
  const [overrides, setOverrides] = useState<RateOverrideResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOverrides = useCallback(async (params?: {
    roomTypeId?: number;
    overrideDate?: string;
    startDate?: string;
    endDate?: string;
    overrideType?: string;
    minOverrideValue?: number;
    maxOverrideValue?: number;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rateOverridesApi.getAll(0, 1000, {
        ratePlanId,
        ...params,
      });
      setOverrides(response.content);
    } catch (err) {
      const errorMessage = 'Failed to load rate overrides';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load rate overrides', err);
    } finally {
      setIsLoading(false);
    }
  }, [ratePlanId]);

  const createOverride = useCallback(async (data: CreateRateOverrideRequest) => {
    try {
      const newOverride = await rateOverridesApi.create(data);
      setOverrides(prev => [...prev, newOverride]);
      toast.success('Rate override created successfully');
      return newOverride;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create rate override';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateOverride = useCallback(async (id: number, data: UpdateRateOverrideRequest) => {
    try {
      const updatedOverride = await rateOverridesApi.update(id, data);
      setOverrides(prev => prev.map(override => override.id === id ? updatedOverride : override));
      toast.success('Rate override updated successfully');
      return updatedOverride;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update rate override';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteOverride = useCallback(async (id: number) => {
    try {
      await rateOverridesApi.delete(id);
      setOverrides(prev => prev.filter(override => override.id !== id));
      toast.success('Rate override deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete rate override';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getOverrideById = useCallback(async (id: number) => {
    try {
      return await rateOverridesApi.getById(id);
    } catch (err) {
      console.error('Failed to get rate override', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadOverrides();
    } else if (!ratePlanId) {
      setOverrides([]);
    }
  }, [ratePlanId, autoLoad, loadOverrides]);

  return {
    overrides,
    isLoading,
    error,
    loadOverrides,
    createOverride,
    updateOverride,
    deleteOverride,
    getOverrideById,
    setOverrides, // For manual state updates if needed
  };
};
