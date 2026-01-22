import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, AlertCircle } from "lucide-react";
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from "../../contexts/AuthContext";
import SEOHelmet from "../../components/SEO/SEOHelmet";
import GooglePhoneVerification from "../../components/auth/GooglePhoneVerification";

const Login: React.FC = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  
  const { login, googleSignIn, loading, error, isAuthenticated, clearError, loadUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Google sign-in states
  const [googlePhoneVerification, setGooglePhoneVerification] = useState(false);
  const [googleUserData, setGoogleUserData] = useState<{
    userId: string;
    email: string;
    name: string;
  } | null>(null);

  const from = location.state?.from?.pathname || "/";

  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  useEffect(() => {
    clearError();
    setLocalError(null);
  }, [clearError]);

  useEffect(() => {
    setLocalError(null);
  }, [formData.email, formData.password]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!formData.email.trim()) {
      setLocalError("Email is required");
      return false;
    }
    
    if (!formData.password.trim()) {
      setLocalError("Password is required");
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setLocalError("Please enter a valid email address");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      await login({
        email: formData.email.trim(),
        password: formData.password,
      });
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      if (!credentialResponse.credential) {
        throw new Error("No credential received from Google");
      }

      clearError();

      const result = await googleSignIn(credentialResponse.credential);
      
      // Handle phone verification requirement
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

      // Handle successful login with token
      if (result.token && result.user) {
        await loadUser();
        navigate(from, { replace: true });
        return;
      }

      throw new Error("Unexpected response format from server");
    } catch (error: any) {
      const errorMessage = error.message || "Google sign-in failed. Please try again.";
      setLocalError(errorMessage);
      console.error('Google Sign-In Error:', errorMessage);
    }
  };

  const handleGoogleError = () => {
    setLocalError("Google sign-in failed. Please try again.");
    console.error("Google Sign-In failed");
  };

  const handleGooglePhoneVerificationSuccess = async () => {
    try {
      await loadUser();
      navigate(from, { replace: true });
    } catch (error) {
      console.error("Failed to load user after Google phone verification:", error);
      navigate(from, { replace: true });
    }
  };

  // Show Google phone verification component
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

  const displayError = error || localError;

  return (
    <>
      <SEOHelmet
        title="Login - CessPlug | Sign in to Your Account"
        description="Sign in to your CessPlug account to access exclusive deals, track orders, and enjoy personalized shopping experience."
        keywords="login, sign in, CessPlug account, user authentication"
      />

      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Brand Illustration */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-orange-400 rounded-full opacity-20"></div>
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-yellow-400 rounded-full opacity-15"></div>
              <img 
                src="/images/LoginHero.svg"
                alt="Hero Image"
                className="w-full h-auto max-h-[400px]"
              />
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:mx-0">
            <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800 mb-1">
                  Welcome Back!
                </h2>
                <p className="text-sm text-gray-600">
                  Sign in to your account to continue shopping
                </p>
                {from !== "/" && (
                  <p className="text-xs text-orange-600 mt-1">
                    Please log in to continue. You'll be redirected back to your session.
                  </p>
                )}
              </div>

              {displayError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-xs">{displayError}</span>
                </div>
              )}

              {/* Google Login Button */}
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
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-gray-500">
                    Or sign in with email
                  </span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Field */}
                <div>
                  <label
                    htmlFor="email"
                    className="block text-xs font-semibold text-gray-700 mb-1"
                  >
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
                      className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your email"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label
                    htmlFor="password"
                    className="block text-xs font-semibold text-gray-700 mb-1"
                  >
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
                      className="w-full pl-9 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      ) : (
                        <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="rememberMe"
                      name="rememberMe"
                      type="checkbox"
                      checked={formData.rememberMe}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-orange-500 focus:ring-orange-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <label
                      htmlFor="rememberMe"
                      className="ml-2 text-xs text-gray-700"
                    >
                      Remember me
                    </label>
                  </div>
                  <Link
                    to="/auth/forgot-password"
                    className="text-xs text-orange-600 hover:text-orange-500 font-medium transition-colors"
                  >
                    Forgot Password?
                  </Link>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg font-semibold text-sm hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    "Sign In"
                  )}
                </button>

                {/* Sign Up Link */}
                <div className="text-center pt-2">
                  <p className="text-xs text-gray-600">
                    Don't have an account?{" "}
                    <Link
                      to="/auth/signup"
                      state={location.state}
                      className="text-orange-600 hover:text-orange-500 font-semibold transition-colors"
                    >
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;