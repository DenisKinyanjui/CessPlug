// Fixed GoogleTermiiOtpVerification.tsx
import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  XCircle,
  RotateCw,
  Phone,
  ArrowLeft,
  User,
  Mail,
} from "lucide-react";
import {
  sendTermiiOtp,
  verifyTermiiOtp,
  completeGooglePhoneVerification,
} from "../../services/authApi";
import { useAuth } from "../../contexts/AuthContext";

interface GoogleTermiiOtpVerificationProps {
  userData: {
    userId: string;
    email: string;
    name: string;
  };
  phone: string;
  onBack?: () => void;
  onSuccess: () => void;
  onError?: (error: string) => void;
}

const GoogleTermiiOtpVerification: React.FC<
  GoogleTermiiOtpVerificationProps
> = ({ userData, phone, onBack, onSuccess, onError }) => {
  const { loadUser } = useAuth();
  const [step, setStep] = useState<"send" | "verify">("send");
  const [otp, setOtp] = useState<string>("");
  const [pinId, setPinId] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [verifyLoading, setVerifyLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [resendLoading, setResendLoading] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);
  const [balance, setBalance] = useState<string>("");
  const [smsStatus, setSmsStatus] = useState<string>("");
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [completingRegistration, setCompletingRegistration] =
    useState<boolean>(false);

  // Countdown timer
  useEffect(() => {
    const timer =
      countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer as NodeJS.Timeout);
  }, [countdown]);

  // Auto-send OTP when component mounts (for Google flow)
  useEffect(() => {
    if (!otpSent) {
      console.log("Auto-sending OTP for Google user phone verification");
      const timer = setTimeout(() => {
        handleSendOtp();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Helper function to format phone number consistently with backend
  const formatPhoneNumber = (phoneNumber: string): string => {
    // Remove any spaces, dashes, or parentheses
    let cleaned = phoneNumber.replace(/[\s\-\(\)]/g, '');
    
    // If it starts with 0, replace with country code (assuming Kenya +254)
    if (cleaned.startsWith('0')) {
      cleaned = '254' + cleaned.substring(1);
    }
    
    // If it starts with +, remove the +
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    
    // If it doesn't start with country code, add Kenya code
    if (!cleaned.startsWith('254')) {
      cleaned = '254' + cleaned;
    }
    
    return cleaned;
  };

  const handleSendOtp = async () => {
    if (loading || otpSent) {
      console.log(
        "OTP send prevented - loading:",
        loading,
        "otpSent:",
        otpSent
      );
      return;
    }

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const formattedPhone = formatPhoneNumber(phone);
      console.log("Sending OTP to Google user phone:", {
        original: phone,
        formatted: formattedPhone,
        userId: userData.userId
      });

      const response = await sendTermiiOtp({
        phone: formattedPhone,
        userName: userData.name,
      });

      console.log("OTP send response:", response);

      if (response.success && response.data.pinId) {
        setPinId(response.data.pinId);
        setBalance(response.data.balance);
        setSmsStatus(response.data.smsStatus);
        setSuccess("Verification code sent successfully!");
        setStep("verify");
        setCountdown(600); // 10 minutes countdown
        setOtpSent(true);
      } else {
        throw new Error(response.message || "Failed to send verification code");
      }
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to send verification code";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    if (otp.length !== 6) {
      setError("Please enter a 6-digit verification code");
      return;
    }

    if (!pinId) {
      setError("No verification session found. Please request a new code.");
      return;
    }

    try {
      setVerifyLoading(true);
      setError("");

      console.log("Verifying OTP with pinId:", pinId, "and pin:", otp);

      // Step 1: Verify OTP with Termii
      const verificationResponse = await verifyTermiiOtp({
        pinId,
        pin: otp,
      });

      console.log("OTP verification response:", verificationResponse);

      if (!verificationResponse.success || !verificationResponse.data.verified) {
        throw new Error("Invalid verification code. Please try again.");
      }

      // Step 2: Complete Google phone verification in backend
      setCompletingRegistration(true);
      setSuccess("Phone number verified! Completing account setup...");

      // Use the ORIGINAL phone number that was passed to this component
      // The backend will handle phone formatting consistency
      console.log("Completing Google phone verification with:", {
        phone: phone, // Use original phone, not formatted
        userId: userData.userId,
        verificationData: verificationResponse.data
      });

      const completionResponse = await completeGooglePhoneVerification({
        phone: phone, // Use the original phone number
        verificationData: {
          verified: verificationResponse.data.verified,
          msisdn: verificationResponse.data.msisdn,
        },
        userId: userData.userId
      });

      console.log("Google phone verification completion response:", completionResponse);

      if (completionResponse?.success && completionResponse?.data?.token) {
        console.log("Google phone verification completed successfully");

        // Store the token in localStorage
        if (completionResponse.data.token) {
          localStorage.setItem('token', completionResponse.data.token);
          localStorage.setItem('user', JSON.stringify(completionResponse.data.user));
        }

        // Load user data into auth context
        await loadUser();

        setSuccess("Account setup completed successfully!");
        
        // Call success callback after a brief delay
        setTimeout(() => {
          onSuccess();
        }, 1500);
      } else {
        throw new Error(completionResponse?.message || 'Account setup completion failed');
      }

    } catch (error: any) {
      console.error("Error during Google phone verification:", error);
      const errorMessage =
        error.response?.data?.message || error.message || "Verification failed";
      setError(errorMessage);
      onError?.(errorMessage);
    } finally {
      setVerifyLoading(false);
      setCompletingRegistration(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError("");
      setOtp(""); // Clear current OTP

      const formattedPhone = formatPhoneNumber(phone);
      const response = await sendTermiiOtp({
        phone: formattedPhone,
        userName: userData.name,
      });

      if (response.success && response.data.pinId) {
        setPinId(response.data.pinId);
        setBalance(response.data.balance);
        setSmsStatus(response.data.smsStatus);
        setSuccess("New verification code sent successfully!");
        setCountdown(600); // Reset countdown
      } else {
        throw new Error(
          response.message || "Failed to resend verification code"
        );
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        err.message ||
        "Failed to resend verification code";
      setError(errorMessage);
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const displayPhone = phone.startsWith('+') ? phone : `+${formatPhoneNumber(phone)}`;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      {/* Header */}
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
          <Phone className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Verify Your Phone</h2>
        <p className="text-gray-600 mt-2">
          We sent a 6-digit verification code to {displayPhone}
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

      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Success Message */}
      {success && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center">
          <CheckCircle className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" />
          <p className="text-green-700">{success}</p>
        </div>
      )}

      {/* SMS Status Info */}
      {smsStatus && step === "verify" && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Status:</strong> {smsStatus}
            {balance && <span className="ml-2">• Balance: {balance}</span>}
          </p>
        </div>
      )}

      {step === "send" ? (
        // Send OTP Step
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">
              Sending verification code to your phone number...
            </p>
            <div className="flex items-center justify-center space-x-2">
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-orange-600">Sending Code...</span>
                </>
              ) : otpSent ? (
                <span className="text-green-600">Code Sent!</span>
              ) : (
                <button
                  onClick={handleSendOtp}
                  disabled={loading}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Send Verification Code
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        // Verify OTP Step
        <form onSubmit={handleVerifyOtp} className="space-y-4">
          <div>
            <label
              htmlFor="otp"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
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
                const value = e.target.value.replace(/\D/g, "");
                setOtp(value);
                setError("");
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-center text-lg font-mono tracking-widest"
              placeholder="000000"
              autoFocus
              disabled={completingRegistration}
            />
          </div>

          {/* Countdown timer */}
          {countdown > 0 && (
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Code expires in:{" "}
                <span className="font-mono font-semibold text-orange-600">
                  {formatTime(countdown)}
                </span>
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={
              verifyLoading || completingRegistration || otp.length !== 6
            }
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {completingRegistration ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Completing Setup...</span>
              </div>
            ) : verifyLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify & Complete Setup"
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            <p>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={
                  countdown > 540 || resendLoading || completingRegistration
                }
                className="text-orange-600 font-medium hover:text-orange-500 disabled:text-gray-400 disabled:cursor-not-allowed"
              >
                {resendLoading ? (
                  <span className="flex items-center justify-center">
                    <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                    Sending...
                  </span>
                ) : countdown > 540 ? (
                  `Resend in ${Math.ceil((countdown - 540) / 60)}m`
                ) : (
                  "Resend Code"
                )}
              </button>
            </p>
          </div>
        </form>
      )}

      {/* Back Button */}
      {onBack && !completingRegistration && (
        <button
          onClick={onBack}
          disabled={loading || verifyLoading}
          className="w-full mt-4 text-orange-600 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Phone Entry
        </button>
      )}

      {/* Why phone verification info */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Final step!</strong>
          <br />
          We're completing your Google account setup with phone verification to
          secure your account and enable order notifications.
        </p>
      </div>

      {/* Development info */}
      {process.env.NODE_ENV === "development" && pinId && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Dev Info:</strong>
            <br />
            Pin ID: {pinId}
            <br />
            Phone (Original): {phone}
            <br />
            Phone (Formatted): {formatPhoneNumber(phone)}
            <br />
            User ID: {userData.userId}
            <br />
            OTP Sent: {otpSent ? "Yes" : "No"}
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleTermiiOtpVerification;