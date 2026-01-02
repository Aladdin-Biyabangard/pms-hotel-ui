import {api} from '@/api/axios';
import {EntityStatus} from '@/types/enums';

export interface RateOverrideResponse {
  id: number;
  hotelId: number;
  ratePlanId: number;
  ratePlanCode: string;
  ratePlanName: string;
  roomTypeId?: number;
  roomTypeCode?: string;
  roomTypeName?: string;
  overrideDate: string;
  overrideType: string;
  overrideValue: number;
  reason?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateOverrideRequest {
  ratePlanId: number;
  roomTypeId?: number;
  overrideDate: string;
  overrideType: string;
  overrideValue: number;
  reason?: string;
}

export interface UpdateRateOverrideRequest extends Partial<CreateRateOverrideRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const rateOverrideApi = {
  createRateOverride: async (data: CreateRateOverrideRequest): Promise<RateOverrideResponse> => {
    const response = await api.post<RateOverrideResponse>('/rate-overrides', data);
    return response.data;
  },

  updateRateOverride: async (id: number, data: UpdateRateOverrideRequest): Promise<RateOverrideResponse> => {
    const response = await api.put<RateOverrideResponse>(`/rate-overrides/${id}`, data);
    return response.data;
  },

  getRateOverride: async (id: number): Promise<RateOverrideResponse> => {
    const response = await api.get<RateOverrideResponse>(`/rate-overrides/${id}`);
    return response.data;
  },

  getAllRateOverrides: async (
    page = 0,
    size = 10,
    params?: {
      ratePlanId?: number;
      roomTypeId?: number;
      overrideDate?: string;
      startDate?: string;
      endDate?: string;
      overrideType?: string;
      minOverrideValue?: number;
      maxOverrideValue?: number;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RateOverrideResponse>> => {
    const response = await api.get<CustomPage<RateOverrideResponse>>('/rate-overrides', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRateOverride: async (id: number): Promise<void> => {
    await api.delete(`/rate-overrides/${id}`);
  },
};

