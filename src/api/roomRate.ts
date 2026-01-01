import {api} from './axios';
import {EntityStatus} from '@/types/enums';
import {RatePlanResponse} from './ratePlan';
import {RoomTypeResponse} from './roomType';

export interface RoomRateResponse {
  id: number;
  ratePlan: RatePlanResponse;
  roomTypeResponse?: RoomTypeResponse; // Backend returns roomTypeResponse
  roomType?: RoomTypeResponse; // Alias for compatibility
  roomNumber?: string;
  rateDate: string;
  rateAmount: number;
  currency?: string;
  availabilityCount?: number;
  minAvailability?: number;
  minGuests?: number;
  maxGuests?: number;
  stopSell?: boolean;
  closedForArrival?: boolean;
  closedForDeparture?: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
  // Oracle OPERA additional fields
  rateCode?: string;
  rateClass?: string;
  allotment?: number;
  releaseDays?: number;
  cutoffDays?: number;
  guaranteeRequired?: boolean;
  depositRequired?: boolean;
  depositAmount?: number;
}

export interface CreateRoomRateRequest {
  ratePlanCode: string;
  roomTypeCode: string;
  rateDate: string;
  rateAmount: number;
  currency?: string;
  availabilityCount?: number;
  minAvailability?: number;
  minGuests?: number;
  maxGuests?: number;
  stopSell?: boolean;
  closedForArrival?: boolean;
  closedForDeparture?: boolean;
  // Oracle OPERA additional fields
  rateCode?: string;
  rateClass?: string;
  allotment?: number;
  releaseDays?: number;
  cutoffDays?: number;
  guaranteeRequired?: boolean;
  depositRequired?: boolean;
  depositAmount?: number;
}

export interface UpdateRoomRateRequest extends Partial<CreateRoomRateRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements?: number;
}

export const roomRateApi = {
  createRoomRate: async (data: CreateRoomRateRequest): Promise<RoomRateResponse> => {
    const response = await api.post<RoomRateResponse>('/room-rates', data);
    return response.data;
  },

  updateRoomRate: async (id: number, data: UpdateRoomRateRequest): Promise<RoomRateResponse> => {
    const response = await api.put<RoomRateResponse>(`/room-rates/${id}`, data);
    return response.data;
  },

  getRoomRate: async (id: number): Promise<RoomRateResponse> => {
    const response = await api.get<RoomRateResponse>(`/room-rates/${id}`);
    return response.data;
  },

  getAllRoomRates: async (
    page = 0,
    size = 10,
    params?: {
      ratePlanCode?: string;
      roomTypeCode?: string;
      rateDate?: string;
      startDate?: string;
      endDate?: string;
      minRateAmount?: number;
      maxRateAmount?: number;
      stopSell?: boolean;
      closedForArrival?: boolean;
      closedForDeparture?: boolean;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RoomRateResponse>> => {
    const response = await api.get<CustomPage<RoomRateResponse>>('/room-rates', {
      params: {page, size, ...params}
    });
    return response.data;
  },

  deleteRoomRate: async (id: number): Promise<void> => {
    await api.delete(`/room-rates/${id}`);
  },

  deleteRoomRatesByDateRange: async (startDate: string, endDate: string): Promise<void> => {
    await api.delete('/room-rates/date-range', {
      params: {startDate, endDate}
    });
  },
};

