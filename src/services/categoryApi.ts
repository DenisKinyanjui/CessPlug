import axiosInstance from '../utils/axiosInstance';
import { Category, CategoriesResponse, CreateCategoryData } from '../types/Category';

export const getAllCategories = async (): Promise<CategoriesResponse> => {
  const response = await axiosInstance.get('/categories');
  return response.data;
};

// New function to get top categories for footer
export const getTopCategories = async (limit = 6): Promise<CategoriesResponse> => {
  const response = await axiosInstance.get(`/categories?limit=${limit}&status=active`);
  return response.data;
};

export const createCategory = async (data: CreateCategoryData): Promise<{ success: boolean; message: string; data: { category: Category } }> => {
  const response = await axiosInstance.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<CreateCategoryData>): Promise<{ success: boolean; message: string; data: { category: Category } }> => {
  const response = await axiosInstance.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/categories/${id}`);
  return response.data;
};