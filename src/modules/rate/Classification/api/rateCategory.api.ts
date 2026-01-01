import { rateCategoryApi, RateCategoryResponse, CreateRateCategoryRequest, UpdateRateCategoryRequest, CustomPage } from './rateCategory';
import { EntityStatus } from '@/types/enums';

// Re-export types for convenience within the rate classification module
export type { RateCategoryResponse, CreateRateCategoryRequest, UpdateRateCategoryRequest, CustomPage };

// Rate categories API wrapper
export const rateCategoriesApi = {
  // Get all rate categories with optional filtering
  getAll: async (
    page = 0,
    size = 10,
    params?: {
      code?: string;
      name?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RateCategoryResponse>> => {
    return rateCategoryApi.getAllRateCategories(page, size, params);
  },

  // Get a single rate category by ID
  getById: async (id: number): Promise<RateCategoryResponse> => {
    return rateCategoryApi.getRateCategory(id);
  },

  // Create a new rate category
  create: async (data: CreateRateCategoryRequest): Promise<RateCategoryResponse> => {
    return rateCategoryApi.createRateCategory(data);
  },

  // Update an existing rate category
  update: async (id: number, data: UpdateRateCategoryRequest): Promise<RateCategoryResponse> => {
    return rateCategoryApi.updateRateCategory(id, data);
  },

  // Delete a rate category
  delete: async (id: number): Promise<void> => {
    return rateCategoryApi.deleteRateCategory(id);
  },
};
