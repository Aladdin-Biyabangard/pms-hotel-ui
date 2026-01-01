import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface CreateServiceRequest {
    name: string;
    description?: string;
    price: number;
}

export interface UpdateServiceRequest {
    name?: string;
    description?: string;
    price?: number;
}

export interface ServiceResponse {
    id: number;
    name: string;
    description?: string;
    price: number;
    status: EntityStatus;
    createdAt: string;
    updatedAt: string;
}

export const servicesApi = {
    createService: async (data: CreateServiceRequest): Promise<ServiceResponse> => {
        const response = await api.post<ServiceResponse>('/services', data);
        return response.data;
    },

    getAllServices: async (): Promise<ServiceResponse[]> => {
        const response = await api.get<ServiceResponse[]>('/services');
        return response.data;
    },

    getServiceById: async (id: number): Promise<ServiceResponse> => {
        const response = await api.get<ServiceResponse>(`/services/${id}`);
        return response.data;
    },

    updateService: async (id: number, data: UpdateServiceRequest): Promise<ServiceResponse> => {
        const response = await api.put<ServiceResponse>(`/services/${id}`, data);
        return response.data;
    },

    deleteService: async (id: number): Promise<void> => {
        await api.delete(`/services/${id}`);
    },
};

