import {api} from './axios';
import {EntityStatus, GuestType} from '@/types/enums';

export interface CustomPage<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface GuestCriteria {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    guestType?: GuestType;
    status?: EntityStatus;
    loyaltyMember?: boolean;
    nationality?: string;
    country?: string;
}

export interface CreateGuestRequest {
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiryDate?: string;
    idNumber?: string;
    guestType?: GuestType;
    loyaltyMember?: boolean;
    preferredLanguage?: string;
    dietaryPreferences?: string;
    specialNeeds?: string;
    notes?: string;
    companyName?: string;
    companyAddress?: string;
    taxId?: string;
}

export interface UpdateGuestRequest {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiryDate?: string;
    idNumber?: string;
    guestType?: GuestType;
    loyaltyMember?: boolean;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    preferredLanguage?: string;
    dietaryPreferences?: string;
    specialNeeds?: string;
    notes?: string;
    companyName?: string;
    companyAddress?: string;
    taxId?: string;
}

export interface GuestResponse {
    id: number;
    firstName: string;
    lastName: string;
    email?: string;
    phone: string;
    alternatePhone?: string;
    address?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
    dateOfBirth?: string;
    nationality?: string;
    passportNumber?: string;
    passportExpiryDate?: string;
    idNumber?: string;
    guestType?: GuestType;
    loyaltyMember?: boolean;
    loyaltyPoints?: number;
    loyaltyTier?: string;
    preferredLanguage?: string;
    dietaryPreferences?: string;
    specialNeeds?: string;
    notes?: string;
    companyName?: string;
    companyAddress?: string;
    taxId?: string;
    status: EntityStatus;
    createdAt: string;
    updatedAt: string;
}

export const guestsApi = {
    createGuest: async (data: CreateGuestRequest): Promise<GuestResponse> => {
        const response = await api.post<GuestResponse>('/guests', data);
        return response.data;
    },

    getAllGuests: async (): Promise<GuestResponse[]> => {
        // Backend returns CustomPage, so we need to request a large page size to get all guests
        const response = await api.get<CustomPage<GuestResponse>>('/guests', {
            params: { page: 0, size: 10000 }
        });
        // Extract the content array from the paginated response
        return Array.isArray(response.data?.content) ? response.data.content : [];
    },

    getAllGuestsWithCriteria: async (
        page = 0,
        size = 10,
        criteria: GuestCriteria = {}
    ): Promise<CustomPage<GuestResponse>> => {
        const params: any = { page, size };
        if (criteria.firstName) params.firstName = criteria.firstName;
        if (criteria.lastName) params.lastName = criteria.lastName;
        if (criteria.email) params.email = criteria.email;
        if (criteria.phone) params.phone = criteria.phone;
        if (criteria.guestType) params.guestType = criteria.guestType;
        if (criteria.status) params.status = criteria.status;
        if (criteria.loyaltyMember !== undefined) params.loyaltyMember = criteria.loyaltyMember;
        if (criteria.nationality) params.nationality = criteria.nationality;
        if (criteria.country) params.country = criteria.country;
        
        const response = await api.get<CustomPage<GuestResponse>>('/guests', { params });
        return response.data;
    },

    getGuestById: async (id: number): Promise<GuestResponse> => {
        const response = await api.get<GuestResponse>(`/guests/${id}`);
        return response.data;
    },

    updateGuest: async (id: number, data: UpdateGuestRequest): Promise<GuestResponse> => {
        const response = await api.put<GuestResponse>(`/guests/${id}`, data);
        return response.data;
    },

    deleteGuest: async (id: number): Promise<void> => {
        await api.delete(`/guests/${id}`);
    },
};

