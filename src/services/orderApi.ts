import axiosInstance from '../utils/axiosInstance';
import { Order, OrderResponse, OrdersResponse, CreateOrderData, PaymentData } from '../types/Order';

export const placeOrder = async (data: CreateOrderData): Promise<OrderResponse> => {
  const response = await axiosInstance.post('/orders', data);
  return response.data;
};

export const getUserOrders = async (): Promise<OrdersResponse> => {
  const response = await axiosInstance.get('/orders/my');
  return response.data;
};

export const getOrderById = async (id: string): Promise<OrderResponse> => {
  const response = await axiosInstance.get(`/orders/${id}`);
  return response.data;
};

export const markAsPaid = async (id: string, paymentData: PaymentData): Promise<OrderResponse> => {
  const response = await axiosInstance.put(`/orders/${id}/pay`, paymentData);
  return response.data;
};

// Admin functions
export const adminGetAllOrders = async (page?: number, limit?: number): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await axiosInstance.get(`/orders?${params.toString()}`);
  return response.data;
};

export const adminGetOrderById = async (id: string): Promise<OrderResponse> => {
  const response = await axiosInstance.get(`/admin/orders/${id}`);
  return response.data;
};

export const adminUpdateOrderStatus = async (id: string, status: string): Promise<OrderResponse> => {
  const response = await axiosInstance.put(`/orders/${id}/status`, { status });
  return response.data;
};

export const adminMarkAsDelivered = async (id: string): Promise<OrderResponse> => {
  const response = await axiosInstance.put(`/orders/${id}/deliver`);
  return response.data;
};

// Get frequently bought products
export const getFrequentlyBought = async (limit: number = 8) => {
  const response = await axiosInstance.get(`/orders/frequently-bought?limit=${limit}`);
  return response.data;
};