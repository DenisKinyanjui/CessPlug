import React from "react";
import { Package } from "lucide-react";

interface OrderSummaryProps {
  totalAmount: number;
  paymentMethod: string;
  isProcessing: boolean;
  isFormValid: boolean;
  onConfirmOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  totalAmount,
  paymentMethod,
  isProcessing,
  isFormValid,
  onConfirmOrder,
}) => {
  const shippingCost = 0;
  const taxAmount = 0;
  const finalTotal = totalAmount;

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 h-fit sticky top-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
        Order Summary
      </h2>

      <div className="space-y-4 mb-6">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">
            Ksh {totalAmount.toFixed(2)}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Delivery</span>
          <span className="font-medium text-green-600">Free</span>
        </div>
        {/* <div className="flex justify-between">
          <span className="text-gray-600">Tax</span>
          <span className="font-medium">Ksh {taxAmount}</span>
        </div> */}

        <div className="flex justify-between text-lg font-bold border-t border-gray-100 pt-4">
          <span>Total</span>
          <span className="text-orange-600">
            Ksh {finalTotal.toFixed(2)}
          </span>
        </div>
      </div>

      <button
        onClick={onConfirmOrder}
        disabled={isProcessing || !isFormValid}
        className="w-full bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white py-4 px-6 rounded-lg font-semibold transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-sm flex items-center justify-center space-x-3"
      >
        {isProcessing ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Processing Order...</span>
          </>
        ) : (
          <>
            <Package size={20} />
            <span>
              {paymentMethod === "mpesa"
                ? "Pay with M-Pesa"
                : "Confirm Order"}
            </span>
          </>
        )}
      </button>

      <div className="mt-4 text-xs text-gray-500 text-center">
        By completing your purchase, you agree to our{" "}
        <a
          href="/terms-of-service"
          className="text-purple-600 hover:underline"
        >
          Terms of Service
        </a>{" "}
        and{" "}
        <a
          href="/privacy-policy"
          className="text-purple-600 hover:underline"
        >
          Privacy Policy
        </a>
        .
      </div>
    </div>
  );
};

export default OrderSummary;