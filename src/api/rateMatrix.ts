import {api} from './axios';
import {GuestType} from '@/types/enums';

export interface RateMatrixRequest {
  startDate: string;
  endDate: string;
  roomTypeCodes?: string[];
  ratePlanCodes?: string[];
  guestTypes?: GuestType[];
  includePackageComponents?: boolean;
  includeOverrides?: boolean;
  includeTiers?: boolean;
  lengthOfStay?: number;
}

export interface RateTierInfo {
  tierId: number;
  minNights?: number;
  maxNights?: number;
  adjustmentType: string;
  adjustmentValue: number;
  priority?: number;
}

export interface RateOverrideInfo {
  overrideId: number;
  overrideType: string;
  overrideValue: number;
  reason?: string;
}

export interface PackageComponentInfo {
  componentId: number;
  componentType: string;
  componentCode?: string;
  componentName: string;
  quantity?: number;
  unitPrice?: number;
  priceAdult?: number;
  priceChild?: number;
  priceInfant?: number;
  isIncluded?: boolean;
  description?: string;
  totalPrice: number;
}

export interface RateMatrixCell {
  baseRate: number;
  tierAdjustment?: number;
  overrideAdjustment?: number;
  finalRate: number;
  currency?: string;
  availabilityCount?: number;
  stopSell?: boolean;
  closedForArrival?: boolean;
  closedForDeparture?: boolean;
  appliedTier?: RateTierInfo;
  appliedOverride?: RateOverrideInfo;
  packageComponents?: PackageComponentInfo[];
  packageComponentTotal?: number;
}

export interface DailyRateMatrixEntry {
  date: string;
  matrix: Record<string, Record<string, Record<GuestType, RateMatrixCell>>>;
  roomTypeCodes: string[];
  ratePlanCodes: string[];
  guestTypes: GuestType[];
}

export interface RateMatrixResponse {
  startDate: string;
  endDate: string;
  dailyMatrix: Record<string, DailyRateMatrixEntry>;
  summary: {
    totalRoomTypes: number;
    totalRatePlans: number;
    totalGuestTypes: number;
    totalDays: number;
    minRate: number;
    maxRate: number;
    averageRate: number;
    stopSellCount: number;
    closedForArrivalCount: number;
    closedForDepartureCount: number;
  };
}

export const rateMatrixApi = {
  generateDailyMatrix: async (request: RateMatrixRequest): Promise<RateMatrixResponse> => {
    const response = await api.post<RateMatrixResponse>('/rate-matrix/generate', request);
    return response.data;
  },
};

