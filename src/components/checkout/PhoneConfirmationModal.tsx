import React from "react";
import { X, Phone } from "lucide-react";

interface PhoneConfirmationModalProps {
  isVisible: boolean;
  mpesaPhoneNumber: string;
  onPhoneNumberChange: (value: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
}

const PhoneConfirmationModal: React.FC<PhoneConfirmationModalProps> = ({
  isVisible,
  mpesaPhoneNumber,
  onPhoneNumberChange,
  onConfirm,
  onCancel,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Confirm Phone Number
          </h3>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 mb-4">
            Confirm this is the phone number you're paying with:
          </p>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone size={16} className="text-gray-400" />
            </div>
            <input
              type="tel"
              value={mpesaPhoneNumber}
              onChange={(e) => onPhoneNumberChange(e.target.value)}
              placeholder="e.g., 0712345678"
              className="w-full pl-10 px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
            />
          </div>

          <p className="text-sm text-gray-500 mt-2">
            Enter your M-Pesa registered phone number
          </p>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-3 px-4 rounded-lg font-medium transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!mpesaPhoneNumber.trim()}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-3 px-4 rounded-lg font-medium transition-all disabled:opacity-70 disabled:cursor-not-allowed"
          >
            Confirm & Pay
          </button>
        </div>
      </div>
    </div>
  );
};

export default PhoneConfirmationModal;