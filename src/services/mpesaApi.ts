import axiosInstance from '../utils/axiosInstance';

export interface STKPushRequest {
  phoneNumber: string;
  amount: number;
  orderId: string;
  accountReference?: string;
}

export interface STKPushResponse {
  success: boolean;
  message: string;
  data?: {
    checkoutRequestId: string;
    merchantRequestId: string;
    customerMessage: string;
  };
}

export interface PaymentStatus {
  success: boolean;
  data?: {
    status: 'pending' | 'completed' | 'failed';
    orderId: string;
    amount: number;
    phoneNumber: string;
    mpesaReceiptNumber?: string;
    transactionDate?: string;
    failureReason?: string;
  };
  message?: string;
}

// Initiate STK Push payment
export const initiateSTKPush = async (data: STKPushRequest): Promise<STKPushResponse> => {
  const response = await axiosInstance.post('/mpesa/stkpush', data);
  return response.data;
};

// Check payment status
export const checkPaymentStatus = async (checkoutRequestId: string): Promise<PaymentStatus> => {
  const response = await axiosInstance.get(`/mpesa/payment-status/${checkoutRequestId}`);
  return response.data;
};