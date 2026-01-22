import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import SEOHelmet from '../../components/SEO/SEOHelmet';
import { forgotPassword } from '../../services/authApi';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // Basic email validation
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // You might want to add proper error state handling here
    console.error('Please enter a valid email address');
    return;
  }

  setIsLoading(true);
  
  try {
    const response = await forgotPassword(email);
    
    if (response.success) {
      setIsEmailSent(true);
    } else {
      // Handle API error (show to user)
      console.error(response.message);
    }
  } catch (error) {
    console.error('Error sending reset email:', error);
  } finally {
    setIsLoading(false);
  }
};

  const handleResendEmail = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      console.log('Password reset email resent to:', email);
    }, 1500);
  };

  return (
    <>
      <SEOHelmet
        title="Forgot Password - CessPlug | Reset Your Password"
        description="Reset your CessPlug account password. Enter your email to receive password reset instructions."
        keywords="forgot password, reset password, CessPlug account recovery"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            {/* Logo */}
            <div className="flex items-center justify-center space-x-2 mb-8">
              
            </div>

            {!isEmailSent ? (
              <>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">Forgot Password?</h2>
                  <p className="text-gray-600">
                    No worries! Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-gray-50 focus:bg-white"
                        placeholder="Enter your email address"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Sending Reset Link...</span>
                      </div>
                    ) : (
                      'Send Password Reset Link'
                    )}
                  </button>
                </form>

                {/* Back to Login */}
                <div className="mt-8 text-center">
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                  </Link>
                </div>
              </>
            ) : (
              <>
                {/* Success State */}
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Check Your Email</h2>
                  
                  <p className="text-gray-600 mb-2">
                    We've sent a password reset link to:
                  </p>
                  <p className="text-orange-600 font-semibold mb-6">{email}</p>
                  
                  <p className="text-sm text-gray-500 mb-8">
                    Didn't receive the email? Check your spam folder or click the button below to resend.
                  </p>

                  {/* Resend Button */}
                  <button
                    onClick={handleResendEmail}
                    disabled={isLoading}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-xl font-semibold transition-all duration-200 mb-6 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="w-5 h-5 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"></div>
                        <span>Resending...</span>
                      </div>
                    ) : (
                      'Resend Email'
                    )}
                  </button>

                  {/* Back to Login */}
                  <Link
                    to="/auth/login"
                    className="inline-flex items-center space-x-2 text-gray-600 hover:text-orange-600 font-medium transition-colors"
                  >
                    <ArrowLeft size={16} />
                    <span>Back to Login</span>
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Additional Help */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Need help?{' '}
              <Link to="/contact" className="text-orange-600 hover:text-orange-500 font-medium">
                Contact Support
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;