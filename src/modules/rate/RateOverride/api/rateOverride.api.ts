import {
    CreateRateOverrideRequest,
    CustomPage,
    rateOverrideApi,
    RateOverrideResponse,
    UpdateRateOverrideRequest
} from './rateOverride';
import {EntityStatus} from '@/types/enums';

// Re-export types for convenience within the rate overrides module
export type { RateOverrideResponse, CreateRateOverrideRequest, UpdateRateOverrideRequest, CustomPage };

// Rate overrides API wrapper
export const rateOverridesApi = {
  // Get all rate overrides with optional filtering
  getAll: async (
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
    return rateOverrideApi.getAllRateOverrides(page, size, params);
  },

  // Get a single rate override by ID
  getById: async (id: number): Promise<RateOverrideResponse> => {
    return rateOverrideApi.getRateOverride(id);
  },

  // Create a new rate override
  create: async (data: CreateRateOverrideRequest): Promise<RateOverrideResponse> => {
    return rateOverrideApi.createRateOverride(data);
  },

  // Update an existing rate override
  update: async (id: number, data: UpdateRateOverrideRequest): Promise<RateOverrideResponse> => {
    return rateOverrideApi.updateRateOverride(id, data);
  },

  // Delete a rate override
  delete: async (id: number): Promise<void> => {
    return rateOverrideApi.deleteRateOverride(id);
  },
};
