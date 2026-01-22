// components/auth/GooglePhoneVerification.tsx
import React, { useState } from 'react';
import { Phone, CheckCircle, XCircle, User, Mail } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import GoogleTermiiOtpVerification from './GoogleTermiiOtpVerification';

interface GooglePhoneVerificationProps {
  userData: {
    userId: string;
    email: string;
    name: string;
  };
  onBack: () => void;
  onSuccess: () => void;
}

const GooglePhoneVerification: React.FC<GooglePhoneVerificationProps> = ({ 
  userData, 
  onBack, 
  onSuccess 
}) => {
  const { verifyGooglePhone, error, clearError } = useAuth();
  const [phone, setPhone] = useState('');
  const [validationError, setValidationError] = useState('');
  const [showOtpVerification, setShowOtpVerification] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validatePhoneNumber = (phone: string): boolean => {
    const cleaned = phone.replace(/[\s\-\(\)]/g, '');
    
    const patterns = [
      /^(\+254|254)(7\d{8}|1\d{8})$/, // Kenya
      /^(\+234|234)(7\d{9}|8\d{9}|9\d{9})$/, // Nigeria
      /^(\+233|233)(2\d{8}|5\d{8})$/, // Ghana
      /^(0)(7\d{8}|1\d{8})$/, // Local format with 0
      /^\+\d{10,15}$/ // General international format
    ];
    
    return patterns.some(pattern => pattern.test(cleaned));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phone.trim()) {
      setValidationError('Phone number is required');
      return;
    }

    if (!validatePhoneNumber(phone)) {
      setValidationError('Please enter a valid phone number (e.g., +254712345678 or 0712345678)');
      return;
    }

    try {
      setIsSubmitting(true);
      setValidationError('');
      clearError();
      
      const response = await verifyGooglePhone({
        userId: userData.userId,
        phone: phone.trim()
      });
      
      if (response?.success) {
        // Move to OTP verification step
        setShowOtpVerification(true);
      }
    } catch (error) {
      console.error('Phone verification request failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhone(e.target.value);
    if (validationError) {
      setValidationError('');
    }
    if (error) {
      clearError();
    }
  };

  const handleOtpSuccess = () => {
    // The GoogleTermiiOtpVerification component handles the complete flow
    // including calling completeGooglePhoneVerification and updating auth state
    onSuccess();
  };

  const handleOtpError = (error: string) => {
    console.error('OTP verification error:', error);
    // Stay on OTP verification screen to allow retry
  };

  const handleBackFromOtp = () => {
    setShowOtpVerification(false);
  };

  // Show OTP verification if we've moved to that step
  if (showOtpVerification) {
    return (
      <GoogleTermiiOtpVerification 
        userData={userData}
        phone={phone}
        onBack={handleBackFromOtp}
        onSuccess={handleOtpSuccess}
        onError={handleOtpError}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Almost Done!</h2>
        <p className="text-gray-600 mt-2">
          We need to verify your phone number to complete your account setup
        </p>
      </div>

      {/* Google Account Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-gray-800">{userData.name}</p>
            <p className="text-sm text-gray-600 flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {userData.email}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="phone"
              name="phone"
              type="tel"
              value={phone}
              onChange={handlePhoneChange}
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent ${
                validationError ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="+254712345678 or 0712345678"
              autoFocus
            />
          </div>
          {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
          <p className="mt-1 text-xs text-gray-500">
            Enter your phone number with country code or local format
          </p>
        </div>

        <button
          type="submit"
          disabled={isSubmitting || !phone.trim()}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </div>
          ) : (
            'Send Verification Code'
          )}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="w-full mt-4 text-orange-600 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
        >
          Back to Sign Up Options
        </button>
      </form>

      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Why do we need your phone number?</strong><br />
          We use phone verification to secure your account and enable important notifications about your orders.
        </p>
      </div>
    </div>
  );
};

export default GooglePhoneVerification;