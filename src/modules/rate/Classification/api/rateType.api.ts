import { rateTypeApi, RateTypeResponse, CreateRateTypeRequest, UpdateRateTypeRequest, CustomPage } from './rateType';
import { EntityStatus } from '@/types/enums';

// Re-export types for convenience within the rate classification module
export type { RateTypeResponse, CreateRateTypeRequest, UpdateRateTypeRequest, CustomPage };

// Rate types API wrapper
export const rateTypesApi = {
  // Get all rate types with optional filtering
  getAll: async (
    page = 0,
    size = 10,
    params?: {
      code?: string;
      name?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RateTypeResponse>> => {
    return rateTypeApi.getAllRateTypes(page, size, params);
  },

  // Get a single rate type by ID
  getById: async (id: number): Promise<RateTypeResponse> => {
    return rateTypeApi.getRateType(id);
  },

  // Create a new rate type
  create: async (data: CreateRateTypeRequest): Promise<RateTypeResponse> => {
    return rateTypeApi.createRateType(data);
  },

  // Update an existing rate type
  update: async (id: number, data: UpdateRateTypeRequest): Promise<RateTypeResponse> => {
    return rateTypeApi.updateRateType(id, data);
  },

  // Delete a rate type
  delete: async (id: number): Promise<void> => {
    return rateTypeApi.deleteRateType(id);
  },
};
