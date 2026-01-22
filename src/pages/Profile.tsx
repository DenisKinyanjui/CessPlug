import React, { useState, useEffect } from 'react';
import { User, Package, MapPin, LogOut, Camera, Save, Eye, EyeOff, Truck, Plus, Edit, Trash2, Lock } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SEOHelmet from '../components/SEO/SEOHelmet';
import { getCurrentUser, updateProfile, logoutUser, addAddress, updateAddress, deleteAddress, setDefaultAddress, changePassword } from '../services/authApi';
import { getUserOrders } from '../services/orderApi';
import { User as UserType } from '../types/User';
import { Order } from '../types/Order';

interface Address {
  _id: string;
  type: 'Home' | 'Work' | 'Other';
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone: string;
  isDefault: boolean;
}

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [activeSection, setActiveSection] = useState('account');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showRepeatPassword, setShowRepeatPassword] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [user, setUser] = useState<UserType | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [error, setError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [passwordSuccessMessage, setPasswordSuccessMessage] = useState<string>('');

  const [accountData, setAccountData] = useState({
    name: '',
    email: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });

  const [passwordData, setPasswordData] = useState({
    oldPassword: '',
    newPassword: '',
    repeatPassword: '',
  });

  const [newAddress, setNewAddress] = useState({
    type: 'Home' as 'Home' | 'Work' | 'Other',
    name: '',
    address: '',
    city: '',
    country: '',
    postalCode: '',
    phone: '',
    isDefault: false
  });

  // Clear messages after a few seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (passwordSuccessMessage) {
      const timer = setTimeout(() => setPasswordSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
  }, [passwordSuccessMessage]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (passwordError) {
      const timer = setTimeout(() => setPasswordError(''), 8000);
      return () => clearTimeout(timer);
    }
  }, [passwordError]);

  // Load user profile and orders on component mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsPageLoading(true);
        setError('');
        
        const sectionParam = searchParams.get('section');
        if (sectionParam && ['account', 'orders', 'address', 'logout'].includes(sectionParam)) {
          setActiveSection(sectionParam);
        }

        const userResponse = await getCurrentUser();
        if (userResponse.success) {
          const userData = userResponse.data.user;
          setUser(userData);
          setAccountData({
            name: userData.name || '',
            email: userData.email || '',
            phone: userData.phone || '',
            street: userData.address?.street || '',
            city: userData.address?.city || '',
            state: userData.address?.state || '',
            zipCode: userData.address?.zipCode || '',
            country: userData.address?.country || '',
          });

          // Set addresses from the new addresses array
          setAddresses(userData.addresses || []);
        } else {
          setError('Failed to load user profile');
        }

        const ordersResponse = await getUserOrders();
        if (ordersResponse.success) {
          setOrders(ordersResponse.data.orders);
        } else {
          setError('Failed to load order history');
        }
      } catch (error: any) {
        setError(error.response?.data?.message || 'Failed to load data');
        console.error('Error loading profile data:', error);
      } finally {
        setIsPageLoading(false);
      }
    };

    loadUserData();
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setAccountData(prev => ({ ...prev, [name]: value }));
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    if (passwordError) setPasswordError('');
    if (passwordSuccessMessage) setPasswordSuccessMessage('');
  };

  const handleNewAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setNewAddress(prev => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value 
    }));
  };

  const handleSaveAccount = async () => {
    try {
      setIsLoading(true);
      setError('');
      setSuccessMessage('');

      const updateData = {
        name: accountData.name,
        email: accountData.email,
        phone: accountData.phone,
        address: {
          street: accountData.street,
          city: accountData.city,
          state: accountData.state,
          zipCode: accountData.zipCode,
          country: accountData.country,
        }
      };

      const response = await updateProfile(updateData);
      
      if (response.success) {
        setUser(response.data.user);
        setSuccessMessage('Profile updated successfully!');
        
        // Update addresses if they exist
        if (response.data.user.addresses) {
          setAddresses(response.data.user.addresses);
        }
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update profile');
      console.error('Error updating profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsPasswordLoading(true);
      setPasswordError('');
      setPasswordSuccessMessage('');

      // Validation
      if (!passwordData.oldPassword || !passwordData.newPassword || !passwordData.repeatPassword) {
        setPasswordError('Please fill in all password fields');
        return;
      }

      if (passwordData.newPassword !== passwordData.repeatPassword) {
        setPasswordError('New passwords do not match');
        return;
      }

      if (passwordData.newPassword.length < 8) {
        setPasswordError('New password must be at least 8 characters long');
        return;
      }

      if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(passwordData.newPassword)) {
        setPasswordError('Password must contain at least one uppercase letter, one lowercase letter, and one number');
        return;
      }

      const response = await changePassword({
        currentPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        setPasswordSuccessMessage('Password changed successfully!');
        setPasswordData({
          oldPassword: '',
          newPassword: '',
          repeatPassword: '',
        });
      } else {
        setPasswordError(response.message || 'Failed to change password');
      }
    } catch (error: any) {
      setPasswordError(error.response?.data?.message || 'Failed to change password. Please check your current password and try again.');
      console.error('Error changing password:', error);
    } finally {
      setIsPasswordLoading(false);
    }
  };

  const handleEditAddress = (address: Address) => {
    setEditingAddress(address);
    setNewAddress({
      type: address.type,
      name: address.name,
      address: address.address,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode || '',
      phone: address.phone,
      isDefault: address.isDefault
    });
    setShowAddAddressModal(true);
  };

  const handleAddAddress = async () => {
    if (!newAddress.name || !newAddress.address || !newAddress.city || !newAddress.country) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const addressData = {
        type: newAddress.type,
        name: newAddress.name,
        address: newAddress.address,
        city: newAddress.city,
        country: newAddress.country,
        postalCode: newAddress.postalCode || '',
        phone: newAddress.phone || user?.phone || '',
        isDefault: newAddress.isDefault
      };

      let response;

      if (editingAddress) {
        // Update existing address
        response = await updateAddress(editingAddress._id, addressData);
        setSuccessMessage('Address updated successfully!');
      } else {
        // Add new address
        response = await addAddress(addressData);
        setSuccessMessage('Address added successfully!');
      }

      if (response.success) {
        setUser(response.data.user);
        setAddresses(response.data.user.addresses || []);
        
        // Reset form and close modal
        setShowAddAddressModal(false);
        setEditingAddress(null);
        setNewAddress({
          type: 'Home',
          name: '',
          address: '',
          city: '',
          country: '',
          postalCode: '',
          phone: '',
          isDefault: false
        });
      } else {
        setError(response.message || 'Failed to save address');
      }

    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to save address');
      console.error('Error saving address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setIsLoading(true);
      setError('');

      const response = await setDefaultAddress(addressId);
      
      if (response.success) {
        setUser(response.data.user);
        setAddresses(response.data.user.addresses || []);
        setSuccessMessage('Default address updated successfully!');
      } else {
        setError(response.message || 'Failed to update default address');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to update default address');
      console.error('Error updating default address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      setIsLoading(true);
      setError('');
      
      const response = await deleteAddress(addressId);
      
      if (response.success) {
        setUser(response.data.user);
        setAddresses(response.data.user.addresses || []);
        setSuccessMessage('Address deleted successfully!');
      } else {
        setError(response.message || 'Failed to delete address');
      }
    } catch (error: any) {
      setError(error.response?.data?.message || 'Failed to delete address');
      console.error('Error deleting address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setShowLogoutModal(false);
      window.location.href = '/auth/login';
    } catch (error) {
      console.error('Logout error:', error);
      window.location.href = '/auth/login';
    }
  };

  const handleTrackOrder = (orderId: string) => {
    navigate(`/track-order/${orderId}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-yellow-600 bg-yellow-100';
      case 'shipped': return 'text-blue-600 bg-blue-100';
      case 'cancelled': return 'text-red-600 bg-red-100';
      case 'pending': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const sidebarItems = [
    { id: 'account', label: 'My Account', icon: User },
    { id: 'orders', label: 'Order History', icon: Package },
    { id: 'address', label: 'Address', icon: MapPin },
    { id: 'logout', label: 'Logout', icon: LogOut },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case 'account':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">My Account</h2>
            
            {/* Profile Update Section */}
            <div className="border-b pb-6 mb-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Profile Information</h3>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                  {error}
                </div>
              )}
              {successMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                  {successMessage}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={accountData.name}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={accountData.email}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your email"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={accountData.phone}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Street Address</label>
                  <input
                    type="text"
                    name="street"
                    value={accountData.street}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your street address"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">City</label>
                  <input
                    type="text"
                    name="city"
                    value={accountData.city}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your city"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Town/Estate</label>
                  <input
                    type="text"
                    name="state"
                    value={accountData.state}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your Town/Estate"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">ZIP Code</label>
                  <input
                    type="text"
                    name="zipCode"
                    value={accountData.zipCode}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your ZIP code"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Country</label>
                  <input
                    type="text"
                    name="country"
                    value={accountData.country}
                    onChange={handleInputChange}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                    placeholder="Enter your country"
                  />
                </div>
              </div>
              
              <button
                onClick={handleSaveAccount}
                disabled={isLoading}
                className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Saving...</span>
                  </>
                ) : (
                  <>
                    <Save size={16} className="sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Save Profile</span>
                  </>
                )}
              </button>
            </div>

            {/* Password Change Section */}
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Change Password</h3>
              
              {passwordError && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                  {passwordError}
                </div>
              )}
              {passwordSuccessMessage && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                  {passwordSuccessMessage}
                </div>
              )}
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Current Password</label>
                  <div className="relative">
                    <input
                      type={showOldPassword ? 'text' : 'password'}
                      name="oldPassword"
                      value={passwordData.oldPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showOldPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">New Password</label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Enter new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                  
                </div>
                
                <div>
                  <label className="block text-gray-700 text-xs sm:text-sm font-medium mb-1 sm:mb-2">Confirm New Password</label>
                  <div className="relative">
                    <input
                      type={showRepeatPassword ? 'text' : 'password'}
                      name="repeatPassword"
                      value={passwordData.repeatPassword}
                      onChange={handlePasswordInputChange}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pr-10 bg-white rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm sm:text-base"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowRepeatPassword(!showRepeatPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showRepeatPassword ? (
                        <EyeOff className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      ) : (
                        <Eye className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleChangePassword}
                disabled={isPasswordLoading || !passwordData.oldPassword || !passwordData.newPassword || !passwordData.repeatPassword}
                className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-2 sm:py-3 rounded-lg font-medium sm:font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 w-full sm:w-auto justify-center"
              >
                {isPasswordLoading ? (
                  <>
                    <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm sm:text-base">Changing...</span>
                  </>
                ) : (
                  <>
                    <Lock size={16} className="sm:h-5 sm:w-5" />
                    <span className="text-sm sm:text-base">Change Password</span>
                  </>
                )}
              </button>

              {/* Password Requirements */}
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Password Requirements:</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Contains at least one uppercase letter (A-Z)</li>
                  <li>• Contains at least one lowercase letter (a-z)</li>
                  <li>• Contains at least one number (0-9)</li>
                </ul>
              </div>
            </div>
          </div>
        );

      case 'orders':
        return (
          <div className="space-y-4 sm:space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">Order History</h2>
            
            {orders.length === 0 ? (
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm text-center">
                <p className="text-gray-600 text-sm sm:text-base">You haven't placed any orders yet.</p>
              </div>
            ) : (
              <div className="space-y-3 sm:space-y-4">
                {orders.map((order) => (
                  <div key={order._id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-3 sm:mb-4">
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold text-gray-800">Order #{order._id.substring(0, 8)}</h3>
                        <p className="text-gray-600 text-xs sm:text-sm">
                          Placed on {new Date(order.createdAt).toLocaleDateString()}
                          {order.paidAt && (
                            <span className="ml-1 sm:ml-2 text-green-600">
                              • Paid on {new Date(order.paidAt).toLocaleDateString()}
                            </span>
                          )}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 sm:space-x-4 mt-2 sm:mt-0">
                        <span className={`px-2 py-1 sm:px-3 sm:py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                        <span className="text-base sm:text-lg font-bold text-gray-800">
                          Ksh {order.totalPrice.toLocaleString()}
                        </span>
                      </div>
                    </div>
                    
                    <div className="border-t pt-3 sm:pt-4">
                      <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Items ({order.orderItems.length}):</p>
                      <ul className="list-disc list-inside text-gray-800 text-xs sm:text-sm">
                        {order.orderItems.map((item, index) => (
                          <li key={index}>
                            {item.name} (x{item.quantity}) - Ksh {(item.price * item.quantity).toLocaleString()}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="border-t pt-3 sm:pt-4">
                      <p className="text-gray-600 text-xs sm:text-sm mb-1 sm:mb-2">Shipping Address:</p>
                      <p className="text-gray-800 text-xs sm:text-sm">
                        {order.shippingAddress.address}, {order.shippingAddress.city}<br />
                        {order.shippingAddress.postalCode}, {order.shippingAddress.country}
                      </p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 sm:gap-3 mt-3 sm:mt-4">
                      <button 
                        onClick={() => console.log('View order details', order._id)}
                        className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm"
                      >
                        View Details
                      </button>
                      
                      <button 
                        onClick={() => handleTrackOrder(order._id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                      >
                        <Truck size={12} className="sm:h-4 sm:w-4" />
                        <span>Track My Order</span>
                      </button>
                      
                      {order.status === 'shipped' && order.trackingNumber && (
                        <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm">
                          Track Package
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      case 'address':
        return (
          <div className="space-y-4 sm:space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Saved Addresses</h2>
              <button 
                onClick={() => setShowAddAddressModal(true)}
                className="bg-orange-500 hover:bg-orange-600 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm flex items-center space-x-2"
              >
                <Plus size={16} />
                <span>Add New Address</span>
              </button>
            </div>

            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                {error}
              </div>
            )}
            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 text-sm sm:text-base">
                {successMessage}
              </div>
            )}
            
            {addresses.length === 0 ? (
              <div className="bg-white rounded-lg p-4 sm:p-6 shadow-sm text-center">
                <p className="text-gray-600 text-sm sm:text-base">No saved addresses found. Add your first address to get started!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                {addresses.map((address) => (
                  <div key={address._id} className="bg-white rounded-lg p-4 sm:p-6 shadow-sm">
                    <div className="flex justify-between items-start mb-3 sm:mb-4">
                      <div>
                        <div className="flex items-center space-x-1 sm:space-x-2 mb-1 sm:mb-2">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-800">{address.type}</h3>
                          {address.isDefault && (
                            <span className="bg-green-100 text-green-600 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium text-sm sm:text-base">{address.name}</p>
                      </div>
                      <button 
                        onClick={() => handleEditAddress(address)}
                        className="text-orange-500 hover:text-orange-600 font-medium text-xs sm:text-sm flex items-center space-x-1"
                      >
                        <Edit size={14} />
                        <span>Edit</span>
                      </button>
                    </div>
                    
                    <div className="text-gray-600 space-y-1 text-xs sm:text-sm">
                      <p>{address.address}</p>
                      <p>{address.city}{address.postalCode && `, ${address.postalCode}`}</p>
                      <p>{address.country}</p>
                      {address.phone && <p>{address.phone}</p>}
                    </div>
                    
                    <div className="flex space-x-2 sm:space-x-3 mt-3 sm:mt-4">
                      {!address.isDefault && (
                        <button 
                          onClick={() => handleSetDefaultAddress(address._id)}
                          disabled={isLoading}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-2 sm:px-4 py-1 sm:py-2 rounded-lg font-medium transition-colors text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isLoading ? 'Setting...' : 'Set as Default'}
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteAddress(address._id)}
                        disabled={isLoading}
                        className="text-red-500 hover:text-red-600 font-medium text-xs sm:text-sm flex items-center space-x-1 disabled:opacity-50"
                      >
                        <Trash2 size={14} />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (isPageLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-3 sm:mb-4"></div>
          <p className="text-gray-600 text-sm sm:text-base">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHelmet
        title="My Account - VinkyShopping | Manage Your Profile"
        description="Manage your VinkyShopping account, view order history, update addresses, and modify your profile settings."
        keywords="my account, profile, order history, addresses, VinkyShopping"
      />
      
      <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 sm:gap-8">
            {/* Left Panel - User Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 sticky top-4">
                {/* Profile Picture */}
                <div className="text-center mb-4 sm:mb-6">
                  <div className="relative inline-block">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-gray-300 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                      {user?.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt="Profile" 
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-gray-600 sm:h-10 sm:w-10" />
                      )}
                    </div>
                    <button className="absolute bottom-0 right-0 bg-orange-500 hover:bg-orange-600 text-white p-1 sm:p-2 rounded-full transition-colors">
                      <Camera size={12} className="sm:h-4 sm:w-4" />
                    </button>
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-800">
                    {user?.name || 'User'}
                  </h3>
                  <p className="text-gray-600 text-xs sm:text-sm">{user?.email}</p>
                </div>

                {/* Navigation Menu */}
                <nav className="grid grid-cols-4 md:grid-cols-1 lg:grid-cols-1 gap-2">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.id === 'logout') {
                            setShowLogoutModal(true);
                          } else {
                            setActiveSection(item.id);
                          }
                        }}
                        className={`w-full flex items-center space-x-2 px-3 sm:px-4 py-2 sm:py-3 rounded-lg border-2 transition-all text-xs sm:text-sm ${
                          activeSection === item.id
                            ? 'border-purple-500 bg-purple-50 text-purple-600'
                            : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700'
                        }`}
                      >
                        <Icon size={16} className="sm:h-5 sm:w-5" />
                        <span className="font-medium">{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Right Panel - Dynamic Content */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 lg:p-8">
                {renderContent()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showAddAddressModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h3>
              <button
                onClick={() => {
                  setShowAddAddressModal(false);
                  setEditingAddress(null);
                  setNewAddress({
                    type: 'Home',
                    name: '',
                    address: '',
                    city: '',
                    country: '',
                    postalCode: '',
                    phone: '',
                    isDefault: false
                  });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Address Type</label>
                <select
                  name="type"
                  value={newAddress.type}
                  onChange={handleNewAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="Home">Home</option>
                  <option value="Work">Work</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  value={newAddress.name}
                  onChange={handleNewAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Street Address *</label>
                <input
                  type="text"
                  name="address"
                  value={newAddress.address}
                  onChange={handleNewAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter street address"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">City *</label>
                  <input
                    type="text"
                    name="city"
                    value={newAddress.city}
                    onChange={handleNewAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter city"
                    required
                  />
                </div>

                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Postal Code</label>
                  <input
                    type="text"
                    name="postalCode"
                    value={newAddress.postalCode}
                    onChange={handleNewAddressChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Enter postal code"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Country *</label>
                <input
                  type="text"
                  name="country"
                  value={newAddress.country}
                  onChange={handleNewAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter country"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 text-sm font-medium mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={newAddress.phone}
                  onChange={handleNewAddressChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Enter phone number"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isDefault"
                  checked={newAddress.isDefault}
                  onChange={handleNewAddressChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-700">
                  Set as default address
                </label>
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddAddressModal(false);
                  setEditingAddress(null);
                  setNewAddress({
                    type: 'Home',
                    name: '',
                    address: '',
                    city: '',
                    country: '',
                    postalCode: '',
                    phone: '',
                    isDefault: false
                  });
                }}
                disabled={isLoading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAddAddress}
                disabled={isLoading}
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (editingAddress ? 'Updating...' : 'Adding...') : (editingAddress ? 'Update Address' : 'Add Address')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-3 sm:mx-4">
            <h3 className="text-lg font-semibold text-gray-800 mb-3 sm:mb-4">Confirm Logout</h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">Are you sure you want to logout from your account?</p>
            
            <div className="flex space-x-2 sm:space-x-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 px-3 sm:px-4 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Profile;