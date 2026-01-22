import axiosInstance from '../utils/axiosInstance';
import { BannersResponse } from '../types/Admin';

export const getPublicBanners = async (position?: string): Promise<BannersResponse> => {
  const params = new URLSearchParams();
  if (position) params.append('position', position);
  
  const response = await axiosInstance.get(`/banners?${params.toString()}`);
  return response.data;
};

export const getHeroBanners = async (): Promise<BannersResponse> => {
  return getPublicBanners('hero');
};

export const getCategoryBanners = async (): Promise<BannersResponse> => {
  return getPublicBanners('category');
};

export const getPromotionBanners = async (): Promise<BannersResponse> => {
  return getPublicBanners('promotion');
};

export const getFooterBanners = async (): Promise<BannersResponse> => {
  return getPublicBanners('footer');
};