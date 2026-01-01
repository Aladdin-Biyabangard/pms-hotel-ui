import { useMemo, useState } from 'react';
import { RateCategoryResponse } from '../api/rateCategory.api';

export interface RateCategoryFilters {
  code: string;
  name: string;
  status: string;
  showAdvancedFilters: boolean;
}

export const useRateCategoryFilters = (rateCategories: RateCategoryResponse[]) => {
  const [filters, setFilters] = useState<RateCategoryFilters>({
    code: '',
    name: '',
    status: 'all',
    showAdvancedFilters: false,
  });

  const updateFilter = <K extends keyof RateCategoryFilters>(key: K, value: RateCategoryFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      code: '',
      name: '',
      status: 'all',
      showAdvancedFilters: false,
    });
  };

  const filteredRateCategories = useMemo(() => {
    let filtered = [...rateCategories];

    // Code filter
    if (filters.code.trim()) {
      const codeTerm = filters.code.toLowerCase();
      filtered = filtered.filter(rc => rc.code.toLowerCase().includes(codeTerm));
    }

    // Name filter
    if (filters.name.trim()) {
      const nameTerm = filters.name.toLowerCase();
      filtered = filtered.filter(rc => rc.name.toLowerCase().includes(nameTerm));
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(rc => rc.status === filters.status);
    }

    return filtered;
  }, [rateCategories, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.code.trim() !== '' ||
      filters.name.trim() !== '' ||
      filters.status !== 'all'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredRateCategories,
    hasActiveFilters,
  };
};
