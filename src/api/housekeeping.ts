import {api} from './axios';
import {EntityStatus, HousekeepingStatus} from '@/types/enums';

export interface CreateHousekeepingRequest {
    roomId: number;
    staffId: number;
    housekeepingStatus?: HousekeepingStatus;
    cleaningDate: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    taskType?: string;
    priority?: string;
    notes?: string;
}

export interface UpdateHousekeepingRequest {
    roomId?: number;
    staffId?: number;
    housekeepingStatus?: HousekeepingStatus;
    cleaningDate?: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    taskType?: string;
    priority?: string;
    notes?: string;
    issues?: string;
    inspected?: boolean;
    inspectorName?: string;
}

export interface HousekeepingResponse {
    id: number;
    roomId: number;
    roomNumber?: string;
    staffId: number;
    staffName?: string;
    status: EntityStatus;
    housekeepingStatus: HousekeepingStatus;
    cleaningDate: string;
    scheduledStartTime?: string;
    scheduledEndTime?: string;
    actualStartTime?: string;
    actualEndTime?: string;
    taskType?: string;
    priority?: string;
    notes?: string;
    issues?: string;
    inspected?: boolean;
    inspectionDate?: string;
    inspectorName?: string;
    createdAt: string;
    updatedAt: string;
}

export const housekeepingApi = {
    createHousekeeping: async (data: CreateHousekeepingRequest): Promise<HousekeepingResponse> => {
        const response = await api.post<HousekeepingResponse>('/housekeeping', data);
        return response.data;
    },

    getAllHousekeepings: async (): Promise<HousekeepingResponse[]> => {
        const response = await api.get<HousekeepingResponse[]>('/housekeeping');
        return response.data;
    },

    getHousekeepingById: async (id: number): Promise<HousekeepingResponse> => {
        const response = await api.get<HousekeepingResponse>(`/housekeeping/${id}`);
        return response.data;
    },

    getHousekeepingsByRoomId: async (roomId: number): Promise<HousekeepingResponse[]> => {
        const response = await api.get<HousekeepingResponse[]>(`/housekeeping/room/${roomId}`);
        return response.data;
    },

    getHousekeepingsByStatus: async (status: HousekeepingStatus): Promise<HousekeepingResponse[]> => {
        const response = await api.get<HousekeepingResponse[]>(`/housekeeping/status/${status}`);
        return response.data;
    },

    updateHousekeeping: async (id: number, data: UpdateHousekeepingRequest): Promise<HousekeepingResponse> => {
        const response = await api.put<HousekeepingResponse>(`/housekeeping/${id}`, data);
        return response.data;
    },

    updateStatus: async (id: number, status: HousekeepingStatus): Promise<HousekeepingResponse> => {
        const response = await api.put<HousekeepingResponse>(`/housekeeping/${id}/status`, null, {
            params: { status }
        });
        return response.data;
    },

    deleteHousekeeping: async (id: number): Promise<void> => {
        await api.delete(`/housekeeping/${id}`);
    },
};

