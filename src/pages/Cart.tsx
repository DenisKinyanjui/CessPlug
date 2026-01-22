import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { Trash2, Plus, Minus } from 'lucide-react';
import { RootState } from '../store/store';
import { removeFromCart, updateQuantity } from '../store/slices/cartSlice';
import { useAuth } from '../contexts/AuthContext';
import SEOHelmet from '../components/SEO/SEOHelmet';

const Cart: React.FC = () => {
  const dispatch = useDispatch();
  const { items, totalAmount, totalQuantity } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleQuantityChange = (id: string, newQuantity: number) => {
    if (newQuantity > 0) {
      dispatch(updateQuantity({ id, quantity: newQuantity }));
    }
  };

  const handleRemoveItem = (id: string) => {
    dispatch(removeFromCart(id));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/auth/login', { 
        state: { from: location }
      });
      return;
    }
    navigate('/checkout');
  };
  
  return (
    <>
      <SEOHelmet
        title="Shopping Cart - CessPlug"
        description="Review your cart items and proceed to checkout. Secure payment and fast delivery guaranteed."
        keywords="shopping cart, checkout, CessPlug"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-6 md:mb-8">Shopping Cart</h1>
        
        {items.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
            <a
              href="/"
              className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
            >
              Continue Shopping
            </a>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-2/3">
              {items.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-md p-4 mb-4">
                  <div className="flex items-center gap-4">
                    {/* Image - Left */}
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    
                    {/* Product Info - Center */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-800 truncate">{item.name}</h3>
                      <p className="text-sm text-gray-600">{item.category}</p>
                      <p className="text-lg font-bold text-orange-600 mt-1">
                        Ksh {item.price.toLocaleString()}
                      </p>
                    </div>
                    
                    {/* Actions - Right */}
                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="text-red-500 hover:text-red-700 p-1 transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="w-7 text-center font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                          className="w-7 h-7 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center transition-colors"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:w-1/3">
              <div className="bg-white rounded-lg shadow-md p-4 md:p-6 sticky top-4">
                <h2 className="text-lg md:text-xl font-semibold mb-4">Order Summary</h2>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-sm md:text-base">Items ({totalQuantity})</span>
                    <span className="text-sm md:text-base">Ksh {totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm md:text-base">Delivery</span>
                    <span className="text-green-600 text-sm md:text-base">Free</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between font-semibold text-base md:text-lg">
                    <span>Total</span>
                    <span>Ksh {totalAmount.toLocaleString()}</span>
                  </div>
                </div>
                
                {!isAuthenticated && (
                  <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm">
                    <p className="text-yellow-800 mb-2">
                      Please log in or sign up to proceed with checkout
                    </p>
                  </div>
                )}
                
                <button
                  onClick={handleCheckout}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 md:py-3 rounded-lg font-semibold transition-colors text-sm md:text-base"
                >
                  {isAuthenticated ? 'Proceed to Checkout' : 'Login to Checkout'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Cart;