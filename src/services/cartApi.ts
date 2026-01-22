import axiosInstance from '../utils/axiosInstance';
import { Cart, CartResponse, AddToCartData, UpdateCartItemData } from '../types/Cart';

export const getCart = async (): Promise<CartResponse> => {
  const response = await axiosInstance.get('/cart');
  return response.data;
};

export const addToCart = async (data: AddToCartData): Promise<CartResponse> => {
  const response = await axiosInstance.post('/cart', data);
  return response.data;
};

export const updateCartItem = async (itemId: string, data: UpdateCartItemData): Promise<CartResponse> => {
  const response = await axiosInstance.put(`/cart/${itemId}`, data);
  return response.data;
};

export const removeFromCart = async (itemId: string): Promise<CartResponse> => {
  const response = await axiosInstance.delete(`/cart/${itemId}`);
  return response.data;
};

export const clearCart = async (): Promise<CartResponse> => {
  const response = await axiosInstance.delete('/cart');
  return response.data;
};

export const getCartItemCount = async (): Promise<number> => {
  const cartResponse = await getCart();
  return cartResponse.data.cart.totalItems;
};

export const getCartTotal = async (): Promise<number> => {
  const cartResponse = await getCart();
  return cartResponse.data.cart.totalAmount;
};