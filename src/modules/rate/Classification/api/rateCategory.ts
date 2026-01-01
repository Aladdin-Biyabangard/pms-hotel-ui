import {api} from '@/api/axios';
import {EntityStatus} from '@/types/enums';

export interface RateCategoryResponse {
  id: number;
  code: string;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateCategoryRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRateCategoryRequest extends Partial<CreateRateCategoryRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements?: number;
}

export const rateCategoryApi = {
  createRateCategory: async (data: CreateRateCategoryRequest): Promise<RateCategoryResponse> => {
    const response = await api.post<RateCategoryResponse>('/rate-categories', data);
    return response.data;
  },

  updateRateCategory: async (id: number, data: UpdateRateCategoryRequest): Promise<RateCategoryResponse> => {
    const response = await api.put<RateCategoryResponse>(`/rate-categories/${id}`, data);
    return response.data;
  },

  getRateCategory: async (id: number): Promise<RateCategoryResponse> => {
    const response = await api.get<RateCategoryResponse>(`/rate-categories/${id}`);
    return response.data;
  },

  getAllRateCategories: async (
    page = 0,
    size = 10,
    params?: {
      code?: string;
      name?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RateCategoryResponse>> => {
    const response = await api.get<CustomPage<RateCategoryResponse>>('/rate-categories', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRateCategory: async (id: number): Promise<void> => {
    await api.delete(`/rate-categories/${id}`);
  },
};
