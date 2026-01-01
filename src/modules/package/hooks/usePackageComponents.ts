import {useCallback, useEffect, useState} from 'react';
import {toast} from 'sonner';
import {
    CreateRatePackageComponentRequest,
    packageComponentsApi,
    RatePackageComponentResponse,
    UpdateRatePackageComponentRequest
} from '../api/packageComponents.api';

export interface UsePackageComponentsOptions {
  ratePlanId?: number;
  autoLoad?: boolean;
}

export const usePackageComponents = ({ ratePlanId, autoLoad = true }: UsePackageComponentsOptions = {}) => {
  const [components, setComponents] = useState<RatePackageComponentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadComponents = useCallback(async (params?: {
    componentType?: string;
    componentCode?: string;
    componentName?: string;
    isIncluded?: boolean;
    minUnitPrice?: number;
    maxUnitPrice?: number;
    status?: import('@/types/enums').EntityStatus;
  }) => {
    if (!ratePlanId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await packageComponentsApi.getAll(0, 1000, {
        ratePlanId,
        ...params,
      });
      setComponents(response.content);
    } catch (err) {
      const errorMessage = 'Failed to load package components';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Failed to load package components', err);
    } finally {
      setIsLoading(false);
    }
  }, [ratePlanId]);

  const createComponent = useCallback(async (data: CreateRatePackageComponentRequest) => {
    try {
      const newComponent = await packageComponentsApi.create(data);
      setComponents(prev => [...prev, newComponent]);
      toast.success('Package component created successfully');
      return newComponent;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to create package component';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const updateComponent = useCallback(async (id: number, data: UpdateRatePackageComponentRequest) => {
    try {
      const updatedComponent = await packageComponentsApi.update(id, data);
      setComponents(prev => prev.map(comp => comp.id === id ? updatedComponent : comp));
      toast.success('Package component updated successfully');
      return updatedComponent;
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to update package component';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const deleteComponent = useCallback(async (id: number) => {
    try {
      await packageComponentsApi.delete(id);
      setComponents(prev => prev.filter(comp => comp.id !== id));
      toast.success('Package component deleted successfully');
    } catch (err: any) {
      const errorMessage = err?.response?.data?.message || 'Failed to delete package component';
      toast.error(errorMessage);
      throw err;
    }
  }, []);

  const getComponentById = useCallback(async (id: number) => {
    try {
      return await packageComponentsApi.getById(id);
    } catch (err) {
      console.error('Failed to get package component', err);
      throw err;
    }
  }, []);

  useEffect(() => {
    if (autoLoad && ratePlanId) {
      loadComponents();
    } else if (!ratePlanId) {
      setComponents([]);
    }
  }, [ratePlanId, autoLoad, loadComponents]);

  return {
    components,
    isLoading,
    error,
    loadComponents,
    createComponent,
    updateComponent,
    deleteComponent,
    getComponentById,
    setComponents, // For manual state updates if needed
  };
};
