import axiosInstance from '../utils/axiosInstance';
import { 
  LoginCredentials, 
  RegisterData, 
  AuthResponse, 
  UserProfileUpdate, 
  RegisterResponse, 
  VerifyOtpData, 
  ResendOtpData,
  GooglePhoneVerificationData,
  VerifyPhoneAfterGoogleData,
  ResendGooglePhoneOtpData,
  GoogleSignInResponse
} from '../types/User';

// Address management types
export interface AddressData {
  type: 'Home' | 'Work' | 'Other';
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone?: string;
  isDefault?: boolean;
}

export interface AddressResponse {
  success: boolean;
  message: string;
  data: {
    user: any;
  };
}

// Password change types
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

// Termii-specific types (existing)
export interface TermiiSendOtpData {
  phone: string;
  userName?: string;
}

export interface TermiiSendOtpResponse {
  success: boolean;
  message: string;
  data: {
    pinId: string;
    phone: string;
    balance: string;
    smsStatus: string;
  };
}

export interface TermiiVerifyOtpData {
  pinId: string;
  pin: string;
}

export interface TermiiVerifyOtpResponse {
  success: boolean;
  message: string;
  data: {
    verified: boolean;
    msisdn: string;
  };
}

export interface CompleteRegistrationData {
  phone: string;
  verificationData: {
    verified: boolean;
    msisdn: string;
  };
  userId?: string;
}

// Existing authentication functions
export const loginUser = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const registerUser = async (data: RegisterData): Promise<RegisterResponse> => {
  const response = await axiosInstance.post('/auth/register', data);
  return response.data;
};

export const completeRegistration = async (data: CompleteRegistrationData): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/complete-registration', data);
  return response.data;
};

export const verifyOtp = async (data: VerifyOtpData): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/verify-otp', data);
  return response.data;
};

export const resendOtp = async (data: ResendOtpData): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/auth/resend-otp', data);
  return response.data;
};

export const sendTermiiOtp = async (data: TermiiSendOtpData): Promise<TermiiSendOtpResponse> => {
  const response = await axiosInstance.post('/auth/send-otp', data);
  return response.data;
};

export const verifyTermiiOtp = async (data: TermiiVerifyOtpData): Promise<TermiiVerifyOtpResponse> => {
  const response = await axiosInstance.post('/auth/verify-termii-otp', data);
  return response.data;
};

export const requestPhoneVerification = async (phone: string, userName?: string): Promise<TermiiSendOtpResponse> => {
  return sendTermiiOtp({ phone, userName });
};

export const completeGooglePhoneVerification = async (data: CompleteRegistrationData): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/complete-google-phone-verification', data);
  return response.data;
};

export const googleSignIn = async (credential: string): Promise<GoogleSignInResponse> => {
  try {
    const response = await axiosInstance.post('/auth/google-login', { credential });
    
    return {
      success: response.data.success || false,
      requirePhoneVerification: response.data.requirePhoneVerification || false,
      data: response.data.data || undefined,
      message: response.data.message || 'Google sign-in completed'
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.response?.data?.message || 'Google sign-in failed',
      requirePhoneVerification: false
    };
  }
};

export const verifyGooglePhone = async (data: GooglePhoneVerificationData): Promise<RegisterResponse> => {
  const response = await axiosInstance.post('/auth/verify-google-phone', data);
  return response.data;
};

export const verifyPhoneAfterGoogle = async (data: VerifyPhoneAfterGoogleData): Promise<AuthResponse> => {
  const response = await axiosInstance.post('/auth/verify-phone-after-google', data);
  return response.data;
};

export const resendGooglePhoneOtp = async (data: ResendGooglePhoneOtpData): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/auth/resend-google-phone-otp', data);
  return response.data;
};

export const getCurrentUser = async (): Promise<AuthResponse> => {
  const response = await axiosInstance.get('/auth/profile');
  return response.data;
};

export const updateProfile = async (data: UserProfileUpdate): Promise<AuthResponse> => {
  const response = await axiosInstance.put('/auth/profile', data);
  return response.data;
};

// NEW: Change password function
export const changePassword = async (data: ChangePasswordData): Promise<ChangePasswordResponse> => {
  const response = await axiosInstance.put('/auth/change-password', data);
  return response.data;
};

export const logoutUser = async (): Promise<void> => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const forgotPassword = async (email: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.post('/auth/forgot-password', { email });
  return response.data;
};

export const resetPassword = async (token: string, password: string): Promise<AuthResponse> => {
  try {
    const response = await axiosInstance.put(`/auth/reset-password/${token}`, { password });
    
    if (response.data.success && response.data.data.token) {
      localStorage.setItem('token', response.data.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.data.user));
    }
    
    return response.data;
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || 'Password reset failed';
    throw new Error(errorMessage);
  }
};

// Address Management Functions
export const addAddress = async (data: AddressData): Promise<AddressResponse> => {
  const response = await axiosInstance.post('/auth/addresses', data);
  return response.data;
};

export const updateAddress = async (addressId: string, data: AddressData): Promise<AddressResponse> => {
  const response = await axiosInstance.put(`/auth/addresses/${addressId}`, data);
  return response.data;
};

export const deleteAddress = async (addressId: string): Promise<AddressResponse> => {
  const response = await axiosInstance.delete(`/auth/addresses/${addressId}`);
  return response.data;
};

export const setDefaultAddress = async (addressId: string): Promise<AddressResponse> => {
  const response = await axiosInstance.put(`/auth/addresses/${addressId}/default`);
  return response.data;
};