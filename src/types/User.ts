export interface User {
  addresses: never[];
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  avatar?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isActive?: boolean;
  verified?: boolean;
  isPhoneVerified?: boolean; // New field for Google users
  createdAt: string;
  updatedAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    phone: string;
    otpId: string;
  };
}

export interface VerifyOtpData {
  phone: string;
  otp: string;
  otpId: string;
}

export interface ResendOtpData {
  phone: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

// Google Sign-In related types
export interface GoogleSignInData {
  credential: string;
}

export interface GoogleSignInResponse {
  success: boolean;
  requirePhoneVerification?: boolean;
  data?: {
    userId?: string;
    email?: string;
    name?: string;
    user?: User;
    token?: string;
  };
  message: string;
}

export interface GooglePhoneVerificationData {
  userId: string;
  phone: string;
}

export interface VerifyPhoneAfterGoogleData {
  userId: string;
  phone: string;
  otp: string;
}

export interface ResendGooglePhoneOtpData {
  userId: string;
  phone: string;
}

export interface UserProfileUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}