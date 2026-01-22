import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, User, Phone } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../../contexts/AuthContext";
import SEOHelmet from "../../components/SEO/SEOHelmet";
import GooglePhoneVerification from "../../components/auth/GooglePhoneVerification";  
import StandalonePhoneVerification from "../../components/auth/StandalonePhoneVerification";
import { completeRegistration } from "../../services/authApi";

const SignUp: React.FC = () => {
  const { register, googleSignIn, loading, error, clearError, loadUser } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    acceptTerms: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Phone verification state for regular signup
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [pendingUserData, setPendingUserData] = useState<{
    name: string;
    email: string;
    password: string;
    phone: string;
  } | null>(null);

  // Google sign-in states
  const [googlePhoneVerification, setGooglePhoneVerification] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }

    if (error) {
      clearError();
    }
  };

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Full name is required";
    } else if (formData.name.trim().length < 2) {
      newErrors.name = "Name must be at least 2 characters long";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (!validatePhoneNumber(formData.phone.trim())) {
      newErrors.phone = "Please enter a valid phone number (e.g., +254712345678 or 0712345678)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    if (!formData.acceptTerms) {
      newErrors.acceptTerms = "You must accept the terms and conditions";
    }

    setValidationErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  try {
    const userData = {
      name: formData.name.trim(),
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      phone: formData.phone.trim(),
    };

    console.log("Registering user data...", userData);
    const registerResponse = await register(userData);

    if (registerResponse?.success) {
      setPendingUserData(userData);
      setShowPhoneVerification(true);
      console.log("Registration successful, proceeding to phone verification");
    } else {
      throw new Error(registerResponse?.message || 'Registration failed');
    }
  } catch (error: any) {
    console.error("Registration error:", error);
  }
};

  const handlePhoneVerificationSuccess = async (phoneNumber: string, verificationData: { verified: boolean; msisdn: string }) => {
    if (!pendingUserData) {
      console.error("No pending user data found");
      return;
    }

    try {
      console.log("Phone verification successful, completing registration...");
      console.log("Verification data:", verificationData);
      console.log("Phone number:", phoneNumber);
      
      const response = await completeRegistration({
        phone: phoneNumber,
        verificationData
      });

      console.log("Complete registration response:", response);

      if (response?.success && response?.data?.token) {
        console.log("Registration completed successfully");
        
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        
        await loadUser();
        navigate("/");
      } else {
        throw new Error(response?.message || 'Registration completion failed');
      }
    } catch (error: any) {
      console.error("Registration completion error:", error);
      
      if (error.response?.data?.message) {
        alert(`Registration failed: ${error.response.data.message}`);
      } else {
        alert(`Registration failed: ${error.message}`);
      }
      
      setShowPhoneVerification(false);
      setPendingUserData(null);
    }
  };

  const handlePhoneVerificationBack = () => {
    setShowPhoneVerification(false);
    setPendingUserData(null);
  };

  const handlePhoneVerificationError = (error: string) => {
    console.error("Phone verification error:", error);
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }

      clearError();

      const result = await googleSignIn(credentialResponse.credential);
      
      if (result.requirePhoneVerification) {
        if (!result.userId || !result.email || !result.name) {
          throw new Error("Missing user data for phone verification");
        }

        setGoogleUserData({
          userId: result.userId,
          email: result.email,
          name: result.name,
        });
        setGooglePhoneVerification(true);
        return;
      }

      if (result.token && result.user) {
        await loadUser();
        navigate("/");
        return;
      }

      throw new Error("Unexpected response format from server");
    } catch (error: any) {
      console.error('Google Sign-In Error:', error.message || "Google sign-in failed. Please try again.");
    }
  };

  const handleGooglePhoneVerificationSuccess = async () => {
    try {
      await loadUser();
      navigate("/");
    } catch (error) {
      console.error("Failed to load user after Google phone verification:", error);
      navigate("/");
    }
  };

  const handleGoogleError = (): void => {
    console.error("Google sign-in error occurred");
  };

  if (showPhoneVerification && pendingUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <StandalonePhoneVerification
          title="Verify Your Phone Number"
          description={`We'll send a verification code to ${pendingUserData.phone} to complete your registration`}
          userName={pendingUserData.name}
          phoneNumber={pendingUserData.phone}
          onBack={handlePhoneVerificationBack}
          onSuccess={handlePhoneVerificationSuccess}
          onError={handlePhoneVerificationError}
        />
      </div>
    );
  }

  if (googlePhoneVerification && googleUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <GooglePhoneVerification
          userData={googleUserData}
          onBack={() => setGooglePhoneVerification(false)}
          onSuccess={handleGooglePhoneVerificationSuccess}
        />
      </div>
    );
  }

  return (
    <>
      <SEOHelmet
        title="Sign Up - CessPlug | Create Your Account"
        description="Create your CessPlug account to access exclusive deals, fast checkout, order tracking, and personalized shopping experience."
        keywords="sign up, register, create account, CessPlug registration"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-4 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Sign Up Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-xl sm:rounded-2xl shadow-md sm:shadow-xl p-6 sm:p-8 border border-gray-100">
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1 sm:mb-2">
                  Create Account
                </h2>
                <p className="text-sm sm:text-base text-gray-600">
                  Join thousands of happy customers
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">{error}</p>
                </div>
              )}

              {/* Google Sign Up Button */}
              <div className="mb-4">
                <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || ""}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={handleGoogleError}
                    useOneTap
                    text="continue_with"
                    shape="rectangular"
                    size="medium"
                    width="100%"
                    locale="en"
                  />
                </GoogleOAuthProvider>
              </div>

              {/* Divider */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-xs sm:text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Or create account with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                {/* Full Name Field */}
                <div>
                  <label htmlFor="name" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        validationErrors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your full name"
                    />
                  </div>
                  {validationErrors.name && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.name}
                    </p>
                  )}
                </div>

                {/* Email Field */}
                <div>
                  <label htmlFor="email" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        validationErrors.email ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your email"
                    />
                  </div>
                  {validationErrors.email && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.email}
                    </p>
                  )}
                </div>

                {/* Phone Field */}
                <div>
                  <label htmlFor="phone" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        validationErrors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  {validationErrors.phone && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.phone}
                    </p>
                  )}
                  
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`w-full pl-9 pr-10 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white ${
                        validationErrors.password ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Create a password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                  {validationErrors.password && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.password}
                    </p>
                  )}
                </div>

                {/* Terms & Conditions */}
                <div>
                  <div className="flex items-start">
                    <input
                      id="acceptTerms"
                      name="acceptTerms"
                      type="checkbox"
                      checked={formData.acceptTerms}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded mt-0.5"
                    />
                    <label htmlFor="acceptTerms" className="ml-2 text-xs sm:text-sm text-gray-700">
                      I accept the{" "}
                      <Link to="/terms-of-service" className="text-orange-600 hover:text-orange-500 font-medium">
                        Terms & Conditions
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy-policy" className="text-orange-600 hover:text-orange-500 font-medium">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>
                  {validationErrors.acceptTerms && (
                    <p className="mt-1 text-xs text-red-600">
                      {validationErrors.acceptTerms}
                    </p>
                  )}
                </div>

                {/* Sign Up Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-semibold text-sm sm:text-base hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    "Sign Up"
                  )}
                </button>

                {/* Login Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-600">
                    Already have an account?{" "}
                    <Link
                      to="/auth/login"
                      className="text-orange-600 hover:text-orange-500 font-semibold transition-colors"
                    >
                      Sign In
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>

          {/* Right Side - Brand Illustration (Hidden on mobile) */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-20"></div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-blue-400 rounded-full opacity-15"></div>
              <img
                src="/images/SignupHero.svg"
                alt="Hero Image"
                className="w-full h-auto max-h-[500px]"
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SignUp;