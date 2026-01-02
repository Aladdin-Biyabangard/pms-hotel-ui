import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface RateTierResponse {
  id: number;
  ratePlanId: number;
  ratePlanCode?: string;
  ratePlanName?: string;
  minNights: number;
  maxNights?: number;
  adjustmentType: string;
  adjustmentValue: number;
  priority: number;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateTierRequest {
  ratePlanId: number;
  minNights: number;
  maxNights?: number;
  adjustmentType: string;
  adjustmentValue: number;
  priority?: number;
}

export interface UpdateRateTierRequest extends Partial<CreateRateTierRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const rateTierApi = {
  createRateTier: async (data: CreateRateTierRequest): Promise<RateTierResponse> => {
    const response = await api.post<RateTierResponse>('/rate-tiers', data);
    return response.data;
  },

  updateRateTier: async (id: number, data: UpdateRateTierRequest): Promise<RateTierResponse> => {
    const response = await api.put<RateTierResponse>(`/rate-tiers/${id}`, data);
    return response.data;
  },

  getRateTier: async (id: number): Promise<RateTierResponse> => {
    const response = await api.get<RateTierResponse>(`/rate-tiers/${id}`);
    return response.data;
  },

  getAllRateTiers: async (
      page = 0,
      size = 10,
      params?: {
          ratePlanId: number;
          minNights?: number;
          maxNights?: number;
          adjustmentType?: string;
          minAdjustmentValue?: number;
          maxAdjustmentValue?: number;
          priority?: number;
          status?: string
      }
  ): Promise<CustomPage<RateTierResponse>> => {
    const response = await api.get<CustomPage<RateTierResponse>>('/rate-tiers', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRateTier: async (id: number): Promise<void> => {
    await api.delete(`/rate-tiers/${id}`);
  },

  updatePriorities: async (updates: Array<{ id: number; priority: number }>): Promise<void> => {
    // Update priorities in batch
    await Promise.all(
      updates.map(update => 
        rateTierApi.updateRateTier(update.id, { priority: update.priority })
      )
    );
  },
};

