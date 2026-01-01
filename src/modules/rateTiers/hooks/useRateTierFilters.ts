import {useMemo, useState} from 'react';
import {RateTierResponse} from '../api/rateTiers.api';

export interface RateTierFilters {
  minNights: string;
  maxNights: string;
  adjustmentType: string;
  minAdjustmentValue: string;
  maxAdjustmentValue: string;
  priority: string;
  status: string;
  showAdvancedFilters: boolean;
}

export const useRateTierFilters = (tiers: RateTierResponse[]) => {
  const [filters, setFilters] = useState<RateTierFilters>({
    minNights: '',
    maxNights: '',
    adjustmentType: 'all',
    minAdjustmentValue: '',
    maxAdjustmentValue: '',
    priority: '',
    status: 'all',
    showAdvancedFilters: false,
  });

  const updateFilter = <K extends keyof RateTierFilters>(key: K, value: RateTierFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      minNights: '',
      maxNights: '',
      adjustmentType: 'all',
      minAdjustmentValue: '',
      maxAdjustmentValue: '',
      priority: '',
      status: 'all',
      showAdvancedFilters: false,
    });
  };

  const filteredTiers = useMemo(() => {
    let filtered = [...tiers];

    // Min nights filter
    if (filters.minNights) {
      const minNights = parseInt(filters.minNights);
      filtered = filtered.filter(tier => tier.minNights >= minNights);
    }

    // Max nights filter
    if (filters.maxNights) {
      const maxNights = parseInt(filters.maxNights);
      filtered = filtered.filter(tier => tier.maxNights && tier.maxNights <= maxNights);
    }

    // Adjustment type filter
    if (filters.adjustmentType !== 'all') {
      filtered = filtered.filter(tier => tier.adjustmentType === filters.adjustmentType);
    }

    // Min adjustment value filter
    if (filters.minAdjustmentValue) {
      const minValue = parseFloat(filters.minAdjustmentValue);
      filtered = filtered.filter(tier => tier.adjustmentValue >= minValue);
    }

    // Max adjustment value filter
    if (filters.maxAdjustmentValue) {
      const maxValue = parseFloat(filters.maxAdjustmentValue);
      filtered = filtered.filter(tier => tier.adjustmentValue <= maxValue);
    }

    // Priority filter
    if (filters.priority) {
      const priority = parseInt(filters.priority);
      filtered = filtered.filter(tier => tier.priority === priority);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(tier => tier.status === filters.status);
    }

    return filtered;
  }, [tiers, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.minNights !== '' ||
      filters.maxNights !== '' ||
      filters.adjustmentType !== 'all' ||
      filters.minAdjustmentValue !== '' ||
      filters.maxAdjustmentValue !== '' ||
      filters.priority !== '' ||
      filters.status !== 'all'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredTiers,
    hasActiveFilters,
  };
};
