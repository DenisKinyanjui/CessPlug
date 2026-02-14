import React from "react";
import { Gift, AlertCircle } from "lucide-react";

interface PaymentMethodSelectorProps {
  paymentMethod: string;
  onPaymentMethodChange: (method: string) => void;
  // NEW: Chama support
  isChamaEligible?: boolean;
  chamaMaxAmount?: number;
  chamaGroupName?: string;
  ineligibilityReason?: string;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  isChamaEligible = false,
  chamaMaxAmount = 0,
  chamaGroupName = "",
  ineligibilityReason = "",
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

        {/* NEW: Chama Credit Option */}
        <div
          className={`p-4 border rounded-lg transition-all ${
            isChamaEligible ? "cursor-pointer" : "cursor-not-allowed"
          } ${
            paymentMethod === "chama"
              ? "border-green-500 bg-green-50"
              : "border-gray-200 hover:border-gray-300"
          } ${!isChamaEligible ? "opacity-60" : ""}`}
          onClick={() => {
            if (isChamaEligible) {
              onPaymentMethodChange("chama");
            }
          }}
        >
          <div className="flex items-center space-x-3">
            <input
              type="radio"
              id="chama"
              name="payment"
              value="chama"
              checked={paymentMethod === "chama"}
              onChange={(e) => {
                if (isChamaEligible) {
                  onPaymentMethodChange(e.target.value);
                }
              }}
              disabled={!isChamaEligible}
              className="w-4 h-4 text-green-600 border-gray-300 focus:ring-green-500"
            />
            <label
              htmlFor="chama"
              className={`flex items-center space-x-2 ${
                isChamaEligible ? "cursor-pointer" : "cursor-not-allowed"
              } w-full`}
            >
              <Gift size={20} className="text-green-600" />
              <div>
                <span className="font-medium text-sm">Chama Credit</span>
                {isChamaEligible && (
                  <p className="text-xs text-green-700">
                    Available: KSH {chamaMaxAmount}
                  </p>
                )}
              </div>
            </label>
          </div>
          {!isChamaEligible && (
            <div className="flex items-start gap-1 mt-2 ml-7">
              <AlertCircle size={14} className="text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-700">
                {ineligibilityReason || "Not eligible"}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NEW: Chama Credit Info Display */}
      {paymentMethod === "chama" && isChamaEligible && (
        <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-semibold text-green-900 mb-2 flex items-center gap-2">
            <Gift size={18} />
            Chama Credit Details
          </h3>
          <div className="text-sm text-green-800 space-y-1">
            <p>Group: <span className="font-semibold">{chamaGroupName}</span></p>
            <p>Maximum Amount: <span className="font-semibold">KSH {chamaMaxAmount}</span></p>
            <p className="text-xs text-green-700 mt-2 bg-white bg-opacity-50 p-2 rounded">
              ℹ️ The available amount will be deducted from your chama credit. Any excess will need to be paid separately.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethodSelector;