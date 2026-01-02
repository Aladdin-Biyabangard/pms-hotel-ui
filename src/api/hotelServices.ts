import {api} from './axios';
import {CurrencyCode, EntityStatus, ServiceType} from '@/types/enums';

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface HotelServiceResponse {
    id: number;
    hotelId: number;
    name: string;
    description?: string;
    price: number;
    serviceType?: ServiceType;
    isPerPerson: boolean;
    isPerNight: boolean;
    isPerReservation: boolean;
    availableFromTime?: string;
    availableToTime?: string;
    requiresAdvanceBooking?: boolean;
    advanceBookingHours?: number;
    durationMinutes?: number;
    maxCapacity?: number;
    minQuantity?: number;
    location?: string;
    taxIncluded?: boolean;
    discountEligible?: boolean;
    currencyCode?: CurrencyCode;
    displayOrder?: number;
    imageUrl?: string;
    category?: string;
    cancellationPolicy?: string;
    cancellationHours?: number;
    isRefundable?: boolean;
    isActive?: boolean;
    notes?: string;
    status: EntityStatus;
    createdAt: string;
    updatedAt: string;
}

export interface CreateHotelServiceRequest {
    name: string;
    description?: string;
    price: number;
    serviceType?: ServiceType;
    isPerPerson?: boolean;
    isPerNight?: boolean;
    isPerReservation?: boolean;
    availableFromTime?: string;
    availableToTime?: string;
    requiresAdvanceBooking?: boolean;
    advanceBookingHours?: number;
    durationMinutes?: number;
    maxCapacity?: number;
    minQuantity?: number;
    location?: string;
    taxIncluded?: boolean;
    discountEligible?: boolean;
    currencyCode?: CurrencyCode;
    displayOrder?: number;
    imageUrl?: string;
    category?: string;
    cancellationPolicy?: string;
    cancellationHours?: number;
    isRefundable?: boolean;
    isActive?: boolean;
    notes?: string;
}

export interface UpdateHotelServiceRequest {
    name?: string;
    description?: string;
    price?: number;
    serviceType?: ServiceType;
    isPerPerson?: boolean;
    isPerNight?: boolean;
    isPerReservation?: boolean;
    availableFromTime?: string;
    availableToTime?: string;
    requiresAdvanceBooking?: boolean;
    advanceBookingHours?: number;
    durationMinutes?: number;
    maxCapacity?: number;
    minQuantity?: number;
    location?: string;
    taxIncluded?: boolean;
    discountEligible?: boolean;
    currencyCode?: CurrencyCode;
    displayOrder?: number;
    imageUrl?: string;
    category?: string;
    cancellationPolicy?: string;
    cancellationHours?: number;
    isRefundable?: boolean;
    isActive?: boolean;
    notes?: string;
}

export interface HotelServiceCriteria {
    name?: string;
    serviceType?: ServiceType;
    minPrice?: number;
    maxPrice?: number;
    isPerPerson?: boolean;
    isPerNight?: boolean;
    isPerReservation?: boolean;
    isActive?: boolean;
    requiresAdvanceBooking?: boolean;
    category?: string;
    location?: string;
    currencyCode?: CurrencyCode;
    status?: EntityStatus;
}

export const hotelServicesApi = {
    getAllServices: async (
        criteria?: HotelServiceCriteria,
        page: number = 0,
        size: number = 10
    ): Promise<CustomPage<HotelServiceResponse>> => {
        const params = new URLSearchParams();
        if (criteria) {
            if (criteria.name) params.append('name', criteria.name);
            if (criteria.serviceType) params.append('serviceType', criteria.serviceType);
            if (criteria.minPrice !== undefined) params.append('minPrice', criteria.minPrice.toString());
            if (criteria.maxPrice !== undefined) params.append('maxPrice', criteria.maxPrice.toString());
            if (criteria.isPerPerson !== undefined) params.append('isPerPerson', criteria.isPerPerson.toString());
            if (criteria.isPerNight !== undefined) params.append('isPerNight', criteria.isPerNight.toString());
            if (criteria.isPerReservation !== undefined) params.append('isPerReservation', criteria.isPerReservation.toString());
            if (criteria.isActive !== undefined) params.append('isActive', criteria.isActive.toString());
            if (criteria.requiresAdvanceBooking !== undefined) params.append('requiresAdvanceBooking', criteria.requiresAdvanceBooking.toString());
            if (criteria.category) params.append('category', criteria.category);
            if (criteria.location) params.append('location', criteria.location);
            if (criteria.currencyCode) params.append('currencyCode', criteria.currencyCode);
            if (criteria.status) params.append('status', criteria.status);
        }
        params.append('page', page.toString());
        params.append('size', size.toString());
        
        const response = await api.get<CustomPage<HotelServiceResponse>>(`/hotel-services?${params.toString()}`);
        return response.data;
    },

    getServiceById: async (id: number): Promise<HotelServiceResponse> => {
        const response = await api.get<HotelServiceResponse>(`/hotel-services/${id}`);
        return response.data;
    },

    getServicesByType: async (serviceType: ServiceType): Promise<HotelServiceResponse[]> => {
        const response = await api.get<HotelServiceResponse[]>(`/hotel-services/type/${serviceType}`);
        return response.data;
    },

    createService: async (data: CreateHotelServiceRequest): Promise<HotelServiceResponse> => {
        const response = await api.post<HotelServiceResponse>('/hotel-services', data);
        return response.data;
    },

    updateService: async (id: number, data: UpdateHotelServiceRequest): Promise<HotelServiceResponse> => {
        const response = await api.put<HotelServiceResponse>(`/hotel-services/${id}`, data);
        return response.data;
    },

    deleteService: async (id: number): Promise<void> => {
        await api.delete(`/hotel-services/${id}`);
    },
};
