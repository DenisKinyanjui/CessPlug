// components/auth/StandalonePhoneVerification.tsx
import React, { useState, useEffect } from "react";
import { Phone, CheckCircle, XCircle, ArrowLeft } from "lucide-react";
import TermiiOtpVerification from "../../pages/auth/TermiiOtpVerification";

interface StandalonePhoneVerificationProps {
  title?: string;
  description?: string;
  userName?: string;
  phoneNumber?: string; // Add this prop to accept pre-filled phone
  onBack?: () => void;
  onSuccess: (
    phoneNumber: string,
    verificationData: { verified: boolean; msisdn: string }
  ) => void;
  onError?: (error: string) => void;
}

const StandalonePhoneVerification: React.FC<
  StandalonePhoneVerificationProps
> = ({
  title = "Verify Your Phone Number",
  description = "Please enter your phone number to receive a verification code",
  userName = "User",
  phoneNumber: initialPhoneNumber = "", // Pre-filled phone number
  onBack,
  onSuccess,
  onError,
}) => {
  const [step, setStep] = useState<"input" | "verify">("input");
  const [phoneNumber, setPhoneNumber] = useState<string>(initialPhoneNumber);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [shouldAutoSendOtp, setShouldAutoSendOtp] = useState<boolean>(false);

  // If phone number is provided, skip to verification step
  useEffect(() => {
    if (initialPhoneNumber && validatePhoneNumber(initialPhoneNumber)) {
      setStep("verify");
      setShouldAutoSendOtp(false);
      // Skip the input step since we have a valid phone number
    }
  }, [initialPhoneNumber]);

  const validatePhoneNumber = (phone: string): boolean => {
    // Enhanced validation for various international formats
    const cleaned = phone.replace(/[\s\-\(\)]/g, "");

    const patterns = [
      /^(\+254|254)(7\d{8}|1\d{8})$/, // Kenya
      /^(\+234|234)(7\d{9}|8\d{9}|9\d{9})$/, // Nigeria
      /^(\+233|233)(2\d{8}|5\d{8})$/, // Ghana
      /^(0)(7\d{8}|1\d{8})$/, // Local format with 0
      /^\+\d{10,15}$/, // General international format
    ];

    return patterns.some((pattern) => pattern.test(cleaned));
  };

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneNumber.trim()) {
      setError("Please enter your phone number");
      return;
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError(
        "Please enter a valid phone number (e.g., +254712345678 or 0712345678)"
      );
      return;
    }

    setError("");
    setStep("verify");
    // Don't set shouldAutoSendOtp here - it's already set if phone was pre-filled
    // If we're coming from manual input, we'll let the user click "Send Code"
  };

  const handleVerificationSuccess = (verificationData: {
    verified: boolean;
    msisdn: string;
  }) => {
    onSuccess(phoneNumber, verificationData);
  };

  const handleVerificationError = (error: string) => {
    setError(error);
    onError?.(error);
  };

  const handleBackToInput = () => {
    setStep("input");
    setError("");
    setShouldAutoSendOtp(false); // Disable auto-send when going back
  };

  if (step === "verify") {
    return (
      <TermiiOtpVerification
        phone={phoneNumber}
        userName={userName}
        title="Verify Your Phone"
        description={`We'll send a verification code to ${phoneNumber}`}
        autoSendOtp={shouldAutoSendOtp} // Pass the auto-send flag
        onBack={handleBackToInput}
        onSuccess={handleVerificationSuccess}
        onError={handleVerificationError}
      />
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
          <Phone className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2">
          {initialPhoneNumber
            ? `We'll send a verification code to ${initialPhoneNumber}`
            : description}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <form onSubmit={handlePhoneSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
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
              value={phoneNumber}
              onChange={(e) => {
                setPhoneNumber(e.target.value);
                setError("");
              }}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              placeholder="+254712345678 or 0712345678"
              autoFocus={!initialPhoneNumber}
              readOnly={!!initialPhoneNumber} // Make read-only if phone is pre-filled
            />
          </div>
          <p className="mt-1 text-xs text-gray-500">
            {initialPhoneNumber
              ? "This is the phone number you entered during signup"
              : "Enter your phone number with country code or local format"}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
         {loading ? 'Processing...' : (step === 'input' ? 'Continue' : 'Send Verification Code')}
        </button>

        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full mt-4 text-orange-600 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Go Back
          </button>
        )}
      </form>

      {/* Supported formats info - only show if phone is not pre-filled */}
      {!initialPhoneNumber && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-700 font-medium mb-2">
            Supported formats:
          </p>
          <ul className="text-xs text-gray-600 space-y-1">
            <li>• Kenya: +254712345678 or 0712345678</li>
            <li>• Nigeria: +234701234567</li>
            <li>• Ghana: +233201234567</li>
            <li>• International: +[country code][number]</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default StandalonePhoneVerification;
