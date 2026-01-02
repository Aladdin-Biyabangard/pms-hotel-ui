import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface RoomCriteria {
    roomNumber?: string;
    roomType?: string; // Dynamic code from RoomType entity
    roomStatus?: string; // RoomStatus enum value
    status?: EntityStatus;
    floor?: number;
    minOccupancy?: number;
    maxOccupancy?: number;
    minPricePerNight?: number;
    maxPricePerNight?: number;
    smokingAllowed?: boolean;
    wheelchairAccessible?: boolean;
    extraBedAvailable?: boolean;
}

export interface CreateHotelRequest {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
    description?: string;
    starRating?: number;
    photoUrls?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    policies?: string;
    facilities?: string[];
    website?: string;
    timezone?: string;
    totalRooms?: number;
    totalFloors?: number;
    cancellationPolicy?: string;
    taxRate?: number;
    serviceChargeRate?: number;
}

export interface HotelResponse {
    id: number;
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
    zipCode: string;
    phoneNumber: string;
    email: string;
    description?: string;
    starRating?: number;
    rating?: number;
    photoUrls?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    policies?: string;
    facilities?: string[];
    website?: string;
    timezone?: string;
    totalRooms?: number;
    totalFloors?: number;
    cancellationPolicy?: string;
    taxRate?: number;
    serviceChargeRate?: number;
}

export interface UpdateHotelRequest {
    name?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    phoneNumber?: string;
    email?: string;
    description?: string;
    starRating?: number;
    photoUrls?: string[];
    checkInTime?: string;
    checkOutTime?: string;
    policies?: string;
    facilities?: string[];
    website?: string;
    timezone?: string;
    totalRooms?: number;
    totalFloors?: number;
    cancellationPolicy?: string;
    taxRate?: number;
    serviceChargeRate?: number;
}

export interface CreateRoomRequest {
    roomNumber: string;
    roomType: string; // Dynamic code from RoomType entity (e.g., 'DLX', 'STD', 'STE')
    pricePerNight: number;
    floor: number;
    bedCount: number;
    occupancy: number;
    area?: number;
    maxAdults?: number;
    maxChildren?: number;
    viewType?: string;
    smokingAllowed?: boolean;
    extraBedAvailable?: boolean;
    extraBedPrice?: number;
    minStayNights?: number;
    maxStayNights?: number;
    weekendPricePerNight?: number;
    seasonalPricePerNight?: number;
    wheelchairAccessible?: boolean;
    description?: string;
    maintenanceNotes?: string;
    amenities?: string[];
    roomStatus?: string; // RoomStatus enum value
}

export interface UpdateRoomRequest {
    roomNumber?: string;
    roomType?: string; // Dynamic code from RoomType entity
    pricePerNight?: number;
    floor?: number;
    bedCount?: number;
    occupancy?: number;
    area?: number;
    maxAdults?: number;
    maxChildren?: number;
    viewType?: string;
    smokingAllowed?: boolean;
    extraBedAvailable?: boolean;
    extraBedPrice?: number;
    minStayNights?: number;
    maxStayNights?: number;
    weekendPricePerNight?: number;
    seasonalPricePerNight?: number;
    wheelchairAccessible?: boolean;
    description?: string;
    maintenanceNotes?: string;
    amenities?: string[];
    mainImageUrl?: string;
    roomStatus?: string; // RoomStatus enum value
}

export interface RoomResponse {
    id: number;
    hotelId: number;
    roomNumber: string;
    roomType: string; // Dynamic code from RoomType entity
    status: 'PENDING' | 'DELETED' | 'CREATED' | 'PUBLISHED' | 'DRAFT' | 'ACTIVE' | 'INACTIVE';
    pricePerNight: number;
    floor: number;
    bedCount: number;
    occupancy: number;
    area?: number;
    maxAdults?: number;
    maxChildren?: number;
    viewType?: string;
    smokingAllowed?: boolean;
    extraBedAvailable?: boolean;
    extraBedPrice?: number;
    minStayNights?: number;
    maxStayNights?: number;
    weekendPricePerNight?: number;
    seasonalPricePerNight?: number;
    wheelchairAccessible?: boolean;
    description?: string;
    maintenanceNotes?: string;
    amenities?: string[];
    createdAt: string;
    updatedAt: string;
    photoUrls?: string[];
    mainImageUrl?: string;
    roomStatus?: string; // RoomStatus enum value
    // Additional fields from backend
    statusReason?: string;
    lastStatusChangeAt?: string;
}

