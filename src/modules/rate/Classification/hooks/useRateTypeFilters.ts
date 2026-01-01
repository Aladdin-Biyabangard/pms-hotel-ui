import { useMemo, useState } from 'react';
import { RateTypeResponse } from '../api/rateType.api';

export interface RateTypeFilters {
  code: string;
  name: string;
  status: string;
  showAdvancedFilters: boolean;
}

export const useRateTypeFilters = (rateTypes: RateTypeResponse[]) => {
  const [filters, setFilters] = useState<RateTypeFilters>({
    code: '',
    name: '',
    status: 'all',
    showAdvancedFilters: false,
  });

  const updateFilter = <K extends keyof RateTypeFilters>(key: K, value: RateTypeFilters[K]) => {
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

  const filteredRateTypes = useMemo(() => {
    let filtered = [...rateTypes];

    // Code filter
    if (filters.code.trim()) {
      const codeTerm = filters.code.toLowerCase();
      filtered = filtered.filter(rt => rt.code.toLowerCase().includes(codeTerm));
    }

    // Name filter
    if (filters.name.trim()) {
      const nameTerm = filters.name.toLowerCase();
      filtered = filtered.filter(rt => rt.name.toLowerCase().includes(nameTerm));
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(rt => rt.status === filters.status);
    }

    return filtered;
  }, [rateTypes, filters]);

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
    filteredRateTypes,
    hasActiveFilters,
  };
};
