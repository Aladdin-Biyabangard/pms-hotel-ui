import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface RateTypeResponse {
  id: number;
  hotelId: number;
  code: string;
  name: string;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRateTypeRequest {
  code: string;
  name: string;
  description?: string;
}

export interface UpdateRateTypeRequest extends Partial<CreateRateTypeRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const rateTypeApi = {
  createRateType: async (data: CreateRateTypeRequest): Promise<RateTypeResponse> => {
    const response = await api.post<RateTypeResponse>('/rate-types', data);
    return response.data;
  },

  updateRateType: async (id: number, data: UpdateRateTypeRequest): Promise<RateTypeResponse> => {
    const response = await api.put<RateTypeResponse>(`/rate-types/${id}`, data);
    return response.data;
  },

  getRateType: async (id: number): Promise<RateTypeResponse> => {
    const response = await api.get<RateTypeResponse>(`/rate-types/${id}`);
    return response.data;
  },

  getAllRateTypes: async (
    page = 0,
    size = 10,
    params?: {
      code?: string;
      name?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RateTypeResponse>> => {
    const response = await api.get<CustomPage<RateTypeResponse>>('/rate-types', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRateType: async (id: number): Promise<void> => {
    await api.delete(`/rate-types/${id}`);
  },
};

