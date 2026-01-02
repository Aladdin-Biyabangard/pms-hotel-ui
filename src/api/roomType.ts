import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface RoomTypeResponse {
  id: number;
  hotelId: number;
  code: string;
  name: string;
  description?: string;
  maxOccupancy?: number;
  amenities?: string[];
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomTypeRequest {
  code: string;
  name: string;
  description?: string;
  maxOccupancy?: number;
  amenities?: string[];
}

export interface UpdateRoomTypeRequest extends Partial<CreateRoomTypeRequest> {}

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export const roomTypeApi = {
  createRoomType: async (data: CreateRoomTypeRequest): Promise<RoomTypeResponse> => {
    const response = await api.post<RoomTypeResponse>('/room-types', data);
    return response.data;
  },

  updateRoomType: async (id: number, data: UpdateRoomTypeRequest): Promise<RoomTypeResponse> => {
    const response = await api.put<RoomTypeResponse>(`/room-types/${id}`, data);
    return response.data;
  },

  getRoomType: async (id: number): Promise<RoomTypeResponse> => {
    const response = await api.get<RoomTypeResponse>(`/room-types/${id}`);
    return response.data;
  },

  getAllRoomTypes: async (
    page = 0,
    size = 10,
    params?: {
      code?: string;
      name?: string;
      status?: EntityStatus;
    }
  ): Promise<CustomPage<RoomTypeResponse>> => {
    const response = await api.get<CustomPage<RoomTypeResponse>>('/room-types', {
      params: {page, size, ...params}
    });
    return response.data;
  },


  getAllRoomTypesByRatePlanId: async (
      ratePlanId: number,
      page = 0,
      size = 10
  ): Promise<CustomPage<RoomTypeResponse>> => {
    const response = await api.get<CustomPage<RoomTypeResponse>>(
        `/room-types/by-rate/${ratePlanId}`,
        { params: { page, size } }
    );
    return response.data;
  },

  deleteRoomType: async (id: number): Promise<void> => {
    await api.delete(`/room-types/${id}`);
  },

};

