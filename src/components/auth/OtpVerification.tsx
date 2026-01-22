// components/auth/OtpVerification.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, RotateCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import * as authApi from '../../services/authApi';

interface OtpVerificationProps {
  phone: string;
  otpId: string;
  mode?: 'standard' | 'google';
  userId?: string; // Required for Google mode
  isGoogleVerification?: boolean; // For backward compatibility
  onBack?: () => void;
  onSuccess: () => void;
}

const OtpVerification: React.FC<OtpVerificationProps> = ({ 
  phone, 
  otpId, 
  mode = 'standard',
  userId,
  isGoogleVerification = false,
  onBack, 
  onSuccess 
}) => {
  const [otp, setOtp] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(60);
  const navigate = useNavigate();

  // Determine the actual mode - backward compatibility check
  const actualMode = isGoogleVerification ? 'google' : mode;
  
  // Validate required props for Google mode
  useEffect(() => {
    if (actualMode === 'google' && !userId) {
      console.error('userId is required for Google verification mode');
      setError('Invalid verification setup. Please try again.');
    }
  }, [actualMode, userId]);

  useEffect(() => {
    const timer = countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer as NodeJS.Timeout);
  }, [countdown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      setError('Please enter a 6-digit OTP');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      let response;
      
      if (actualMode === 'google') {
        // Google phone verification mode
        if (!userId) {
          throw new Error('User ID is required for Google verification');
        }
        
        response = await authApi.verifyPhoneAfterGoogle({
          userId,
          phone,
          otp
        });
      } else {
        // Standard registration OTP verification
        response = await authApi.verifyOtp({ phone, otp, otpId });
      }
      
      // Check if the response includes user and token for auto-login
      if (response.data?.user && response.data?.token) {
        // Store in localStorage for automatic authentication
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        const successMessage = actualMode === 'google' 
          ? 'Phone verified successfully! Your Google account is now complete.'
          : 'Phone verified successfully! Logging you in...';
        
        setSuccess(successMessage);
        
        // Call onSuccess after a brief delay to show success message
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        // Fallback - just show success and redirect
        const successMessage = response.message || 
          (actualMode === 'google' 
            ? 'Phone verified successfully!' 
            : 'Phone verified successfully!');
        
        setSuccess(successMessage);
        setTimeout(() => {
          onSuccess();
        }, 1500);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 
        (actualMode === 'google' 
          ? 'Phone verification failed. Please try again.'
          : 'Verification failed. Please try again.');
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError('');
      
      if (actualMode === 'google') {
        // For Google mode, we need to call a different resend endpoint
        if (!userId) {
          throw new Error('User ID is required for Google verification');
        }
        
        await authApi.resendGooglePhoneOtp({ userId, phone });
      } else {
        // Standard resend OTP
        await authApi.resendOtp({ phone });
      }
      
      setCountdown(60);
      setSuccess('New OTP sent successfully!');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to resend OTP. Please try again.';
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const getTitle = () => {
    return actualMode === 'google' 
      ? 'Complete Your Account' 
      : 'Verify Your Phone';
  };

  const getDescription = () => {
    const baseMessage = `We sent a 6-digit code to ${phone}`;
    return actualMode === 'google' 
      ? `${baseMessage} to complete your Google account setup.`
      : baseMessage;
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">{getTitle()}</h2>
        <p className="text-gray-600 mt-2">
          {getDescription()}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
            Verification Code
          </label>
          <input
            id="otp"
            name="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            value={otp}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setOtp(value);
              setError('');
            }}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            placeholder="Enter 6-digit code"
            autoFocus
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Verifying...' : 'Verify Code'}
        </button>

        <div className="text-center text-sm text-gray-600">
          <p>
            Didn't receive the code?{' '}
            <button
              type="button"
              onClick={handleResendOtp}
              disabled={countdown > 0 || resendLoading}
              className="text-orange-600 font-medium hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              {resendLoading ? (
                <span className="flex items-center justify-center">
                  <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                  Sending...
                </span>
              ) : countdown > 0 ? (
                `Resend in ${countdown}s`
              ) : (
                'Resend Code'
              )}
            </button>
          </p>
        </div>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full mt-4 text-orange-600 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
          >
            {actualMode === 'google' ? 'Back to Sign Up Options' : 'Back to Registration'}
          </button>
        )}
      </form>

      {actualMode === 'google' && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Almost there!</strong><br />
            After verifying your phone number, your Google account will be fully set up and you'll be logged in automatically.
          </p>
        </div>
      )}
    </div>
  );
};

export default OtpVerification;