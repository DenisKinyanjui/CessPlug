import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Package,
  MapPin,
  CreditCard,
  Truck,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
} from "lucide-react";
import { getOrderById } from "../services/orderApi";
import { Order } from "../types/Order";

const TrackOrderPage = () => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (orderId) {
      fetchOrder();
    } else {
      setError("Order ID is required");
      setLoading(false);
    }
  }, [orderId]);

const fetchOrder = async () => {
  if (!orderId) return;
  
  try {
    setLoading(true);
    console.log('Fetching order with ID:', orderId);
    
    // Check if user is logged in
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token) {
      setError('Please log in to view your orders');
      navigate('/auth/login');
      return;
    }

    // Parse user data to get user ID
    let currentUser = null;
    try {
      currentUser = user ? JSON.parse(user) : null;
    } catch (parseError) {
      console.error('Error parsing user data:', parseError);
      setError('Invalid user session. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/auth/login');
      return;
    }
    
    const response = await getOrderById(orderId);
    
    if (response.success) {
      const order = response.data.order;
      
      // Debugging logs
      console.log('Order user ID:', order.user._id || order.user);
      console.log('Current user ID:', currentUser?.id || currentUser?._id);
      
      // No need for additional check here since backend already verified
      setOrder(order);
      setError(null);
    } else {
      setError('Order not found');
    }
  } catch (err: any) {
    console.error('Full error:', err);
    
    if (err.response?.status === 404) {
      setError('Order not found');
    } else if (err.response?.status === 403) {
      setError('You are not authorized to view this order');
    } else if (err.response?.status === 401) {
      setError('Your session has expired. Please log in again.');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setTimeout(() => navigate('/auth/login'), 2000);
    } else {
      setError(err.response?.data?.message || 'Failed to fetch order details');
    }
  } finally {
    setLoading(false);
  }
};

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "text-yellow-600 bg-yellow-50",
      processing: "text-orange-600 bg-orange-50",
      shipped: "text-purple-600 bg-purple-50",
      delivered: "text-green-600 bg-green-50",
      cancelled: "text-red-600 bg-red-50",
    };
    return colors[status as keyof typeof colors] || "text-gray-600 bg-gray-50";
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      pending: Clock,
      processing: Package,
      shipped: Truck,
      delivered: CheckCircle,
      cancelled: AlertCircle,
    };
    return icons[status as keyof typeof icons] || Clock;
  };

  const orderStatuses = [
    { key: "pending", label: "Order Placed", icon: Package },
    { key: "processing", label: "Processing", icon: Clock },
    { key: "shipped", label: "Shipped", icon: Truck },
    { key: "delivered", label: "Delivered", icon: CheckCircle },
  ];

  const getCurrentStatusIndex = (status: string) => {
    const statusMap = {
      pending: 0,
      processing: 1,
      shipped: 2,
      delivered: 3,
      cancelled: -1,
    };
    return statusMap[status as keyof typeof statusMap] || 0;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error === "You are not authorized to view this order"
              ? "Access Denied"
              : "Order Not Found"}
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-x-4">
            {error === "You are not authorized to view this order" ? (
              <button
                onClick={() => navigate("/profile?section=orders")}
                className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
              >
                View Your Orders
              </button>
            ) : (
              <>
                <button
                  onClick={fetchOrder}
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={() => navigate("/profile?section=orders")}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  View All Orders
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  const currentStatusIndex = getCurrentStatusIndex(order.status);
  const StatusIcon = getStatusIcon(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Track Your Order
              </h1>
              <p className="text-gray-600 mt-1">Order #{order._id}</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                order.status
              )}`}
            >
              <div className="flex items-center space-x-1">
                <StatusIcon className="h-4 w-4" />
                <span className="capitalize">{order.status}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Order Tracker */}
      <div className="bg-white rounded-lg shadow-sm mb-4 md:mb-6 p-4 md:p-6">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 mb-4 md:mb-6">
          Order Progress
        </h2>

        {order.status === "cancelled" ? (
          <div className="text-center py-4 md:py-8">
            <AlertCircle className="h-12 w-12 md:h-16 md:w-16 text-red-500 mx-auto mb-2 md:mb-4" />
            <h3 className="text-base md:text-lg font-medium text-red-900 mb-1 md:mb-2">
              Order Cancelled
            </h3>
            <p className="text-sm md:text-base text-red-600">This order has been cancelled.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Progress Line - Adjusted positioning */}
            <div className="absolute top-6 left-4 right-4 md:top-8 md:left-8 md:right-8 h-0.5 bg-gray-200">
              <div
                className="h-full bg-green-600 transition-all duration-500"
                style={{
                  width: `${(currentStatusIndex / (orderStatuses.length - 1)) * 100}%`,
                }}
              ></div>
            </div>

            {/* Status Steps - Made more compact */}
            <div className="relative flex justify-between">
              {orderStatuses.map((status, index) => {
                const Icon = status.icon;
                const isCompleted = index <= currentStatusIndex;
                const isCurrent = index === currentStatusIndex;

                return (
                  <div key={status.key} className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 md:w-16 md:h-16 rounded-full flex items-center justify-center mb-1 md:mb-2 transition-all duration-300 ${
                        isCompleted
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 text-gray-400"
                      } ${isCurrent ? "ring-2 md:ring-4 ring-green-200" : ""}`}
                    >
                      <Icon className="h-4 w-4 md:h-6 md:w-6" />
                    </div>
                    <span
                      className={`text-xs md:text-sm font-medium text-center ${
                        isCompleted ? "text-green-600" : "text-gray-400"
                      }`}
                    >
                      {status.label}
                    </span>
                    {index === currentStatusIndex && (
                      <div className="text-xxs md:text-xs text-gray-500 mt-1 text-center">
                        {formatDate(order.updatedAt)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {order.trackingNumber && (
          <div className="mt-4 md:mt-6 p-3 md:p-4 bg-orange-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Truck className="h-4 w-4 md:h-5 md:w-5 text-orange-600" />
              <span className="text-sm md:text-base font-medium text-orange-900">
                Tracking Number:
              </span>
              <span className="text-xs md:text-sm text-orange-700 font-mono">
                {order.trackingNumber}
              </span>
            </div>
          </div>
        )}
      </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Order Items */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Items
            </h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex items-center space-x-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{item.name}</h3>
                    <p className="text-gray-600">Quantity: {item.quantity}</p>
                    <p className="text-gray-900 font-medium">
                      {formatCurrency(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Items Total:</span>
                <span className="text-gray-900">
                  {formatCurrency(order.itemsPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping:</span>
                <span className="text-gray-900">
                  {formatCurrency(order.shippingPrice)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax:</span>
                <span className="text-gray-900">
                  {formatCurrency(order.taxPrice)}
                </span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-900">Total:</span>
                  <span className="text-gray-900">
                    {formatCurrency(order.totalPrice)}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="font-medium text-gray-900 mb-2">Payment Status</h3>
              <div
                className={`flex items-center space-x-2 ${
                  order.isPaid ? "text-green-600" : "text-red-600"
                }`}
              >
                {order.isPaid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <span className="text-sm font-medium">
                  {order.isPaid ? "Paid" : "Pending Payment"}
                </span>
              </div>
              {order.isPaid && order.paidAt && (
                <p className="text-xs text-gray-500 mt-1">
                  Paid on {formatDate(order.paidAt)}
                </p>
              )}
            </div>
          </div>

          {/* Shipping Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Shipping Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900">Delivery Address</p>
                  <p className="text-gray-600">
                    {order.shippingAddress.address}
                    <br />
                    {order.shippingAddress.city},{" "}
                    {order.shippingAddress.postalCode}
                    <br />
                    {order.shippingAddress.country}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Customer Information
            </h2>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <User className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">{order.user.name}</p>
                  <p className="text-gray-600">{order.user.email}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">Payment Method</p>
                  <p className="text-gray-600 capitalize">
                    {order.paymentMethod}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow-sm p-6 mt-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Order Timeline
          </h2>
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
              <div>
                <p className="font-medium text-gray-900">Order Placed</p>
                <p className="text-gray-600 text-sm">
                  {formatDate(order.createdAt)}
                </p>
              </div>
            </div>
            {order.isPaid && order.paidAt && (
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Payment Confirmed</p>
                  <p className="text-gray-600 text-sm">
                    {formatDate(order.paidAt)}
                  </p>
                </div>
              </div>
            )}
            {order.status !== "pending" && (
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">
                    Status Updated to {order.status}
                  </p>
                  <p className="text-gray-600 text-sm">
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>
            )}
            {order.isDelivered && order.deliveredAt && (
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2"></div>
                <div>
                  <p className="font-medium text-gray-900">Order Delivered</p>
                  <p className="text-gray-600 text-sm">
                    {formatDate(order.deliveredAt)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
