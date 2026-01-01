import {api} from './axios';
import {RegisterRequest} from './auth';
import {EntityStatus} from '@/types/enums';

export interface UserResponseForAdmin {
    firstName: string;
    lastName: string;
    email: string;
    roles: string[];
    status: EntityStatus;
    lastLogin: string | null;
    dateCreated: string;
}

export interface UserCriteria {
    firstName?: string;
    email?: string;
    roles?: string[];
    status?: EntityStatus;
}

export interface CustomPage<T> {
    content: T[];
    pageNumber: number;
    pageSize: number;
    totalElements?: number;
}

export const staffApi = {
    getAllUsers: async (page = 0, size = 10, criteria: UserCriteria = {}): Promise<CustomPage<UserResponseForAdmin>> => {
        const params: any = { page, size };
        if (criteria.firstName) params.firstName = criteria.firstName;
        if (criteria.email) params.email = criteria.email;
        if (criteria.roles && criteria.roles.length > 0) params.roles = criteria.roles;
        if (criteria.status) params.status = criteria.status;
        
        const response = await api.get<CustomPage<UserResponseForAdmin>>('/admin/users', { params });
        return response.data;
    },

    createEmployee: async (request: RegisterRequest, role: string): Promise<void> => {
        await api.post('/admin/users/employee', request, { params: { role } });
    },

    activateUser: async (email: string): Promise<void> => {
        await api.patch(`/admin/users/${encodeURIComponent(email)}/activate`);
    },

    deactivateUser: async (email: string): Promise<void> => {
        await api.patch(`/admin/users/${encodeURIComponent(email)}/deactivate`);
    },

    assignRole: async (email: string, role: string): Promise<void> => {
        await api.put(`/admin/users/${encodeURIComponent(email)}/roles`, null, { params: { role } });
    },

    removeRole: async (email: string, role: string): Promise<void> => {
        await api.delete(`/admin/users/${encodeURIComponent(email)}/roles`, { params: { role } });
    },

    deleteEmployee: async (email: string): Promise<void> => {
        await api.delete(`/admin/users/${encodeURIComponent(email)}`);
    }
};
