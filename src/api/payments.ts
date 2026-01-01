import {api} from './axios';
import {EntityStatus, PaymentMethod, PaymentStatus} from '@/types/enums';

export interface CreatePaymentRequest {
    guestId?: number;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus?: PaymentStatus;
    paymentDate?: string;
    transactionId?: string;
    paymentNotes?: string;
    cardLastFourDigits?: string;
    cardHolderName?: string;
    bankName?: string;
    referenceNumber?: string;
}

export interface DepositPaymentRequest {
    guestId?: number;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    paymentNotes?: string;
    cardLastFourDigits?: string;
    cardHolderName?: string;
    bankName?: string;
    referenceNumber?: string;
}

export interface PayPaymentRequest {
    guestId?: number;
    amount: number;
    paymentMethod: PaymentMethod;
    transactionId?: string;
    paymentNotes?: string;
    cardLastFourDigits?: string;
    cardHolderName?: string;
    bankName?: string;
    referenceNumber?: string;
}

export interface RefundRequest {
    refundAmount: number;
    reason?: string;
}

export interface UpdatePaymentRequest {
    guestId?: number;
    amount?: number;
    paymentMethod?: PaymentMethod;
    paymentStatus?: PaymentStatus;
    paymentDate?: string;
    transactionId?: string;
    paymentNotes?: string;
    refundAmount?: number;
    refundDate?: string;
    refundReason?: string;
    cardLastFourDigits?: string;
    cardHolderName?: string;
    bankName?: string;
    referenceNumber?: string;
}

export interface PaymentResponse {
    id: number;
    hotelId?: number;
    invoiceId?: number;
    guestId?: number;
    confirmationNumber?: string;
    amount: number;
    paymentMethod: PaymentMethod;
    paymentStatus: PaymentStatus;
    status: EntityStatus;
    paymentDate?: string;
    paymentDateTime?: string;
    transactionId?: string;
    paymentNotes?: string;
    refundAmount?: number;
    refundDate?: string;
    refundReason?: string;
    cardLastFourDigits?: string;
    cardHolderName?: string;
    bankName?: string;
    referenceNumber?: string;
    paymentGateway?: string;
    currency?: string;
    processedBy?: number;
    isDeposit?: boolean;
    isRefund?: boolean;
    chargeback?: boolean;
    chargebackDate?: string;
    chargebackReason?: string;
    createdAt: string;
    updatedAt: string;
}

export interface PaymentSummaryResponse {
    guestId?: number;
    confirmationNumber?: string;
    totalAmount: number;
    paidAmount: number;
    remainingAmount: number;
    paymentStatus: PaymentStatus;
    payments: PaymentResponse[];
}

export const paymentsApi = {
    createPayment: async (data: CreatePaymentRequest): Promise<PaymentResponse> => {
        const response = await api.post<PaymentResponse>('/payments', data);
        return response.data;
    },

    processDeposit: async (data: DepositPaymentRequest): Promise<PaymentResponse> => {
        const response = await api.post<PaymentResponse>('/payments/deposit', data);
        return response.data;
    },

    processPayment: async (data: PayPaymentRequest): Promise<PaymentResponse> => {
        const response = await api.post<PaymentResponse>('/payments/process', data);
        return response.data;
    },

    getAllPayments: async (): Promise<PaymentResponse[]> => {
        const response = await api.get<PaymentResponse[]>('/payments');
        return response.data;
    },

    getPaymentById: async (id: number): Promise<PaymentResponse> => {
        const response = await api.get<PaymentResponse>(`/payments/${id}`);
        return response.data;
    },

    getPaymentsByGuestId: async (guestId: number): Promise<PaymentResponse[]> => {
        const response = await api.get<PaymentResponse[]>(`/payments/guest/${guestId}`);
        return response.data;
    },

    getPaymentSummary: async (guestId: number): Promise<PaymentSummaryResponse> => {
        const response = await api.get<PaymentSummaryResponse>(`/payments/guest/${guestId}/summary`);
        return response.data;
    },

    getPaymentsByInvoiceId: async (invoiceId: number): Promise<PaymentResponse[]> => {
        const response = await api.get<PaymentResponse[]>(`/payments/invoice/${invoiceId}`);
        return response.data;
    },

    getPaymentsByGuestId: async (guestId: number): Promise<PaymentResponse[]> => {
        const response = await api.get<PaymentResponse[]>(`/payments/guest/${guestId}`);
        return response.data;
    },

    updatePayment: async (id: number, data: UpdatePaymentRequest): Promise<PaymentResponse> => {
        const response = await api.put<PaymentResponse>(`/payments/${id}`, data);
        return response.data;
    },

    processRefund: async (id: number, data: RefundRequest): Promise<PaymentResponse> => {
        const response = await api.patch<PaymentResponse>(`/payments/${id}/refund`, data);
        return response.data;
    },

    deletePayment: async (id: number): Promise<void> => {
        await api.delete(`/payments/${id}`);
    },
};
