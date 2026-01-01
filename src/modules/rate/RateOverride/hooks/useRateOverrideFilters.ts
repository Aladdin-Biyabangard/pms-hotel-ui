import {useMemo, useState} from 'react';
import {RateOverrideResponse} from '../api/rateOverride.api';

export interface RateOverrideFilters {
  roomTypeId: string;
  overrideDate: string;
  startDate: string;
  endDate: string;
  overrideType: string;
  minOverrideValue: string;
  maxOverrideValue: string;
  status: string;
  showAdvancedFilters: boolean;
}

export const useRateOverrideFilters = (overrides: RateOverrideResponse[]) => {
  const [filters, setFilters] = useState<RateOverrideFilters>({
    roomTypeId: '',
    overrideDate: '',
    startDate: '',
    endDate: '',
    overrideType: 'all',
    minOverrideValue: '',
    maxOverrideValue: '',
    status: 'all',
    showAdvancedFilters: false,
  });

  const updateFilter = <K extends keyof RateOverrideFilters>(key: K, value: RateOverrideFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      roomTypeId: '',
      overrideDate: '',
      startDate: '',
      endDate: '',
      overrideType: 'all',
      minOverrideValue: '',
      maxOverrideValue: '',
      status: 'all',
      showAdvancedFilters: false,
    });
  };

  const filteredOverrides = useMemo(() => {
    let filtered = [...overrides];

    // Room type filter
    if (filters.roomTypeId) {
      const roomTypeId = parseInt(filters.roomTypeId);
      filtered = filtered.filter(override => override.roomTypeId === roomTypeId);
    }

    // Override date filter
    if (filters.overrideDate) {
      filtered = filtered.filter(override => override.overrideDate === filters.overrideDate);
    }

    // Date range filters
    if (filters.startDate) {
      filtered = filtered.filter(override => override.overrideDate >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(override => override.overrideDate <= filters.endDate);
    }

    // Override type filter
    if (filters.overrideType !== 'all') {
      filtered = filtered.filter(override => override.overrideType === filters.overrideType);
    }

    // Min override value filter
    if (filters.minOverrideValue) {
      const minValue = parseFloat(filters.minOverrideValue);
      filtered = filtered.filter(override => override.overrideValue >= minValue);
    }

    // Max override value filter
    if (filters.maxOverrideValue) {
      const maxValue = parseFloat(filters.maxOverrideValue);
      filtered = filtered.filter(override => override.overrideValue <= maxValue);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(override => override.status === filters.status);
    }

    return filtered;
  }, [overrides, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.roomTypeId !== '' ||
      filters.overrideDate !== '' ||
      filters.startDate !== '' ||
      filters.endDate !== '' ||
      filters.overrideType !== 'all' ||
      filters.minOverrideValue !== '' ||
      filters.maxOverrideValue !== '' ||
      filters.status !== 'all'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredOverrides,
    hasActiveFilters,
  };
};
