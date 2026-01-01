import { useMemo, useState } from 'react';
import { RateClassResponse } from '../api/rateClass.api';

export interface RateClassFilters {
  rateCategoryId: string;
  code: string;
  name: string;
  status: string;
  showAdvancedFilters: boolean;
}

export const useRateClassFilters = (rateClasses: RateClassResponse[]) => {
  const [filters, setFilters] = useState<RateClassFilters>({
    rateCategoryId: '',
    code: '',
    name: '',
    status: 'all',
    showAdvancedFilters: false,
  });

  const updateFilter = <K extends keyof RateClassFilters>(key: K, value: RateClassFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      rateCategoryId: '',
      code: '',
      name: '',
      status: 'all',
      showAdvancedFilters: false,
    });
  };

  const filteredRateClasses = useMemo(() => {
    let filtered = [...rateClasses];

    // Rate category filter
    if (filters.rateCategoryId) {
      const categoryId = parseInt(filters.rateCategoryId);
      filtered = filtered.filter(rc => rc.rateCategoryId === categoryId);
    }

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
  }, [rateClasses, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.rateCategoryId !== '' ||
      filters.code.trim() !== '' ||
      filters.name.trim() !== '' ||
      filters.status !== 'all'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredRateClasses,
    hasActiveFilters,
  };
};
