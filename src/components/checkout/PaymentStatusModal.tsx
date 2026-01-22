import React from "react";
import { Phone, CheckCircle, X } from "lucide-react";

interface PaymentStatusModalProps {
  isVisible: boolean;
  paymentStatus: "pending" | "completed" | "failed" | null;
  mpesaPhoneNumber: string;
  finalTotal: number;
  currentOrderId: string | null;
  checkoutRequestId: string;
  error: string;
  onCancel: () => void;
  onTryAgain: () => void;
}

const PaymentStatusModal: React.FC<PaymentStatusModalProps> = ({
  isVisible,
  paymentStatus,
  mpesaPhoneNumber,
  finalTotal,
  currentOrderId,
  checkoutRequestId,
  error,
  onCancel,
  onTryAgain,
}) => {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
        {paymentStatus === "pending" && (
          <>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone size={32} className="text-orange-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              STK Push Sent!
            </h3>
            <p className="text-gray-600 mb-4">
              Check your phone and enter your M-Pesa PIN to complete the
              payment.
            </p>
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800">
                <strong>Amount:</strong> Ksh {finalTotal.toFixed(2)}
              </p>
              <p className="text-sm text-orange-800">
                <strong>Phone:</strong> {mpesaPhoneNumber}
              </p>
              <p className="text-sm text-orange-800 mt-2">
                <strong>Order ID:</strong> {currentOrderId?.slice(-6)}
              </p>
            </div>
            <div className="flex items-center justify-center space-x-2 text-orange-600">
              <div className="w-4 h-4 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">
                Waiting for payment confirmation...
              </span>
            </div>
            <button
              onClick={onCancel}
              className="mt-4 text-sm text-gray-600 hover:text-gray-800 underline"
            >
              Cancel Payment
            </button>
          </>
        )}

        {paymentStatus === "completed" && (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Payment Successful!
            </h3>
            <p className="text-gray-600 mb-4">
              Your M-Pesa payment has been confirmed.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-green-800">
                <strong>Receipt:</strong> {checkoutRequestId.slice(-8)}
              </p>
              <p className="text-sm text-green-800">
                <strong>Amount:</strong> Ksh {finalTotal.toFixed(2)}
              </p>
            </div>
            <p className="text-gray-500 text-sm">
              Redirecting to order confirmation...
            </p>
          </>
        )}

        {paymentStatus === "failed" && (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <X size={32} className="text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Payment Failed
            </h3>
            <p className="text-gray-600 mb-4">
              Your M-Pesa payment could not be processed.
            </p>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800">
                {error ||
                  "Please try again or use a different payment method."}
              </p>
            </div>
            <button
              onClick={onTryAgain}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-all"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentStatusModal;