import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface RatePlanRestrictions {
  minGuests?: number;
  maxGuests?: number;
  extraGuestCharge?: number;
  includesExtraBed?: boolean;
  extraBedCharge?: number;
  maxOccupancy?: number;
  childAgeLimit?: number;
  applicableDayNames?: string[];
  season?: string;
  holidayMultiplier?: number;
  weekendMultiplier?: number;
  minLengthOfStay?: number;
  maxLengthOfStay?: number;
  advancePurchaseRequired?: boolean;
  advancePurchaseDays?: number;
  lastMinuteDiscount?: number;
  earlyBirdDiscount?: number;
  groupDiscount?: number;
  corporateDiscount?: number;
  loyaltyDiscount?: number;
}

export interface RateTypeResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: EntityStatus;
}

export interface RatePlanResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  rateType: RateTypeResponse;
  isDefault?: boolean;
  isPublic?: boolean;
  isPackage?: boolean;
  cancellationPolicyId?: number;
  minStayNights?: number;
  requiresGuarantee?: boolean;
  nonRefundable?: boolean;
  restrictions?: RatePlanRestrictions;
  validFrom?: string;
  validTo?: string;
  viewedFrom?: string;
  viewedTo?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  rateCode?: string;
  rateTier?: number;
 rateCategoryId?: number;
  rateCategoryCode?: string;
  rateCategoryName?: string;
  rateClassId?: number;
  rateClassCode?: string;
  rateClassName?: string;
}

export interface RatePlanRequest {
  code: string;
  name: string;
  description?: string;
  rateTypeId: number;
  isDefault?: boolean;
  isPublic?: boolean;
  isPackage?: boolean;
  requiresGuarantee?: boolean;
  nonRefundable?: boolean;
  validFrom?: string;
  validTo?: string;
  viewedFrom?: string;
  viewedTo?: string;
  restrictions?: RatePlanRestrictions;
  status?: EntityStatus;
  rateCode?: string;
  minStayNights?: number;
  applicableDays?: string[];
  rateTier?: number;
  commissionable?: boolean;
  commissionRate?: number;
  taxInclusive?: boolean;
  mealPlanCode?: string;
  // Classification
  rateCategoryId?: number;
  rateClassId?: number;
}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements?: number;
}

export const ratePlanApi = {
  createRatePlan: async (data: RatePlanRequest): Promise<RatePlanResponse> => {
    const response = await api.post<RatePlanResponse>('/rate-plans', data);
    return response.data;
  },

  updateRatePlan: async (id: number, data: RatePlanRequest): Promise<RatePlanResponse> => {
    const response = await api.put<RatePlanResponse>(`/rate-plans/${id}`, data);
    return response.data;
  },

  getRatePlan: async (id: number): Promise<RatePlanResponse> => {
    const response = await api.get<RatePlanResponse>(`/rate-plans/${id}`);
    return response.data;
  },

  getAllRatePlans: async (
    page = 0,
    size = 10,
    params?: {
      code?: string;
      rateTypeId?: number;
      name?: string;
      isActive?: boolean;
      isPublic?: boolean;
      status?: EntityStatus;
      stayDate?: string;
    }
  ): Promise<CustomPage<RatePlanResponse>> => {
    const response = await api.get<CustomPage<RatePlanResponse>>('/rate-plans', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRatePlan: async (id: number): Promise<void> => {
    await api.delete(`/rate-plans/${id}`);
  },
};

