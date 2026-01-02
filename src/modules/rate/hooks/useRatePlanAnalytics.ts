import { useState, useEffect, useMemo, useCallback } from 'react';
import { ratePlanApi, RatePlanResponse } from '../RatePlan/api';
import { rateTypeApi, RateTypeResponse } from '../Classification/api/rateType';
import { rateCategoryApi, RateCategoryResponse } from '../Classification/api/rateCategory';
import { rateClassApi, RateClassResponse } from '../Classification/api/rateClass';
import { roomRateApi, RoomRateResponse } from '@/api/roomRate';
import { EntityStatus } from '@/types/enums';
import { toast } from 'sonner';

export interface RatePlanAnalytics {
  // Overview metrics
  totalRatePlans: number;
  activeRatePlans: number;
  inactiveRatePlans: number;
  averageBasePrice: number;
  minPrice: number;
  maxPrice: number;

  // Distribution data
  ratePlansByType: Array<{
    rateType: RateTypeResponse;
    count: number;
    averagePrice: number;
    totalPlans: number;
  }>;

  ratePlansByCategory: Array<{
    rateCategory: RateCategoryResponse;
    count: number;
    averagePrice: number;
    totalPlans: number;
  }>;

  ratePlansByClass: Array<{
    rateClass: RateClassResponse;
    count: number;
    averagePrice: number;
    totalPlans: number;
  }>;

  // Time-based data
  validityPeriodTrends: Array<{
    period: string;
    count: number;
    averageValidityDays: number;
  }>;

  // Enhanced rate plan data with pricing
  ratePlansWithPricing: Array<RatePlanResponse & {
    averagePrice?: number;
    minPrice?: number;
    maxPrice?: number;
    totalRates?: number;
    isOutlier?: boolean;
    priceVariance?: number;
  }>;
}

interface UseRatePlanAnalyticsProps {
  rateTypeId?: number;
  rateCategoryId?: number;
  rateClassId?: number;
  status?: EntityStatus;
  dateRange?: { start: string; end: string };
}

