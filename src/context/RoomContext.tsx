import React, {createContext, ReactNode, useCallback, useContext, useState} from 'react';
import {hotelApi, RoomResponse} from '@/api/hotel';
import {toast} from 'sonner';

interface RoomContextType {
    rooms: RoomResponse[];
    isLoading: boolean;
    error: string | null;
    loadRooms: (hotelId: number) => Promise<void>;
    createRoom: (data: any) => Promise<RoomResponse | null>;
    updateRoom: (id: number, data: any) => Promise<RoomResponse | null>;
    deleteRoom: (id: number) => Promise<boolean>;
    getRoomById: (id: number) => Promise<RoomResponse | null>;
    refreshRooms: (hotelId: number) => Promise<void>;
}

const RoomContext = createContext<RoomContextType | undefined>(undefined);

export const useRoomContext = () => {
    const context = useContext(RoomContext);
    if (!context) {
        throw new Error('useRoomContext must be used within a RoomProvider');
    }
    return context;
};

interface RoomProviderProps {
    children: ReactNode;
}

export const RoomProvider: React.FC<RoomProviderProps> = ({ children }) => {
    const [rooms, setRooms] = useState<RoomResponse[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentHotelId, setCurrentHotelId] = useState<number | null>(null);

    const loadRooms = useCallback(async (hotelId: number) => {
        setIsLoading(true);
        setError(null);
        setCurrentHotelId(hotelId);
        try {
            const data = await hotelApi.getRoomsByHotel(hotelId);
            setRooms(data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 
                (err.response?.status === 403 ? "You don't have permission to view rooms" :
                 err.response?.status === 401 ? "Please log in again" :
                 "Failed to load rooms");
            setError(errorMessage);
            toast.error(errorMessage);
            setRooms([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const refreshRooms = useCallback(async (hotelId: number) => {
        if (currentHotelId === hotelId) {
            await loadRooms(hotelId);
        }
    }, [currentHotelId, loadRooms]);

    const createRoom = useCallback(async (data: any): Promise<RoomResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const newRoom = await hotelApi.createRoom(data);
            if (currentHotelId === data.hotelId) {
                setRooms(prev => [...prev, newRoom]);
            }
            toast.success('Room created successfully');
            return newRoom;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create room';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, [currentHotelId]);

    const updateRoom = useCallback(async (id: number, data: any): Promise<RoomResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const updatedRoom = await hotelApi.updateRoom(id, data);
            setRooms(prev => prev.map(room => room.id === id ? updatedRoom : room));
            toast.success('Room updated successfully');
            return updatedRoom;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update room';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const deleteRoom = useCallback(async (id: number): Promise<boolean> => {
        try {
            setIsLoading(true);
            setError(null);
            await hotelApi.deleteRoom(id);
            setRooms(prev => prev.filter(room => room.id !== id));
            toast.success('Room deleted successfully');
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete room';
            setError(errorMessage);
            toast.error(errorMessage);
            return false;
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getRoomById = useCallback(async (id: number): Promise<RoomResponse | null> => {
        try {
            setIsLoading(true);
            setError(null);
            const room = await hotelApi.getRoomById(id);
            return room;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to load room';
            setError(errorMessage);
            toast.error(errorMessage);
            return null;
        } finally {
            setIsLoading(false);
        }
    }, []);

    return (
        <RoomContext.Provider
            value={{
                rooms,
                isLoading,
                error,
                loadRooms,
                createRoom,
                updateRoom,
                deleteRoom,
                getRoomById,
                refreshRooms,
            }}
        >
            {children}
        </RoomContext.Provider>
    );
};
