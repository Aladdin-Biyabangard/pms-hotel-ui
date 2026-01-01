import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateRateCategoryRequest, rateCategoriesApi, RateCategoryResponse, UpdateRateCategoryRequest } from '../api/rateCategory.api';

export interface UseRateCategoriesOptions {
  autoLoad?: boolean;
}

export const useRateCategories = ({ autoLoad = true }: UseRateCategoriesOptions = {}) => {
  const [rateCategories, setRateCategories] = useState<RateCategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadRateCategories = useCallback(async (params?: {
    code?: string;
    name?: string;
    status?: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await rateCategoriesApi.getAll(0, 1000, params);
      setRateCategories(response.content);
    } catch (err) {
      const errorMessage = 'Failed to load rate categories';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load rate categories', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createRateCategory = useCallback(async (data: CreateRateCategoryRequest) => {
    try {
      const newRateCategory = await rateCategoriesApi.create(data);
      setRateCategories(prev => [...prev, newRateCategory]);
      toast.success('Rate category created successfully');
      return newRateCategory;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create rate category';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateRateCategory = useCallback(async (id: number, data: UpdateRateCategoryRequest) => {
    try {
      const updatedRateCategory = await rateCategoriesApi.update(id, data);
      setRateCategories(prev => prev.map(rc => rc.id === id ? updatedRateCategory : rc));
      toast.success('Rate category updated successfully');
      return updatedRateCategory;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update rate category';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteRateCategory = useCallback(async (id: number) => {
    try {
      await rateCategoriesApi.delete(id);
      setRateCategories(prev => prev.filter(rc => rc.id !== id));
      toast.success('Rate category deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete rate category';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getRateCategoryById = useCallback(async (id: number) => {
    try {
      return await rateCategoriesApi.getById(id);
    } catch (err) {
      console.error('Failed to get rate category', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad) {
      loadRateCategories();
    }
  }, [autoLoad, loadRateCategories]);

  return {
    rateCategories,
    isLoading,
    error,
    loadRateCategories,
    createRateCategory,
    updateRateCategory,
    deleteRateCategory,
    getRateCategoryById,
    setRateCategories, // For manual state updates if needed
  };
};
