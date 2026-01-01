import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateRateTypeRequest, RateTypeResponse, rateTypesApi, UpdateRateTypeRequest } from '../api/rateType.api';

export interface UseRateTypesOptions {
  autoLoad?: boolean;
}

export const useRateTypes = ({ autoLoad = true }: UseRateTypesOptions = {}) => {
  const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRateTypes = useCallback(async (params?: {
    code?: string;
    name?: string;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rateTypesApi.getAll(0, 1000, params);
      setRateTypes(response.content);
    } catch (err) {
      const errorMessage = 'Failed to load rate types';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load rate types', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRateType = useCallback(async (data: CreateRateTypeRequest) => {
    try {
      const newRateType = await rateTypesApi.create(data);
      setRateTypes(prev => [...prev, newRateType]);
      toast.success('Rate type created successfully');
      return newRateType;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create rate type';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateRateType = useCallback(async (id: number, data: UpdateRateTypeRequest) => {
    try {
      const updatedRateType = await rateTypesApi.update(id, data);
      setRateTypes(prev => prev.map(rt => rt.id === id ? updatedRateType : rt));
      toast.success('Rate type updated successfully');
      return updatedRateType;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update rate type';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteRateType = useCallback(async (id: number) => {
    try {
      await rateTypesApi.delete(id);
      setRateTypes(prev => prev.filter(rt => rt.id !== id));
      toast.success('Rate type deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete rate type';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getRateTypeById = useCallback(async (id: number) => {
    try {
      return await rateTypesApi.getById(id);
    } catch (err) {
      console.error('Failed to get rate type', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadRateTypes();
    }
  }, [autoLoad, loadRateTypes]);

  return {
    rateTypes,
    isLoading,
    error,
    loadRateTypes,
    createRateType,
    updateRateType,
    deleteRateType,
    getRateTypeById,
    setRateTypes, // For manual state updates if needed
  };
};
