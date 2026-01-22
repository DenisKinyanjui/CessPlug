import React from "react";
import { Trash2 } from "lucide-react";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface CheckoutItemsProps {
  items: CartItem[];
  totalQuantity: number;
  onRemoveItem: (id: string) => void;
}

const CheckoutItems: React.FC<CheckoutItemsProps> = ({
  items,
  totalQuantity,
  onRemoveItem,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 pb-4 border-b border-gray-100">
        Shopping Items ({totalQuantity})
      </h2>
      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <img
              src={item.image}
              alt={item.name}
              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
            />
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-800 truncate">
                {item.name}
              </h3>
              <div className="flex items-center justify-between mt-2">
                <span className="text-base font-bold text-orange-600">
                  Ksh {item.price.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">
                  x{item.quantity}
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-base font-bold text-gray-800">
                Ksh {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
            <button
              onClick={() => onRemoveItem(item.id)}
              className="text-red-500 hover:text-red-700 p-1 transition-colors"
            >
              <Trash2 size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckoutItems;