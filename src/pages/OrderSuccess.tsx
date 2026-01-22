import React from "react";
import { ArrowRight, ListOrdered } from "lucide-react";
import { useNavigate } from "react-router-dom";

const OrderSuccess: React.FC = () => {
  const navigate = useNavigate();

  const handleContinueShopping = () => {
    navigate("/profile?section=orders");
  };

  const handleViewOrders = () => {
    navigate("/products");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-8">
      <div className="max-w-[700px] w-full bg-white rounded-xl shadow-sm p-8 text-center">
        {/* Success icon */}
        <div className="mb-2">
          <img 
            src="/images/Success.svg" 
            alt="Success" 
            className="mx-auto w-40 h-40"
          />
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Your order is successfully placed
        </h2>

        {/* Description */}
        <p className="text-gray-600 mb-8">
          Thank you for your purchase. You’ll receive an email confirmation shortly.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleViewOrders}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <ListOrdered size={16} />
            <span>VIEW MORE PRODUCTS</span>
          </button>

          <button
            onClick={handleContinueShopping}
            className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            <span>VIEW ORDERS</span>
            <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;