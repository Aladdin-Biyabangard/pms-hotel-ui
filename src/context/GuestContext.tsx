import React, {createContext, ReactNode, useCallback, useContext, useEffect, useState} from 'react';
import {CreateGuestRequest, GuestResponse, guestsApi, UpdateGuestRequest} from '@/api/guests';
import {toast} from 'sonner';

interface GuestContextType {
    guests: GuestResponse[];
    isLoading: boolean;
    error: string | null;
    fetchGuests: () => Promise<void>;
    getGuestById: (id: number) => Promise<GuestResponse | null>;
    createGuest: (data: CreateGuestRequest) => Promise<GuestResponse | null>;
    updateGuest: (id: number, data: UpdateGuestRequest) => Promise<GuestResponse | null>;
    deleteGuest: (id: number) => Promise<boolean>;
    searchGuests: (query: string) => GuestResponse[];
}

const GuestContext = createContext<GuestContextType | undefined>(undefined);

export const GuestProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [guests, setGuests] = useState<GuestResponse[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGuests = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await guestsApi.getAllGuests();
            setGuests(data);
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch guests';
            setError(errorMessage);
            console.error('Error fetching guests:', err);
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const getGuestById = useCallback(async (id: number): Promise<GuestResponse | null> => {
        try {
            const guest = await guestsApi.getGuestById(id);
            // Update the guest in the list if it exists
            setGuests(prev => {
                const index = prev.findIndex(g => g.id === id);
                if (index >= 0) {
                    const updated = [...prev];
                    updated[index] = guest;
                    return updated;
                }
                return prev;
            });
            return guest;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to fetch guest';
            console.error('Error fetching guest:', err);
            toast.error(errorMessage);
            return null;
        }
    }, []);

    const createGuest = useCallback(async (data: CreateGuestRequest): Promise<GuestResponse | null> => {
        try {
            const newGuest = await guestsApi.createGuest(data);
            setGuests(prev => [newGuest, ...prev]);
            toast.success('Guest created successfully');
            return newGuest;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to create guest';
            console.error('Error creating guest:', err);
            toast.error(errorMessage);
            return null;
        }
    }, []);

    const updateGuest = useCallback(async (id: number, data: UpdateGuestRequest): Promise<GuestResponse | null> => {
        try {
            const updatedGuest = await guestsApi.updateGuest(id, data);
            setGuests(prev => prev.map(guest => guest.id === id ? updatedGuest : guest));
            toast.success('Guest updated successfully');
            return updatedGuest;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to update guest';
            console.error('Error updating guest:', err);
            toast.error(errorMessage);
            return null;
        }
    }, []);

    const deleteGuest = useCallback(async (id: number): Promise<boolean> => {
        try {
            await guestsApi.deleteGuest(id);
            setGuests(prev => prev.filter(guest => guest.id !== id));
            toast.success('Guest deleted successfully');
            return true;
        } catch (err: any) {
            const errorMessage = err.response?.data?.message || 'Failed to delete guest';
            console.error('Error deleting guest:', err);
            toast.error(errorMessage);
            return false;
        }
    }, []);

    const searchGuests = useCallback((query: string): GuestResponse[] => {
        if (!query.trim()) {
            return guests;
        }
        const searchLower = query.toLowerCase();
        return guests.filter(guest => 
            guest.firstName.toLowerCase().includes(searchLower) ||
            guest.lastName.toLowerCase().includes(searchLower) ||
            guest.email?.toLowerCase().includes(searchLower) ||
            guest.phone.toLowerCase().includes(searchLower) ||
            guest.address?.toLowerCase().includes(searchLower) ||
            guest.city?.toLowerCase().includes(searchLower) ||
            guest.country?.toLowerCase().includes(searchLower)
        );
    }, [guests]);

    // Initialize guests on mount
    useEffect(() => {
        fetchGuests();
    }, [fetchGuests]);

    return (
        <GuestContext.Provider
            value={{
                guests,
                isLoading,
                error,
                fetchGuests,
                getGuestById,
                createGuest,
                updateGuest,
                deleteGuest,
                searchGuests,
            }}
        >
            {children}
        </GuestContext.Provider>
    );
};

export const useGuests = (): GuestContextType => {
    const context = useContext(GuestContext);
    if (!context) {
        throw new Error('useGuests must be used within a GuestProvider');
    }
    return context;
};

