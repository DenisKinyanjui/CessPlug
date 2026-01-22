import { User } from './User';
import { Product } from './Product';
import { Order } from './Order';
import { Review } from './Review';

// Admin Dashboard Stats
export interface AdminStats {
  totalUsers: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
}

export interface MonthlyRevenue {
  _id: {
    year: number;
    month: number;
  };
  revenue: number;
  orders: number;
}

export interface DashboardData {
  stats: AdminStats;
  recentOrders: Order[];
  topProducts: Product[];
  monthlyRevenue: MonthlyRevenue[];
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

// Admin User Management
export interface AdminUser extends User {
  orders?: Order[];
  reviews?: Review[];
}

export interface AdminUsersResponse {
  success: boolean;
  data: {
    users: User[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AdminUserResponse {
  success: boolean;
  data: {
    user: AdminUser;
    orders: Order[];
    reviews: Review[];
  };
}

export interface UserFilters {
  search?: string;
  role?: 'admin' | 'customer';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  role?: 'admin' | 'customer';
  isActive?: boolean;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
}

// Admin Product Management
export interface AdminProduct extends Product {
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
}

export interface AdminProductsResponse {
  success: boolean;
  data: {
    products: AdminProduct[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface AdminProductFilters {
  search?: string;
  category?: string;
  brand?: string;
  isActive?: boolean;
  lowStock?: boolean;
  sortBy?: 'name' | 'price_low' | 'price_high' | 'stock' | 'rating';
  page?: number;
  limit?: number;
}

// Admin Order Management
export interface UpdateOrderStatusData {
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  trackingNumber?: string;
}

// Admin Banner Management
export interface Banner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText: string;
  position: 'hero' | 'category' | 'promotion' | 'footer';
  isActive: boolean;
  startDate: string;
  endDate?: string;
  priority: number;
  createdBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BannersResponse {
  success: boolean;
  data: {
    banners: Banner[];
  };
}

export interface AdminBannersResponse {
  success: boolean;
  data: {
    banners: Banner[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CreateBannerData {
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText?: string;
  position: 'hero' | 'category' | 'promotion' | 'footer';
  startDate?: string;
  endDate?: string;
  priority?: number;
}

export interface BannerFilters {
  position?: 'hero' | 'category' | 'promotion' | 'footer';
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface BannerResponse {
  success: boolean;
  message: string;
  data: {
    banner: Banner;
  };
}

// Admin API Response Types
export interface AdminResponse {
  success: boolean;
  message: string;
}

export interface AdminErrorResponse {
  success: false;
  message: string;
  error?: string;
}