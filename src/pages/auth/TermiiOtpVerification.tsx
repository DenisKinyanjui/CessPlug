// pages/auth/TermiiOtpVerification.tsx
import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, RotateCw, Phone, ArrowLeft } from "lucide-react";
import { sendTermiiOtp, verifyTermiiOtp } from "../../services/authApi";

interface TermiiOtpVerificationProps {
  phone: string;
  userName?: string;
  title?: string;
  description?: string;
  autoSendOtp?: boolean; // New prop to control auto-sending
  onBack?: () => void;
  onSuccess: (verificationData: { verified: boolean; msisdn: string }) => void;
  onError?: (error: string) => void;
}

const TermiiOtpVerification: React.FC<TermiiOtpVerificationProps> = ({
  phone,
  userName = "User",
  title = "Verify Your Phone",
  description,
  autoSendOtp = false, // Default to false to prevent automatic sending
  onBack,
  onSuccess,
  onError,
}) => {
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
  const [otpSent, setOtpSent] = useState<boolean>(false); // Track if OTP has been sent

  // Countdown timer
  useEffect(() => {
    const timer =
      countdown > 0 && setInterval(() => setCountdown(countdown - 1), 1000);
    return () => clearInterval(timer as NodeJS.Timeout);
  }, [countdown]);

  // Auto-send OTP only if autoSendOtp is true and OTP hasn't been sent yet
useEffect(() => {
  if (autoSendOtp && !otpSent) {
    console.log('Auto-sending OTP as autoSendOtp is true and OTP not sent yet');
    const timer = setTimeout(() => {
      handleSendOtp();
    }, 1000); // Small delay to ensure component is fully mounted
    return () => clearTimeout(timer);
  }
}, [autoSendOtp]);

  const handleSendOtp = async () => {
    // Prevent multiple OTP sends
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

      console.log("Sending OTP to phone:", phone); // Debug log

      const response = await sendTermiiOtp({
        phone,
        userName,
      });

      console.log("OTP send response:", response); // Debug log

      if (response.success && response.data.pinId) {
        setPinId(response.data.pinId);
        setBalance(response.data.balance);
        setSmsStatus(response.data.smsStatus);
        setSuccess("Verification code sent successfully!");
        setStep("verify");
        setCountdown(600); // 10 minutes countdown
        setOtpSent(true); // Mark OTP as sent
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

      console.log("Verifying OTP with pinId:", pinId, "and pin:", otp); // Debug log

      const response = await verifyTermiiOtp({
        pinId,
        pin: otp,
      });

      console.log("OTP verification response:", response); // Debug log

      if (response.success && response.data.verified) {
        setSuccess("Phone number verified successfully!");
        setTimeout(() => {
          onSuccess({
            verified: response.data.verified,
            msisdn: response.data.msisdn,
          });
        }, 1500);
      } else {
        throw new Error("Invalid verification code. Please try again.");
      }
    } catch (err: any) {
      console.error("Error verifying OTP:", err);
      const errorMessage =
        err.response?.data?.message || err.message || "Verification failed";
      setError(errorMessage);
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      setResendLoading(true);
      setError("");
      setOtp(""); // Clear current OTP

      const response = await sendTermiiOtp({
        phone,
        userName,
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

  const defaultDescription = `We sent a 6-digit verification code to ${phone}`;

  return (
    <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
      <div className="text-center mb-6">
        <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full">
          <Phone className="h-8 w-8 text-orange-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
        <p className="text-gray-600 mt-2">
          {description || defaultDescription}
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <XCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

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
            {autoSendOtp && !otpSent ? (
              <>
                <p className="text-gray-600 mb-4">
                  Sending verification code to your phone number...
                </p>
                <div className="flex items-center justify-center space-x-2">
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-orange-600">Sending Code...</span>
                    </>
                  ) : (
                    <span className="text-green-600">Code Sent!</span>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">
                  Click the button below to send a verification code to your
                  phone number.
                </p>
                <button
                  onClick={handleSendOtp}
                  disabled={loading || otpSent}
                  className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Sending...</span>
                    </div>
                  ) : otpSent ? (
                    "Code Sent!"
                  ) : (
                    "Send Verification Code"
                  )}
                </button>
              </>
            )}
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
            disabled={verifyLoading || otp.length !== 6}
            className="w-full bg-orange-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {verifyLoading ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Verifying...</span>
              </div>
            ) : (
              "Verify Code"
            )}
          </button>

          <div className="text-center text-sm text-gray-600">
            <p>
              Didn't receive the code?{" "}
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={countdown > 540 || resendLoading} // Disable for first minute
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

      {onBack && (
        <button
          onClick={onBack}
          className="w-full mt-4 text-orange-600 py-2 px-4 rounded-lg font-medium hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 flex items-center justify-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Go Back
        </button>
      )}

      {/* Development info */}
      {process.env.NODE_ENV === "development" && pinId && (
        <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-xs text-gray-600">
            <strong>Dev Info:</strong>
            <br />
            Pin ID: {pinId}
            <br />
            Phone: {phone}
            <br />
            OTP Sent: {otpSent ? "Yes" : "No"}
          </p>
        </div>
      )}
    </div>
  );
};

export default TermiiOtpVerification;
