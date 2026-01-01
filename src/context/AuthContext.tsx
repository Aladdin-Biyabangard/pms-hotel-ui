import React, {createContext, ReactNode, useContext, useEffect, useState} from 'react';
import {authApi, AuthResponse, User} from '@/api/auth';
import {isTokenExpired, isValidToken} from '../utils/tokenUtils';

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    isInitialized: boolean;
    loginSuccess: (response: AuthResponse) => void;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isInitialized, setIsInitialized] = useState<boolean>(false);

    useEffect(() => {
        // Initialize auth state from local storage
        const initializeAuth = async () => {
            try {
                const storedUser = localStorage.getItem('user');
                const token = localStorage.getItem('accessToken');
                const refreshToken = localStorage.getItem('refreshToken');

                if (storedUser && token) {
                    // If token is valid, restore auth state immediately
                    if (isValidToken(token)) {
                        setUser(JSON.parse(storedUser));
                        setIsAuthenticated(true);
                        setIsLoading(false);
                        setIsInitialized(true);
                        return;
                    }

                    // Token is expired, but we have a refresh token - try to refresh
                    if (isTokenExpired(token) && refreshToken) {
                        try {
                            const refreshTokenId = parseInt(refreshToken, 10);
                            const response = await authApi.refreshToken(refreshTokenId);
                            
                            // Update stored tokens
                            if (response.accessToken) {
                                localStorage.setItem('accessToken', response.accessToken);
                            }
                            if (response.refreshToken) {
                                localStorage.setItem('refreshToken', response.refreshToken.toString());
                            }

                            // Update user data
                            const userData: User = {
                                id: response.id,
                                firstName: response.firstName,
                                lastName: response.lastName,
                                role: response.role,
                                hotelId: response.hotelId,
                            };
                            localStorage.setItem('user', JSON.stringify(userData));
                            
                            setUser(userData);
                            setIsAuthenticated(true);
                            setIsLoading(false);
                            setIsInitialized(true);
                            return;
                        } catch (refreshError) {
                            // Refresh failed, clear storage but don't redirect yet
                            console.warn('Token refresh failed during initialization:', refreshError);
                            localStorage.removeItem('accessToken');
                            localStorage.removeItem('refreshToken');
                            localStorage.removeItem('user');
                        }
                    } else {
                        // Token is invalid/expired and no refresh token, clear storage
                        console.warn('Stored token is invalid or expired, clearing auth state');
                        localStorage.removeItem('accessToken');
                        localStorage.removeItem('refreshToken');
                        localStorage.removeItem('user');
                    }
                }
            } catch (error) {
                console.error('Error initializing auth state:', error);
                // Clear potentially corrupted state
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('user');
            } finally {
                setIsLoading(false);
                setIsInitialized(true);
            }
        };

        initializeAuth();
    }, []);

    const loginSuccess = (response: AuthResponse) => {
        if (response.accessToken) {
            localStorage.setItem('accessToken', response.accessToken);
        }
        if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken.toString());
        }

        // Construct user object from response
        const userData: User = {
            id: response.id,
            firstName: response.firstName,
            lastName: response.lastName,
            role: response.role,
            hotelId: response.hotelId,
        };

        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        setIsAuthenticated(true);
    };

    const logout = async () => {
        try {
            const refreshToken = localStorage.getItem('refreshToken');
            if (refreshToken) {
                await authApi.logout(parseInt(refreshToken));
            }
        } catch (error) {
            console.error("Logout failed on server", error);
        } finally {
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            setUser(null);
            setIsAuthenticated(false);
            window.location.href = '/login';
        }
    };

    return (
        <AuthContext.Provider value={{ user, isAuthenticated, isLoading, isInitialized, loginSuccess, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
