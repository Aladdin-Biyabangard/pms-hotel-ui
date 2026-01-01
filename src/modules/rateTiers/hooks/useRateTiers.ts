import {useCallback, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {CreateRateTierRequest, RateTierResponse, rateTiersApi, UpdateRateTierRequest} from '../api/rateTiers.api';

export interface UseRateTiersOptions {
  ratePlanId?: number;
  autoLoad?: boolean;
}

export const useRateTiers = ({ ratePlanId, autoLoad = true }: UseRateTiersOptions = {}) => {
  const [tiers, setTiers] = useState<RateTierResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTiers = useCallback(async (params?: {
    minNights?: number;
    maxNights?: number;
    adjustmentType?: string;
    minAdjustmentValue?: number;
    maxAdjustmentValue?: number;
    priority?: number;
    status?: string;
  }) => {
    if (!ratePlanId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await rateTiersApi.getAll(0, 1000, {
        ratePlanId,
        ...params,
      });
      setTiers(response.content);
    } catch (err) {
      const errorMessage = 'Failed to load rate tiers';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load rate tiers', err);
    } finally {
      setIsLoading(false);
    }
  }, [ratePlanId]);

  const createTier = useCallback(async (data: CreateRateTierRequest) => {
    try {
      const newTier = await rateTiersApi.create(data);
      setTiers(prev => [...prev, newTier]);
      toast.success('Rate tier created successfully');
      return newTier;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create rate tier';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateTier = useCallback(async (id: number, data: UpdateRateTierRequest) => {
    try {
      const updatedTier = await rateTiersApi.update(id, data);
      setTiers(prev => prev.map(tier => tier.id === id ? updatedTier : tier));
      toast.success('Rate tier updated successfully');
      return updatedTier;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update rate tier';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteTier = useCallback(async (id: number) => {
    try {
      await rateTiersApi.delete(id);
      setTiers(prev => prev.filter(tier => tier.id !== id));
      toast.success('Rate tier deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete rate tier';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updatePriorities = useCallback(async (updates: Array<{ id: number; priority: number }>) => {
    try {
      await rateTiersApi.updatePriorities(updates);
      // Update local state with new priorities
      setTiers(prev => prev.map(tier => {
        const update = updates.find(u => u.id === tier.id);
        return update ? { ...tier, priority: update.priority } : tier;
      }));
      toast.success('Priorities updated successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update priorities';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getTierById = useCallback(async (id: number) => {
    try {
      return await rateTiersApi.getById(id);
    } catch (err) {
      console.error('Failed to get rate tier', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad && ratePlanId) {
      loadTiers();
    } else if (!ratePlanId) {
      setTiers([]);
    }
  }, [ratePlanId, autoLoad, loadTiers]);

  return {
    tiers,
    isLoading,
    error,
    loadTiers,
    createTier,
    updateTier,
    deleteTier,
    updatePriorities,
    getTierById,
    setTiers, // For manual state updates if needed
  };
};
