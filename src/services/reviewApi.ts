import axiosInstance from '../utils/axiosInstance';
import { Review, ReviewsResponse, CreateReviewData, CanReviewResponse } from '../types/Review';

export const getProductReviews = async (productId: string, page?: number, limit?: number): Promise<ReviewsResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await axiosInstance.get(`/reviews/${productId}?${params.toString()}`);
  return response.data;
};

export const createReview = async (productId: string, data: CreateReviewData): Promise<{ success: boolean; message: string; data: { review: Review } }> => {
  const response = await axiosInstance.post(`/reviews/${productId}`, data);
  return response.data;
};

export const canReviewProduct = async (productId: string): Promise<CanReviewResponse> => {
  const response = await axiosInstance.get(`/reviews/${productId}/can-review`);
  return response.data;
};

export const deleteReview = async (reviewId: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/reviews/${reviewId}`);
  return response.data;
};