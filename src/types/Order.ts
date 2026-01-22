// types/Order.ts - Updated to match backend expectations
export interface OrderItem {
  product: string;
  name: string;
  quantity: number;
  price: number;
  image?: string;
}

export interface ShippingAddress {
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  // These are frontend-only fields for UI state
  deliveryMethod?: 'home_delivery' | 'pickup_station';
  pickupStationId?: string;
  pickupLocation?: {
    county: string;
    town: string;
  };
}

export interface Order {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'mpesa' | 'cod';
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address?: string;
  };
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  deliveryMethod: 'home_delivery' | 'pickup_station';
  pickupStation?: {
    _id: string;
    name: string;
    address: string;
    city: string;
    phone?: string;
  } | string; // Can be populated object or just ID
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'ready_for_pickup' | 'picked_up';
  trackingNumber?: string;
  assignedAgent?: {
    _id: string;
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// UPDATED: This type should match what your server expects
export interface CreateOrderData {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: 'mpesa' | 'cod';
  itemsPrice: number;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  deliveryMethod: 'home_delivery' | 'pickup_station';
  // ADD: These fields should be at root level for server
  pickupStation?: string; // The pickup station ID
  pickupInstructions?: string; // Optional pickup instructions
}

export interface PaymentData {
  id: string;
  status: string;
  update_time: string;
  email_address?: string;
}

export interface OrderResponse {
  success: boolean;
  message: string;
  data: {
    order: Order;
  };
}

export interface OrdersResponse {
  success: boolean;
  data: {
    orders: Order[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

// Additional types for pickup station orders
export interface PickupNotification {
  _id: string;
  order: string;
  user: string;
  pickupStation: {
    _id: string;
    name: string;
    address: string;
    phone?: string;
  };
  status: 'pending' | 'notified' | 'picked_up';
  notificationSent: boolean;
  notificationDate?: string;
  pickupCode: string;
  expiryDate: string;
  createdAt: string;
  updatedAt: string;
}