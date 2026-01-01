import {
    COMPONENT_TYPES,
    CreateRatePackageComponentRequest,
    CustomPage,
    ratePackageComponentApi,
    RatePackageComponentResponse,
    UpdateRatePackageComponentRequest
} from '@/api/ratePackageComponent';
import {EntityStatus} from '@/types/enums';

// Re-export types for convenience within the package module
export type { RatePackageComponentResponse, CreateRatePackageComponentRequest, UpdateRatePackageComponentRequest, CustomPage };
export { COMPONENT_TYPES };

// Package components API wrapper
export const packageComponentsApi = {
  // Get all package components with optional filtering
  getAll: async (
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
    return ratePackageComponentApi.getAllRatePackageComponents(page, size, params);
  },

  // Get a single package component by ID
  getById: async (id: number): Promise<RatePackageComponentResponse> => {
    return ratePackageComponentApi.getRatePackageComponent(id);
  },

  // Create a new package component
  create: async (data: CreateRatePackageComponentRequest): Promise<RatePackageComponentResponse> => {
    return ratePackageComponentApi.createRatePackageComponent(data);
  },

  // Update an existing package component
  update: async (id: number, data: UpdateRatePackageComponentRequest): Promise<RatePackageComponentResponse> => {
    return ratePackageComponentApi.updateRatePackageComponent(id, data);
  },

  // Delete a package component
  delete: async (id: number): Promise<void> => {
    return ratePackageComponentApi.deleteRatePackageComponent(id);
  },
};