export const hotelApi = {
    // Hotel Operations
    createHotel: async (data: CreateHotelRequest): Promise<HotelResponse> => {
        const response = await api.post<HotelResponse>('/hotels', data);
        return response.data;
    },

    getAllHotels: async (): Promise<HotelResponse[]> => {
        const response = await api.get<HotelResponse[]>('/hotels');
        return response.data;
    },

    getHotelById: async (id: number): Promise<HotelResponse> => {
        const response = await api.get<HotelResponse>(`/hotels/${id}`);
        return response.data;
    },

    updateHotel: async (id: number, data: UpdateHotelRequest): Promise<HotelResponse> => {
        const response = await api.put<HotelResponse>(`/hotels/${id}`, data);
        return response.data;
    },

    deleteHotel: async (id: number): Promise<void> => {
        await api.delete(`/hotels/${id}`);
    },

    uploadHotelImage: async (id: number, file: File): Promise<HotelResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<HotelResponse>(`/hotels/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteHotelImage: async (id: number, imageUrl: string): Promise<HotelResponse> => {
        // Send imageUrl as query param
        const response = await api.delete<HotelResponse>(`/hotels/${id}/images`, {
            params: { imageUrl }
        });
        return response.data;
    },

    // Room Operations
    createRoom: async (data: CreateRoomRequest): Promise<RoomResponse> => {
        const response = await api.post<RoomResponse>('/rooms', data);
        return response.data;
    },

    updateRoom: async (id: number, data: UpdateRoomRequest): Promise<RoomResponse> => {
        const response = await api.put<RoomResponse>(`/rooms/${id}`, data);
        return response.data;
    },

    deleteRoom: async (id: number): Promise<void> => {
        await api.delete(`/rooms/${id}`);
    },

    getRoomById: async (id: number): Promise<RoomResponse> => {
        const response = await api.get<RoomResponse>(`/rooms/${id}`);
        return response.data;
    },

    getAllRooms: async (): Promise<RoomResponse[]> => {
        // Use a large page size to get all rooms, then extract content
        const response = await api.get<CustomPage<RoomResponse>>('/rooms', {
            params: { page: 0, size: 10000 }
        });
        return response.data.content;
    },

    getRoomsByHotel: async (hotelId: number): Promise<RoomResponse[]> => {
        // Backend already filters by current user's hotel automatically via HotelAwareService
        // Use a large page size to get all rooms, then extract content
        // The hotelId parameter is kept for API consistency but backend handles filtering via user context
        const response = await api.get<CustomPage<RoomResponse>>('/rooms', {
            params: { page: 0, size: 10000 }
        });
        return response.data.content;
    },

    getAllRoomsWithCriteria: async (
        page = 0,
        size = 10,
        criteria: RoomCriteria = {}
    ): Promise<CustomPage<RoomResponse>> => {
        const params: any = { page, size };
        if (criteria.roomNumber) params.roomNumber = criteria.roomNumber;
        if (criteria.roomType) params.roomType = criteria.roomType;
        if (criteria.roomStatus) params.roomStatus = criteria.roomStatus;
        if (criteria.status) params.status = criteria.status;
        if (criteria.floor) params.floor = criteria.floor;
        if (criteria.minOccupancy) params.minOccupancy = criteria.minOccupancy;
        if (criteria.maxOccupancy) params.maxOccupancy = criteria.maxOccupancy;
        if (criteria.minPricePerNight) params.minPricePerNight = criteria.minPricePerNight;
        if (criteria.maxPricePerNight) params.maxPricePerNight = criteria.maxPricePerNight;
        if (criteria.smokingAllowed !== undefined) params.smokingAllowed = criteria.smokingAllowed;
        if (criteria.wheelchairAccessible !== undefined) params.wheelchairAccessible = criteria.wheelchairAccessible;
        if (criteria.extraBedAvailable !== undefined) params.extraBedAvailable = criteria.extraBedAvailable;
        
        const response = await api.get<CustomPage<RoomResponse>>('/rooms', { params });
        return response.data;
    },

    uploadRoomImage: async (id: number, file: File): Promise<RoomResponse> => {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post<RoomResponse>(`/rooms/${id}/images`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    },

    deleteRoomImage: async (id: number, imageUrl: string): Promise<RoomResponse> => {
        const response = await api.delete<RoomResponse>(`/rooms/${id}/images`, {
            params: { imageUrl }
        });
        return response.data;
    },

    setMainRoomImage: async (id: number, imageUrl: string): Promise<RoomResponse> => {
        const response = await api.put<RoomResponse>(`/rooms/${id}/images/main`, null, {
            params: { imageUrl }
        });
        return response.data;
    }
};
