import {useMemo, useState} from 'react';
import {RatePackageComponentResponse} from '../api/packageComponents.api';

export interface ComponentFilters {
  searchName: string;
  searchCode: string;
  searchDescription: string;
  componentType: string;
  isIncluded: string;
  minUnitPrice: string;
  maxUnitPrice: string;
  status: string;
  showAdvancedFilters: boolean;
}

export const useComponentFilters = (components: RatePackageComponentResponse[]) => {
  const [filters, setFilters] = useState<ComponentFilters>({
    searchName: '',
    searchCode: '',
    searchDescription: '',
    componentType: 'all',
    isIncluded: 'all',
    minUnitPrice: '',
    maxUnitPrice: '',
    status: 'all',
    showAdvancedFilters: false,
  });

  const updateFilter = <K extends keyof ComponentFilters>(key: K, value: ComponentFilters[K]) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      searchName: '',
      searchCode: '',
      searchDescription: '',
      componentType: 'all',
      isIncluded: 'all',
      minUnitPrice: '',
      maxUnitPrice: '',
      status: 'all',
      showAdvancedFilters: false,
    });
  };

  const filteredComponents = useMemo(() => {
    let filtered = [...components];

    // Search filters
    if (filters.searchName.trim()) {
      const term = filters.searchName.toLowerCase();
      filtered = filtered.filter(comp =>
        comp.componentName?.toLowerCase().includes(term)
      );
    }

    if (filters.searchCode.trim()) {
      const term = filters.searchCode.toLowerCase();
      filtered = filtered.filter(comp =>
        comp.componentCode?.toLowerCase().includes(term)
      );
    }

    if (filters.searchDescription.trim()) {
      const term = filters.searchDescription.toLowerCase();
      filtered = filtered.filter(comp =>
        comp.description?.toLowerCase().includes(term)
      );
    }

    // Component type filter
    if (filters.componentType !== 'all') {
      filtered = filtered.filter(comp => comp.componentType === filters.componentType);
    }

    // Included filter
    if (filters.isIncluded !== 'all') {
      filtered = filtered.filter(comp => {
        if (filters.isIncluded === 'included') return comp.isIncluded === true;
        if (filters.isIncluded === 'not-included') return comp.isIncluded === false;
        return true;
      });
    }

    // Price filters
    if (filters.minUnitPrice) {
      const minPrice = parseFloat(filters.minUnitPrice);
      filtered = filtered.filter(comp =>
        comp.unitPrice !== undefined && comp.unitPrice >= minPrice
      );
    }

    if (filters.maxUnitPrice) {
      const maxPrice = parseFloat(filters.maxUnitPrice);
      filtered = filtered.filter(comp =>
        comp.unitPrice !== undefined && comp.unitPrice <= maxPrice
      );
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(comp => comp.status === filters.status);
    }

    return filtered;
  }, [components, filters]);

  const hasActiveFilters = useMemo(() => {
    return (
      filters.searchName.trim() !== '' ||
      filters.searchCode.trim() !== '' ||
      filters.searchDescription.trim() !== '' ||
      filters.componentType !== 'all' ||
      filters.isIncluded !== 'all' ||
      filters.minUnitPrice !== '' ||
      filters.maxUnitPrice !== '' ||
      filters.status !== 'all'
    );
  }, [filters]);

  return {
    filters,
    updateFilter,
    clearFilters,
    filteredComponents,
    hasActiveFilters,
  };
};
