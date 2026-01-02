import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { ratePlanApi, RatePlanResponse } from "../RatePlan/api";

export interface ComparisonField {
  key: string;
  label: string;
  getValue: (ratePlan: RatePlanResponse) => string | number | boolean | null;
  formatValue?: (value: any) => string;
  isDifference?: boolean;
}

export function useRatePlanComparison() {
  const [selectedRatePlans, setSelectedRatePlans] = useState<RatePlanResponse[]>([]);
  const [availableRatePlans, setAvailableRatePlans] = useState<RatePlanResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingAvailable, setIsLoadingAvailable] = useState(true);

  const MAX_COMPARISON_RATE_PLANS = 4;
  const MIN_COMPARISON_RATE_PLANS = 2;

  useEffect(() => {
    loadAvailableRatePlans();
  }, []);

  const loadAvailableRatePlans = async () => {
    try {
      setIsLoadingAvailable(true);
      // Load all active rate plans for selection
      const data = await ratePlanApi.getAllRatePlans(0, 1000, { status: 'ACTIVE' });
      setAvailableRatePlans(data.content);
    } catch (error: any) {
      console.error("Failed to load available rate plans", error);
      toast.error(error?.response?.data?.message || "Failed to load rate plans");
    } finally {
      setIsLoadingAvailable(false);
    }
  };

  const addRatePlan = (ratePlan: RatePlanResponse) => {
    if (selectedRatePlans.length >= MAX_COMPARISON_RATE_PLANS) {
      toast.error(`Maximum ${MAX_COMPARISON_RATE_PLANS} rate plans can be compared at once`);
      return;
    }

    if (selectedRatePlans.some(rp => rp.id === ratePlan.id)) {
      toast.warning("Rate plan is already selected for comparison");
      return;
    }

    setSelectedRatePlans(prev => [...prev, ratePlan]);
    toast.success(`${ratePlan.name} added to comparison`);
  };

  const removeRatePlan = (ratePlanId: number) => {
    setSelectedRatePlans(prev => prev.filter(rp => rp.id !== ratePlanId));
  };

  const clearSelection = () => {
    setSelectedRatePlans([]);
  };

  const canAddMore = selectedRatePlans.length < MAX_COMPARISON_RATE_PLANS;
  const canCompare = selectedRatePlans.length >= MIN_COMPARISON_RATE_PLANS;

  // Define comparison fields with proper formatting
  const comparisonFields: ComparisonField[] = useMemo(() => [
    {
      key: 'code',
      label: 'Code',
      getValue: (rp) => rp.code,
    },
    {
      key: 'name',
      label: 'Name',
      getValue: (rp) => rp.name,
    },
    {
      key: 'rateType',
      label: 'Rate Type',
      getValue: (rp) => rp.rateType?.name || 'N/A',
    },
    {
      key: 'isDefault',
      label: 'Default Rate',
      getValue: (rp) => rp.isDefault,
      formatValue: (value) => value ? 'Yes' : 'No',
      isDifference: true,
    },
    {
      key: 'isPublic',
      label: 'Public',
      getValue: (rp) => rp.isPublic,
      formatValue: (value) => value ? 'Yes' : 'No',
      isDifference: true,
    },
    {
      key: 'isPackage',
      label: 'Package Rate',
      getValue: (rp) => rp.isPackage,
      formatValue: (value) => value ? 'Yes' : 'No',
      isDifference: true,
    },
    {
      key: 'rateCategory',
      label: 'Category',
      getValue: (rp) => rp.rateCategoryName || 'N/A',
    },
    {
      key: 'rateClass',
      label: 'Class',
      getValue: (rp) => rp.rateClassName || 'N/A',
    },
    {
      key: 'validPeriod',
      label: 'Valid Period',
      getValue: (rp) => {
        if (!rp.validFrom || !rp.validTo) return 'No date range';
        const from = new Date(rp.validFrom).toLocaleDateString();
        const to = new Date(rp.validTo).toLocaleDateString();
        return `${from} - ${to}`;
      },
    },
    {
      key: 'viewedPeriod',
      label: 'Viewed Period',
      getValue: (rp) => {
        if (!rp.viewedFrom || !rp.viewedTo) return 'No date range';
        const from = new Date(rp.viewedFrom).toLocaleDateString();
        const to = new Date(rp.viewedTo).toLocaleDateString();
        return `${from} - ${to}`;
      },
    },
    {
      key: 'minStayNights',
      label: 'Min Stay (Nights)',
      getValue: (rp) => rp.minStayNights || null,
      formatValue: (value) => value ? `${value} nights` : 'No minimum',
      isDifference: true,
    },
    {
      key: 'requiresGuarantee',
      label: 'Requires Guarantee',
      getValue: (rp) => rp.requiresGuarantee,
      formatValue: (value) => value ? 'Yes' : 'No',
      isDifference: true,
    },
    {
      key: 'nonRefundable',
      label: 'Non-refundable',
      getValue: (rp) => rp.nonRefundable,
      formatValue: (value) => value ? 'Yes' : 'No',
      isDifference: true,
    },
    {
      key: 'status',
      label: 'Status',
      getValue: (rp) => rp.status,
    },
  ], []);

  // Calculate differences across selected rate plans
  const fieldDifferences = useMemo(() => {
    const differences: Record<string, boolean> = {};

    comparisonFields.forEach(field => {
      if (!field.isDifference) return;

      const values = selectedRatePlans.map(rp => field.getValue(rp));
      const uniqueValues = [...new Set(values)];
      differences[field.key] = uniqueValues.length > 1;
    });

    return differences;
  }, [selectedRatePlans, comparisonFields]);

  return {
    selectedRatePlans,
    availableRatePlans,
    isLoading,
    isLoadingAvailable,
    addRatePlan,
    removeRatePlan,
    clearSelection,
    canAddMore,
    canCompare,
    comparisonFields,
    fieldDifferences,
    maxRatePlans: MAX_COMPARISON_RATE_PLANS,
    minRatePlans: MIN_COMPARISON_RATE_PLANS,
  };
}
