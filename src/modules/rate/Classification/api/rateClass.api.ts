import { rateClassApi, RateClassResponse, CreateRateClassRequest, UpdateRateClassRequest, CustomPage } from './rateClass';
import { EntityStatus } from '@/types/enums';

// Re-export types for convenience within the rate classification module
export type { RateClassResponse, CreateRateClassRequest, UpdateRateClassRequest, CustomPage };

// Rate classes API wrapper
export const rateClassesApi = {
  // Get all rate classes with optional filtering
  getAll: async (
    page = 0,
    size = 10,
    params?: {
      rateCategoryId?: number;
      code?: string;
      name?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RateClassResponse>> => {
    return rateClassApi.getAllRateClasses(page, size, params);
  },

  // Get a single rate class by ID
  getById: async (id: number): Promise<RateClassResponse> => {
    return rateClassApi.getRateClass(id);
  },

  // Create a new rate class
  create: async (data: CreateRateClassRequest): Promise<RateClassResponse> => {
    return rateClassApi.createRateClass(data);
  },

  // Update an existing rate class
  update: async (id: number, data: UpdateRateClassRequest): Promise<RateClassResponse> => {
    return rateClassApi.updateRateClass(id, data);
  },

  // Delete a rate class
  delete: async (id: number): Promise<void> => {
    return rateClassApi.deleteRateClass(id);
  },
};
