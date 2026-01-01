import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export type PricingRuleType = 
  | 'EARLY_BOOKING'
  | 'LAST_MINUTE'
  | 'EXTENDED_STAY'
  | 'WEEKEND'
  | 'WEEKDAY'
  | 'SEASONAL'
  | 'PROMOTIONAL'
  | 'OCCUPANCY_BASED'
  | 'MEMBER_DISCOUNT'
  | 'CORPORATE'
  | 'GROUP'
  | 'OTHER';

export interface PricingRuleResponse {
  id: number;
  hotelId: number;
  ruleName: string;
  ruleType: PricingRuleType;
  status: EntityStatus;
  startDate?: string;
  endDate?: string;
  discountPercentage?: number;
  discountAmount?: number;
  priceAdjustment?: number;
  minimumNights?: number;
  maximumNights?: number;
  advanceBookingDays?: number;
  isActive: boolean;
  priority: number;
  description?: string;
  conditions?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePricingRuleRequest {
  ruleName: string;
  ruleType: PricingRuleType;
  startDate?: string;
  endDate?: string;
  discountPercentage?: number;
  discountAmount?: number;
  priceAdjustment?: number;
  minimumNights?: number;
  maximumNights?: number;
  advanceBookingDays?: number;
  isActive?: boolean;
  priority?: number;
  description?: string;
  conditions?: string;
}

export interface UpdatePricingRuleRequest extends Partial<CreatePricingRuleRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements?: number;
}

export const PRICING_RULE_TYPES = [
  { value: 'EARLY_BOOKING', label: 'Early Booking', description: 'Discount for booking in advance' },
  { value: 'LAST_MINUTE', label: 'Last Minute', description: 'Discount for last-minute bookings' },
  { value: 'EXTENDED_STAY', label: 'Extended Stay', description: 'Discount for longer stays' },
  { value: 'WEEKEND', label: 'Weekend', description: 'Weekend rate adjustment' },
  { value: 'WEEKDAY', label: 'Weekday', description: 'Weekday rate adjustment' },
  { value: 'SEASONAL', label: 'Seasonal', description: 'Seasonal rate adjustment' },
  { value: 'PROMOTIONAL', label: 'Promotional', description: 'Special promotional discount' },
  { value: 'OCCUPANCY_BASED', label: 'Occupancy Based', description: 'Rate based on occupancy level' },
  { value: 'MEMBER_DISCOUNT', label: 'Member Discount', description: 'Loyalty member discount' },
  { value: 'CORPORATE', label: 'Corporate', description: 'Corporate rate discount' },
  { value: 'GROUP', label: 'Group', description: 'Group booking discount' },
  { value: 'OTHER', label: 'Other', description: 'Custom pricing rule' },
] as const;

export const pricingRuleApi = {
  createPricingRule: async (data: CreatePricingRuleRequest): Promise<PricingRuleResponse> => {
    const response = await api.post<PricingRuleResponse>('/pricing-rules', data);
    return response.data;
  },

  updatePricingRule: async (id: number, data: UpdatePricingRuleRequest): Promise<PricingRuleResponse> => {
    const response = await api.put<PricingRuleResponse>(`/pricing-rules/${id}`, data);
    return response.data;
  },

  getPricingRule: async (id: number): Promise<PricingRuleResponse> => {
    const response = await api.get<PricingRuleResponse>(`/pricing-rules/${id}`);
    return response.data;
  },

  getAllPricingRules: async (
    page = 0,
    size = 10,
    params?: {
      ruleName?: string;
      ruleType?: PricingRuleType;
      isActive?: boolean;
      startDate?: string;
      endDate?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<PricingRuleResponse>> => {
    const response = await api.get<CustomPage<PricingRuleResponse>>('/pricing-rules', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deletePricingRule: async (id: number): Promise<void> => {
    await api.delete(`/pricing-rules/${id}`);
  },

  toggleActive: async (id: number, isActive: boolean): Promise<PricingRuleResponse> => {
    const response = await api.patch<PricingRuleResponse>(`/pricing-rules/${id}/toggle`, null, {
      params: { isActive }
    });
    return response.data;
  },

  updatePriority: async (id: number, priority: number): Promise<PricingRuleResponse> => {
    const response = await api.patch<PricingRuleResponse>(`/pricing-rules/${id}/priority`, null, {
      params: { priority }
    });
    return response.data;
  },
};

