import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateRateCategoryRequest, rateCategoriesApi, RateCategoryResponse, UpdateRateCategoryRequest } from '../api/rateCategory.api';

export interface UseRateCategoriesOptions {
  autoLoad?: boolean;
  enablePagination?: boolean;
}

export const useRateCategories = ({ autoLoad = true, enablePagination = false }: UseRateCategoriesOptions = {}) => {
  const [rateCategories, setRateCategories] = useState<RateCategoryResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const loadRateCategories = useCallback(async (params?: {
    code?: string;
    name?: string;
    status?: string;
    page?: number;
    size?: number;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      const page = params?.page ?? (enablePagination ? currentPage : 0);
      const size = params?.size ?? (enablePagination ? pageSize : 1000);
      const response = await rateCategoriesApi.getAll(page, size, params);

      if (enablePagination) {
        setRateCategories(response.content);
        setTotalElements(response.totalElements || response.content.length);
      } else {
        // For non-paginated mode, load all data
        setRateCategories(response.content);
        setTotalElements(response.totalElements || response.content.length);
      }
    } catch (err) {
      const errorMessage = 'Failed to load rate categories';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load rate categories', err);
    } finally {
      setIsLoading(false);
    }
  }, [enablePagination, currentPage, pageSize]);

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

  // Pagination functions
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refreshCurrentPage = useCallback(() => {
    loadRateCategories();
  }, [loadRateCategories]);

  useEffect(() => {
    if (autoLoad) {
      loadRateCategories();
    }
  }, [autoLoad, loadRateCategories]);

  // Reload when page changes (for paginated mode)
  useEffect(() => {
    if (enablePagination && autoLoad) {
      loadRateCategories();
    }
  }, [currentPage, enablePagination, autoLoad, loadRateCategories]);

  const totalPages = Math.ceil(totalElements / pageSize);

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
    // Pagination data
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    handlePageChange,
    refreshCurrentPage,
  };
};
