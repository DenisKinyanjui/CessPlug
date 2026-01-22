import axiosInstance from '../utils/axiosInstance';
import { Brand, BrandsResponse, CreateBrandData } from '../types/Brand';

export const getAllBrands = async (): Promise<BrandsResponse> => {
  const response = await axiosInstance.get('/brands');
  return response.data;
};

export const createBrand = async (data: CreateBrandData): Promise<{ success: boolean; message: string; data: { brand: Brand } }> => {
  const response = await axiosInstance.post('/brands', data);
  return response.data;
};

export const updateBrand = async (id: string, data: Partial<CreateBrandData>): Promise<{ success: boolean; message: string; data: { brand: Brand } }> => {
  const response = await axiosInstance.put(`/brands/${id}`, data);
  return response.data;
};

export const deleteBrand = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/brands/${id}`);
  return response.data;
};