import {api} from './axios';
import {EntityStatus} from '@/types/enums';

export interface CreateStaffRequest {
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
    idNumber?: string;
    role: string;
    department?: string;
    hireDate?: string;
    salary?: number;
    employmentType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    notes?: string;
}

export interface UpdateStaffRequest {
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
    idNumber?: string;
    role?: string;
    department?: string;
    hireDate?: string;
    terminationDate?: string;
    salary?: number;
    employmentType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    notes?: string;
}

export interface StaffResponse {
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
    idNumber?: string;
    role: string;
    department?: string;
    hireDate?: string;
    terminationDate?: string;
    salary?: number;
    employmentType?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    emergencyContactRelation?: string;
    notes?: string;
    status: EntityStatus;
    createdAt: string;
    updatedAt: string;
}

export const hotelStaffApi = {
    createStaff: async (data: CreateStaffRequest): Promise<StaffResponse> => {
        const response = await api.post<StaffResponse>('/staff', data);
        return response.data;
    },

    getAllStaff: async (): Promise<StaffResponse[]> => {
        const response = await api.get<StaffResponse[]>('/staff');
        return response.data;
    },

    getStaffById: async (id: number): Promise<StaffResponse> => {
        const response = await api.get<StaffResponse>(`/staff/${id}`);
        return response.data;
    },

    getStaffByDepartment: async (department: string): Promise<StaffResponse[]> => {
        const response = await api.get<StaffResponse[]>(`/staff/department/${department}`);
        return response.data;
    },

    updateStaff: async (id: number, data: UpdateStaffRequest): Promise<StaffResponse> => {
        const response = await api.put<StaffResponse>(`/staff/${id}`, data);
        return response.data;
    },

    deleteStaff: async (id: number): Promise<void> => {
        await api.delete(`/staff/${id}`);
    },
};

