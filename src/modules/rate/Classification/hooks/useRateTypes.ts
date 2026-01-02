import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { CreateRateTypeRequest, RateTypeResponse, rateTypesApi, UpdateRateTypeRequest } from '../api/rateType.api';

export interface UseRateTypesOptions {
  autoLoad?: boolean;
  enablePagination?: boolean;
}

export const useRateTypes = ({ autoLoad = true, enablePagination = false }: UseRateTypesOptions = {}) => {
  const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize] = useState(10);

  const loadRateTypes = useCallback(async (params?: {
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
      const response = await rateTypesApi.getAll(page, size, params);

      if (enablePagination) {
        setRateTypes(response.content);
        setTotalElements(response.totalElements || response.content.length);
      } else {
        // For non-paginated mode, load all data
        setRateTypes(response.content);
        setTotalElements(response.totalElements || response.content.length);
      }
    } catch (err) {
      const errorMessage = 'Failed to load rate types';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load rate types', err);
    } finally {
      setIsLoading(false);
    }
  }, [enablePagination, currentPage, pageSize]);

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

  // Pagination functions
  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const refreshCurrentPage = useCallback(() => {
    loadRateTypes();
  }, [loadRateTypes]);

  useEffect(() => {
    if (autoLoad) {
      loadRateTypes();
    }
  }, [autoLoad, loadRateTypes]);

  // Reload when page changes (for paginated mode)
  useEffect(() => {
    if (enablePagination && autoLoad) {
      loadRateTypes();
    }
  }, [currentPage, enablePagination, autoLoad, loadRateTypes]);

  const totalPages = Math.ceil(totalElements / pageSize);

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
    // Pagination data
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    handlePageChange,
    refreshCurrentPage,
  };
};
