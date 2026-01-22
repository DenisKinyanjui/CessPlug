import React from "react";

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
        Payment Method
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            paymentMethod === "mpesa"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onPaymentMethodChange("mpesa")}
        >
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="mpesa"
              name="payment"
              value="mpesa"
              checked={paymentMethod === "mpesa"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
            />
            <label
              htmlFor="mpesa"
              className="flex items-center space-x-3 cursor-pointer w-full"
            >
              <img
                src="/images/mpesaLogo.svg"
                alt="mpesa logo"
                className="h-12"
              />
              <span className="font-medium text-sm">
                M-Pesa Express
              </span>
            </label>
          </div>
        </div>

        <div
          className={`p-4 border rounded-lg cursor-pointer transition-all ${
            paymentMethod === "cod"
              ? "border-orange-500 bg-orange-50"
              : "border-gray-200 hover:border-gray-300"
          }`}
          onClick={() => onPaymentMethodChange("cod")}
        >
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="cod"
              name="payment"
              value="cod"
              checked={paymentMethod === "cod"}
              onChange={(e) => onPaymentMethodChange(e.target.value)}
              className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
            />
            <label
              htmlFor="cod"
              className="flex items-center space-x-3 cursor-pointer w-full"
            >
              <div className="bg-gray-700 text-white px-2 py-1 rounded text-xs font-bold">
                COD
              </div>
              <span className="font-medium text-sm">
                Cash on Delivery
              </span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;