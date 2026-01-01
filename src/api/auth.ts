import {api} from './axios';

// --- Types ---

export interface User {
    id: number;
    firstName: string;
    lastName: string;
    role: string[];
    hotelId?: number | null;
}

export interface AuthResponse {
    id: number;
    firstName: string;
    lastName: string;
    role: string[];
    accessToken?: string;
    refreshToken?: number;
    requiresTwoFactor?: boolean;
    hotelId?: number | null;
}

export interface TwoFactorLoginResponse {
    status: 'SUCCESS' | 'REQUIRES_2FA';
    tempToken?: string;
    accessToken?: string;
    refreshToken?: number;
    id: number;
    firstName: string;
    lastName: string;
    role: string[];
    hotelId?: number | null;
}

export interface LoginRequest {
    email?: string;
    password?: string;
}

export interface TwoFactorLoginRequest {
    tempToken: string;
    code: string;
}

export interface RegisterRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    passwordConfirm: string;
    hotelId?: number// Updated to match backend DTO field name logic usually, but DTO checking: 'passwordConfirm' logic in backend uses 'password' and 'passwordConfirm'
}

export interface OtpRequest {
    email: string;
    otpCode: number;
}

export interface ForgotPasswordRequest {
    email: string;
}

export interface VerifyResetCodeRequest {
    email: string;
    code: string;
}

export interface ResetPasswordRequest {
    email: string;
    newPassword: string;
    retryPassword: string;
}

// --- API Functions ---

export const authApi = {
    // Login Flow
    loginStage1: async (data: LoginRequest): Promise<TwoFactorLoginResponse> => {
        const response = await api.post<TwoFactorLoginResponse>('/auth/login-stage1', data);
        return response.data;
    },

    loginStage2: async (data: TwoFactorLoginRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/login-2fa', data);
        return response.data;
    },

    // Registration Flow
    register: async (data: RegisterRequest): Promise<void> => {
        await api.post('/auth/sign-up', data);
    },

    verifyOtp: async (data: OtpRequest): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/verify-otp', data);
        return response.data;
    },

    // Password Reset Flow
    forgotPassword: async (email: string): Promise<void> => {
        await api.post(`/auth/forgot-password?email=${encodeURIComponent(email)}`);
    },

    verifyResetCode: async (data: VerifyResetCodeRequest): Promise<any> => {
        const response = await api.post('/auth/verify-code', data);
        return response.data;
    },

    resetPassword: async (data: ResetPasswordRequest): Promise<void> => {
        await api.patch('/auth/reset-password', data);
    },

    // Refresh Token
    refreshToken: async (refreshTokenId: number): Promise<AuthResponse> => {
        const response = await api.post<AuthResponse>('/auth/refresh', {
            refreshToken: refreshTokenId
        });
        return response.data;
    },

    // Logout
    logout: async (refreshTokenId: number): Promise<void> => {
        await api.post(`/auth/sign-out?refreshTokenId=${refreshTokenId}`);
    },

    // Get Current User
    getMe: async (): Promise<User> => {
        const response = await api.get('/auth');
        return response.data;
    }
};
