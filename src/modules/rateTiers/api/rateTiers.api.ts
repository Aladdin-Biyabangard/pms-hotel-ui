import {CreateRateTierRequest, CustomPage, rateTierApi, RateTierResponse, UpdateRateTierRequest} from '@/api/rateTier';

// Re-export types for convenience within the rate tiers module
export type { RateTierResponse, CreateRateTierRequest, UpdateRateTierRequest, CustomPage };

// Rate tiers API wrapper
export const rateTiersApi = {
  // Get all rate tiers with optional filtering
  getAll: async (
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
    return rateTierApi.getAllRateTiers(page, size, params);
  },

  // Get a single rate tier by ID
  getById: async (id: number): Promise<RateTierResponse> => {
    return rateTierApi.getRateTier(id);
  },

  // Create a new rate tier
  create: async (data: CreateRateTierRequest): Promise<RateTierResponse> => {
    return rateTierApi.createRateTier(data);
  },

  // Update an existing rate tier
  update: async (id: number, data: UpdateRateTierRequest): Promise<RateTierResponse> => {
    return rateTierApi.updateRateTier(id, data);
  },

  // Delete a rate tier
  delete: async (id: number): Promise<void> => {
    return rateTierApi.deleteRateTier(id);
  },

  // Update priorities in batch
  updatePriorities: async (updates: Array<{ id: number; priority: number }>): Promise<void> => {
    return rateTierApi.updatePriorities(updates);
  },
};
