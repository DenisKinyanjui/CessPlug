import axiosInstance from '../utils/axiosInstance';
import { LoginCredentials, AuthResponse } from '../types/User';
import {
  DashboardResponse,
  AdminUsersResponse,
  AdminUserResponse,
  UserFilters,
  UpdateUserData,
  AdminProductsResponse,
  AdminProductFilters,
  UpdateOrderStatusData,
  AdminBannersResponse,
  BannerFilters,
  CreateBannerData,
  BannerResponse,
  AdminResponse
} from '../types/Admin';
import { OrderResponse, OrdersResponse } from '../types/Order';
import { ProductResponse, CreateProductData } from '../types/Product';
import { CreateCategoryData } from '../types/Category';
import { CreateBrandData } from '../types/Brand';

// Create admin axios instance with different token key
const adminAxiosInstance = axiosInstance;

// Override the request interceptor for admin routes
adminAxiosInstance.interceptors.request.use(
  (config) => {
    // Check if it's an admin route
    if (config.url?.includes('/admin/')) {
      const adminToken = localStorage.getItem('adminToken');
      if (adminToken) {
        config.headers.Authorization = `Bearer ${adminToken}`;
      }
    } else {
      // Use regular token for non-admin routes
      const token = localStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Admin Authentication
export const adminLogin = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const response = await adminAxiosInstance.post('/auth/login', credentials);
  return response.data;
};

export const getAdminProfile = async (): Promise<AuthResponse> => {
  const response = await adminAxiosInstance.get('/auth/profile');
  return response.data;
};

// Dashboard
export const getDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await adminAxiosInstance.get('/admin/stats');
  return response.data;
};

// User Management
export const getAllUsers = async (filters?: UserFilters): Promise<AdminUsersResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/admin/users?${params.toString()}`);
  return response.data;
};

export const getUserById = async (id: string): Promise<AdminUserResponse> => {
  const response = await adminAxiosInstance.get(`/admin/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: UpdateUserData): Promise<{ success: boolean; message: string; data: { user: any } }> => {
  const response = await adminAxiosInstance.put(`/admin/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/admin/users/${id}`);
  return response.data;
};

// Product Management (Admin)
export const getAllProductsAdmin = async (filters?: AdminProductFilters): Promise<AdminProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/admin/products?${params.toString()}`);
  return response.data;
};

export const createProduct = async (data: CreateProductData): Promise<ProductResponse> => {
  const response = await adminAxiosInstance.post('/products', data);
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<CreateProductData>): Promise<ProductResponse> => {
  const response = await adminAxiosInstance.put(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/products/${id}`);
  return response.data;
};

// Order Management (Admin)
export const getAllOrders = async (page?: number, limit?: number): Promise<OrdersResponse> => {
  const params = new URLSearchParams();
  if (page) params.append('page', page.toString());
  if (limit) params.append('limit', limit.toString());
  
  const response = await adminAxiosInstance.get(`/orders?${params.toString()}`);
  return response.data;
};

export const getOrderDetails = async (id: string): Promise<OrderResponse> => {
  const response = await adminAxiosInstance.get(`/orders/${id}`);
  return response.data;
};

export const updateOrderStatus = async (id: string, data: UpdateOrderStatusData): Promise<OrderResponse> => {
  const response = await adminAxiosInstance.put(`/admin/orders/${id}/status`, data);
  return response.data;
};

export const markOrderDelivered = async (id: string): Promise<OrderResponse> => {
  const response = await adminAxiosInstance.put(`/orders/${id}/deliver`);
  return response.data;
};

// Category Management (Admin)
export const createCategory = async (data: CreateCategoryData): Promise<{ success: boolean; message: string; data: { category: any } }> => {
  const response = await adminAxiosInstance.post('/categories', data);
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<CreateCategoryData>): Promise<{ success: boolean; message: string; data: { category: any } }> => {
  const response = await adminAxiosInstance.put(`/categories/${id}`, data);
  return response.data;
};

export const deleteCategory = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/categories/${id}`);
  return response.data;
};

export const reorderCategories = async (categories: Array<{ id: string }>): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.put('/categories/reorder', { categories });
  return response.data;
};

// Brand Management (Admin)
export const createBrand = async (data: CreateBrandData): Promise<{ success: boolean; message: string; data: { brand: any } }> => {
  const response = await adminAxiosInstance.post('/brands', data);
  return response.data;
};

export const updateBrand = async (id: string, data: Partial<CreateBrandData>): Promise<{ success: boolean; message: string; data: { brand: any } }> => {
  const response = await adminAxiosInstance.put(`/brands/${id}`, data);
  return response.data;
};

export const deleteBrand = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/brands/${id}`);
  return response.data;
};

// Banner Management
export const getAllBanners = async (filters?: BannerFilters): Promise<AdminBannersResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });
  }
  
  const response = await adminAxiosInstance.get(`/admin/banners?${params.toString()}`);
  return response.data;
};

export const createBanner = async (data: CreateBannerData): Promise<BannerResponse> => {
  const response = await adminAxiosInstance.post('/admin/banners', data);
  return response.data;
};

export const updateBanner = async (id: string, data: Partial<CreateBannerData>): Promise<BannerResponse> => {
  const response = await adminAxiosInstance.put(`/admin/banners/${id}`, data);
  return response.data;
};

export const deleteBanner = async (id: string): Promise<AdminResponse> => {
  const response = await adminAxiosInstance.delete(`/admin/banners/${id}`);
  return response.data;
};