import {api} from '@/api/axios';
import {EntityStatus} from '@/types/enums';

export interface RateClassResponse {
  id: number;
  rateCategoryId?: number;
  rateCategoryCode?: string;
  rateCategoryName?: string;
  code: string;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateClassRequest {
  rateCategoryId: number;
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRateClassRequest extends Partial<CreateRateClassRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const rateClassApi = {
  createRateClass: async (data: CreateRateClassRequest): Promise<RateClassResponse> => {
    const response = await api.post<RateClassResponse>('/rate-classes', data);
    return response.data;
  },

  updateRateClass: async (id: number, data: UpdateRateClassRequest): Promise<RateClassResponse> => {
    const response = await api.put<RateClassResponse>(`/rate-classes/${id}`, data);
    return response.data;
  },

  getRateClass: async (id: number): Promise<RateClassResponse> => {
    const response = await api.get<RateClassResponse>(`/rate-classes/${id}`);
    return response.data;
  },

  getAllRateClasses: async (
    page = 0,
    size = 10,
    params?: {
      rateCategoryId?: number;
      code?: string;
      name?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RateClassResponse>> => {
    const response = await api.get<CustomPage<RateClassResponse>>('/rate-classes', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRateClass: async (id: number): Promise<void> => {
    await api.delete(`/rate-classes/${id}`);
  },
};
