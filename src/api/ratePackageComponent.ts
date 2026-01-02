import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface RatePackageComponentResponse {
  id: number;
  ratePlanId: number;
  ratePlanCode?: string;
  ratePlanName?: string;
  componentType: string;
  componentCode?: string;
  componentName: string;
  quantity: number;
  unitPrice?: number;
  priceAdult?: number;
  priceChild?: number;
  priceInfant?: number;
  isIncluded: boolean;
  description?: string;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRatePackageComponentRequest {
  ratePlanId: number;
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
}

export interface UpdateRatePackageComponentRequest extends Partial<CreateRatePackageComponentRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const COMPONENT_TYPES = [
  { value: 'SERVICE', label: 'Service' },
  { value: 'MEAL', label: 'Meal' },
  { value: 'ACTIVITY', label: 'Activity' },
  { value: 'TRANSPORTATION', label: 'Transportation' },
  { value: 'AMENITY', label: 'Amenity' },
  { value: 'DISCOUNT', label: 'Discount' },
  { value: 'OTHER', label: 'Other' },
] as const;

export const ratePackageComponentApi = {
  createRatePackageComponent: async (data: CreateRatePackageComponentRequest): Promise<RatePackageComponentResponse> => {
    const response = await api.post<RatePackageComponentResponse>('/rate-package-components', data);
    return response.data;
  },

  updateRatePackageComponent: async (id: number, data: UpdateRatePackageComponentRequest): Promise<RatePackageComponentResponse> => {
    const response = await api.put<RatePackageComponentResponse>(`/rate-package-components/${id}`, data);
    return response.data;
  },

  getRatePackageComponent: async (id: number): Promise<RatePackageComponentResponse> => {
    const response = await api.get<RatePackageComponentResponse>(`/rate-package-components/${id}`);
    return response.data;
  },

  getAllRatePackageComponents: async (
    page = 0,
    size = 10,
    params?: {
      ratePlanId?: number;
      componentType?: string;
      componentCode?: string;
      componentName?: string;
      isIncluded?: boolean;
      minUnitPrice?: number;
      maxUnitPrice?: number;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RatePackageComponentResponse>> => {
    const response = await api.get<CustomPage<RatePackageComponentResponse>>('/rate-package-components', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRatePackageComponent: async (id: number): Promise<void> => {
    await api.delete(`/rate-package-components/${id}`);
  },
};

