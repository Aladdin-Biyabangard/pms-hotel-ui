import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateRateClassRequest, rateClassesApi, RateClassResponse, UpdateRateClassRequest } from '../api/rateClass.api';

export interface UseRateClassesOptions {
  autoLoad?: boolean;
}

export const useRateClasses = ({ autoLoad = true }: UseRateClassesOptions = {}) => {
  const [rateClasses, setRateClasses] = useState<RateClassResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRateClasses = useCallback(async (params?: {
    rateCategoryId?: number;
    code?: string;
    name?: string;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rateClassesApi.getAll(0, 1000, params);
      setRateClasses(response.content);
    } catch (err) {
      const errorMessage = 'Failed to load rate classes';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load rate classes', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRateClass = useCallback(async (data: CreateRateClassRequest) => {
    try {
      const newRateClass = await rateClassesApi.create(data);
      setRateClasses(prev => [...prev, newRateClass]);
      toast.success('Rate class created successfully');
      return newRateClass;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create rate class';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateRateClass = useCallback(async (id: number, data: UpdateRateClassRequest) => {
    try {
      const updatedRateClass = await rateClassesApi.update(id, data);
      setRateClasses(prev => prev.map(rc => rc.id === id ? updatedRateClass : rc));
      toast.success('Rate class updated successfully');
      return updatedRateClass;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update rate class';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteRateClass = useCallback(async (id: number) => {
    try {
      await rateClassesApi.delete(id);
      setRateClasses(prev => prev.filter(rc => rc.id !== id));
      toast.success('Rate class deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete rate class';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getRateClassById = useCallback(async (id: number) => {
    try {
      return await rateClassesApi.getById(id);
    } catch (err) {
      console.error('Failed to get rate class', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadRateClasses();
    }
  }, [autoLoad, loadRateClasses]);

  return {
    rateClasses,
    isLoading,
    error,
    loadRateClasses,
    createRateClass,
    updateRateClass,
    deleteRateClass,
    getRateClassById,
    setRateClasses, // For manual state updates if needed
  };
};
