import axiosInstance from '../utils/axiosInstance';
import { FlashDeal, FlashDealsResponse, CreateFlashDealData } from '../types/Deal';

export const getFlashDeals = async (): Promise<FlashDealsResponse> => {
  const response = await axiosInstance.get('/deals/flash');
  return response.data;
};

export const createFlashDeal = async (data: CreateFlashDealData): Promise<{ success: boolean; message: string; data: { product: FlashDeal } }> => {
  const response = await axiosInstance.post('/deals/flash', data);
  return response.data;
};

export const removeFlashDeal = async (productId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/deals/flash/${productId}`);
  return response.data;
};