export function useRatePlanAnalytics({
  rateTypeId,
  rateCategoryId,
  rateClassId,
  status,
  dateRange
}: UseRatePlanAnalyticsProps = {}) {
  const [ratePlans, setRatePlans] = useState<RatePlanResponse[]>([]);
  const [rateTypes, setRateTypes] = useState<RateTypeResponse[]>([]);
  const [rateCategories, setRateCategories] = useState<RateCategoryResponse[]>([]);
  const [rateClasses, setRateClasses] = useState<RateClassResponse[]>([]);
  const [roomRates, setRoomRates] = useState<RoomRateResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReferenceData = async () => {
    try {
      const [typesData, categoriesData, classesData] = await Promise.all([
        rateTypeApi.getAllRateTypes(0, 1000),
        rateCategoryApi.getAllRateCategories(0, 1000),
        rateClassApi.getAllRateClasses(0, 1000)
      ]);

      setRateTypes(typesData.content);
      setRateCategories(categoriesData.content);
      setRateClasses(classesData.content);
    } catch (err) {
      console.error('Failed to load reference data', err);
      toast.error('Failed to load reference data');
    }
  };

  const loadRatePlanData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load rate plans with filters
      const ratePlansData = await ratePlanApi.getAllRatePlans(0, 10000, {
        rateTypeId,
        status,
        stayDate: dateRange?.start
      });

      // Filter rate plans by category/class if specified
      let filteredRatePlans = ratePlansData.content;
      if (rateCategoryId) {
        filteredRatePlans = filteredRatePlans.filter(rp => rp.rateCategoryId === rateCategoryId);
      }
      if (rateClassId) {
        filteredRatePlans = filteredRatePlans.filter(rp => rp.rateClassId === rateClassId);
      }

      setRatePlans(filteredRatePlans);

      // Load room rates for pricing analysis
      if (filteredRatePlans.length > 0) {
        const ratePlanCodes = filteredRatePlans.map(rp => rp.code);
        const ratesPromises = ratePlanCodes.map(code =>
          roomRateApi.getAllRoomRates(0, 10000, {
            ratePlanCode: code,
            startDate: dateRange?.start,
            endDate: dateRange?.end
          })
        );

        const ratesResults = await Promise.all(ratesPromises);
        const allRates = ratesResults.flatMap(result => result.content);
        setRoomRates(allRates);
      } else {
        setRoomRates([]);
      }
    } catch (err) {
      const errorMsg = (err as any)?.response?.data?.message || 'Failed to load rate plan analytics data';
      setError(errorMsg);
      console.error('Failed to load rate plan data', err);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, [rateTypeId, rateCategoryId, rateClassId, status, dateRange]);

  // Load all reference data
  useEffect(() => {
    loadReferenceData();
  }, []);

  // Load rate plans and rates when filters change
  useEffect(() => {
    loadRatePlanData();
  }, [loadRatePlanData]);

  // Calculate analytics data
  const analytics: RatePlanAnalytics = useMemo(() => {
    // Basic metrics
    const activePlans = ratePlans.filter(rp => rp.status === 'ACTIVE');
    const inactivePlans = ratePlans.filter(rp => rp.status === 'INACTIVE');

    // Calculate pricing from room rates
    const ratePlansWithPricing = ratePlans.map(ratePlan => {
      const planRates = roomRates.filter(rate => rate.ratePlan?.id === ratePlan.id);
      const prices = planRates.map(r => r.rateAmount);

      const averagePrice = prices.length > 0 ? prices.reduce((a, b) => a + b, 0) / prices.length : 0;
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      return {
        ...ratePlan,
        averagePrice,
        minPrice,
        maxPrice,
        totalRates: planRates.length
      };
    });

    const allPrices = ratePlansWithPricing.flatMap(rp =>
      roomRates.filter(rate => rate.ratePlan?.id === rp.id).map(r => r.rateAmount)
    );

    const averageBasePrice = allPrices.length > 0 ? allPrices.reduce((a, b) => a + b, 0) / allPrices.length : 0;
    const minPrice = allPrices.length > 0 ? Math.min(...allPrices) : 0;
    const maxPrice = allPrices.length > 0 ? Math.max(...allPrices) : 0;

    // Calculate price variance for outlier detection
    const priceStdDev = calculateStandardDeviation(allPrices);
    const ratePlansWithOutliers = ratePlansWithPricing.map(rp => ({
      ...rp,
      isOutlier: rp.averagePrice ? Math.abs(rp.averagePrice - averageBasePrice) > 2 * priceStdDev : false,
      priceVariance: rp.averagePrice ? ((rp.averagePrice - averageBasePrice) / averageBasePrice) * 100 : 0
    }));

    // Distribution by rate type
    const ratePlansByType = rateTypes.map(rateType => {
      const typePlans = ratePlansWithPricing.filter(rp => rp.rateType.id === rateType.id);
      const typePrices = typePlans.flatMap(rp =>
        roomRates.filter(rate => rate.ratePlan?.id === rp.id).map(r => r.rateAmount)
      );
      const averagePrice = typePrices.length > 0 ? typePrices.reduce((a, b) => a + b, 0) / typePrices.length : 0;

      return {
        rateType,
        count: typePlans.length,
        averagePrice,
        totalPlans: typePlans.length
      };
    }).filter(item => item.totalPlans > 0);

    // Distribution by category
    const ratePlansByCategory = rateCategories.map(category => {
      const categoryPlans = ratePlansWithPricing.filter(rp => rp.rateCategoryId === category.id);
      const categoryPrices = categoryPlans.flatMap(rp =>
        roomRates.filter(rate => rate.ratePlan?.id === rp.id).map(r => r.rateAmount)
      );
      const averagePrice = categoryPrices.length > 0 ? categoryPrices.reduce((a, b) => a + b, 0) / categoryPrices.length : 0;

      return {
        rateCategory: category,
        count: categoryPlans.length,
        averagePrice,
        totalPlans: categoryPlans.length
      };
    }).filter(item => item.totalPlans > 0);

    // Distribution by class
    const ratePlansByClass = rateClasses.map(rateClass => {
      const classPlans = ratePlansWithPricing.filter(rp => rp.rateClassId === rateClass.id);
      const classPrices = classPlans.flatMap(rp =>
        roomRates.filter(rate => rate.ratePlan?.id === rp.id).map(r => r.rateAmount)
      );
      const averagePrice = classPrices.length > 0 ? classPrices.reduce((a, b) => a + b, 0) / classPrices.length : 0;

      return {
        rateClass,
        count: classPlans.length,
        averagePrice,
        totalPlans: classPlans.length
      };
    }).filter(item => item.totalPlans > 0);

    // Validity period trends
    const validityPeriodTrends = calculateValidityTrends(ratePlans);

    return {
      totalRatePlans: ratePlans.length,
      activeRatePlans: activePlans.length,
      inactiveRatePlans: inactivePlans.length,
      averageBasePrice,
      minPrice,
      maxPrice,
      ratePlansByType,
      ratePlansByCategory,
      ratePlansByClass,
      validityPeriodTrends,
      ratePlansWithPricing: ratePlansWithOutliers
    };
  }, [ratePlans, rateTypes, rateCategories, rateClasses, roomRates]);

  return {
    analytics,
    isLoading,
    error,
    refetch: loadRatePlanData,
    // Reference data for filters
    rateTypes,
    rateCategories,
    rateClasses
  };
}

// Helper function to calculate standard deviation
function calculateStandardDeviation(values: number[]): number {
  if (values.length === 0) return 0;

  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((a, b) => a + b, 0) / squareDiffs.length;

  return Math.sqrt(avgSquareDiff);
}

// Helper function to calculate validity period trends
function calculateValidityTrends(ratePlans: RatePlanResponse[]) {
  const trends: { [key: string]: { count: number; totalDays: number } } = {};

  ratePlans.forEach(plan => {
    if (!plan.validFrom || !plan.validTo) return;

    const validFrom = new Date(plan.validFrom);
    const validTo = new Date(plan.validTo);
    const days = Math.ceil((validTo.getTime() - validFrom.getTime()) / (1000 * 60 * 60 * 24));

    // Group by validity period ranges
    let period = '';
    if (days <= 30) period = '1 month';
    else if (days <= 90) period = '1-3 months';
    else if (days <= 180) period = '3-6 months';
    else if (days <= 365) period = '6-12 months';
    else period = '1+ years';

    if (!trends[period]) {
      trends[period] = { count: 0, totalDays: 0 };
    }

    trends[period].count += 1;
    trends[period].totalDays += days;
  });

  return Object.entries(trends).map(([period, data]) => ({
    period,
    count: data.count,
    averageValidityDays: data.totalDays / data.count
  }));
}
