import React from "react";
import { MapPin, CheckCircle } from "lucide-react";

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

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
}

interface DeliveryDetailsFormProps {
  customerInfo: CustomerInfo;
  addresses: Address[];
  isLoadingUserData: boolean;
  showAddressDropdown: boolean;
  hasDeliveryDetailsChanged: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  onToggleAddressDropdown: () => void;
  onSelectPreviousAddress: (address: Address) => void;
}

const DeliveryDetailsForm: React.FC<DeliveryDetailsFormProps> = ({
  customerInfo,
  addresses,
  isLoadingUserData,
  showAddressDropdown,
  hasDeliveryDetailsChanged,
  onInputChange,
  onToggleAddressDropdown,
  onSelectPreviousAddress,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">
          Delivery Details
        </h2>
        {addresses.length > 0 && (
          <button
            type="button"
            onClick={onToggleAddressDropdown}
            className="text-sm text-orange-600 hover:text-orange-700 font-medium"
          >
            Use Saved Address
          </button>
        )}
      </div>

      {/* Auto-save notification */}
      {hasDeliveryDetailsChanged && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <CheckCircle size={16} className="text-blue-600" />
            <p className="text-sm text-blue-700">
              This address will be saved as your new default delivery address
            </p>
          </div>
        </div>
      )}

      {showAddressDropdown && addresses.length > 0 && (
        <div className="mb-4 p-3 border border-gray-200 rounded-lg bg-gray-50">
          <p className="text-sm font-medium text-gray-700 mb-2">
            Select a saved address:
          </p>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {addresses.map((address) => (
              <button
                key={address._id}
                type="button"
                onClick={() => onSelectPreviousAddress(address)}
                className="w-full text-left p-2 hover:bg-white rounded border border-transparent hover:border-orange-200 transition-all"
              >
                <div className="text-sm">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="font-medium">{address.name}</span>
                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                      {address.type}
                    </span>
                    {address.isDefault && (
                      <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded">
                        Default
                      </span>
                    )}
                  </div>
                  <div className="text-gray-600">
                    {address.address}, {address.city}, {address.country}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Full Name
          </label>
          <input
            type="text"
            name="name"
            value={customerInfo.name}
            onChange={onInputChange}
            placeholder="Kamau Patel"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            required
            disabled={isLoadingUserData}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Country
          </label>
          <select
            name="country"
            value={customerInfo.country}
            onChange={onInputChange}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={isLoadingUserData}
          >
            <option value="Kenya">Kenya</option>
            <option value="Uganda">Uganda</option>
            <option value="Tanzania">Tanzania</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Street Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MapPin size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              name="address"
              value={customerInfo.address}
              onChange={onInputChange}
              placeholder="21/3, Mirema Drive"
              className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
              required
              disabled={isLoadingUserData}
            />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Town/City
          </label>
          <input
            type="text"
            name="city"
            value={customerInfo.city}
            onChange={onInputChange}
            placeholder="Roysambu"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            disabled={isLoadingUserData}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={customerInfo.phone}
            onChange={onInputChange}
            placeholder="+254 731926651"
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            required
            disabled={isLoadingUserData}
          />
        </div>
      </div>
    </div>
  );
};

export default DeliveryDetailsForm;