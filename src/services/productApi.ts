import axiosInstance from '../utils/axiosInstance';
import axios from 'axios';
import { ProductFilters, ProductsResponse, ProductResponse, CreateProductData } from '../types/Product';

export interface SpecsResponse {
  success: boolean;
  data: {
    specs: Array<{
      name: string;
      values: string[];
      count?: number; // Optional: number of products with this spec
    }>;
  };
}

export interface SpecValuesResponse {
  success: boolean;
  data: {
    specName: string;
    values: Array<{
      value: string;
      count: number; // Number of products with this spec value
    }>;
  };
}

export interface BrandsResponse {
  success: boolean;
  data: {
    brands: Array<{
      _id: string;
      name: string;
      slug: string;
      logo?: string;
      productCount: number;
    }>;
  };
}

export interface PriceRangeResponse {
  success: boolean;
  data: {
    minPrice: number;
    maxPrice: number;
  };
}

/**
 * Enhanced getAllProducts function that supports all filtering requirements
 */
export const getAllProducts = async (filters?: ProductFilters & Record<string, any>): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        // Handle array values (for multi-select filters)
        if (Array.isArray(value)) {
          params.append(key, value.join(','));
        } else {
          params.append(key, value.toString());
        }
      }
    });
  }
  
  const response = await axiosInstance.get(`/products?${params.toString()}`);
  return response.data;
};

/**
 * Get product by slug
 */
export const getProductBySlug = async (slug: string): Promise<ProductResponse> => {
  const response = await axiosInstance.get(`/products/slug/${slug}`);
  return response.data;
};

/**
 * Create new product
 */
export const createProduct = async (data: CreateProductData): Promise<ProductResponse> => {
  const response = await axiosInstance.post('/products', data);
  return response.data;
};

/**
 * Update existing product
 */
export const updateProduct = async (id: string, data: Partial<CreateProductData>): Promise<ProductResponse> => {
  const response = await axiosInstance.put(`/products/${id}`, data);
  return response.data;
};

/**
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await axiosInstance.delete(`/products/${id}`);
  return response.data;
};

/**
 * Enhanced search products function
 */
export const searchProducts = async (
  query: string, 
  filters?: Omit<ProductFilters, 'search'> & Record<string, any>
): Promise<ProductsResponse> => {
  const searchFilters = { ...filters, search: query };
  return getAllProducts(searchFilters);
};

/**
 * Get products by category with enhanced filtering
 */
export const getProductsByCategory = async (
  categoryId: string, 
  filters?: Omit<ProductFilters, 'category'> & Record<string, any>
): Promise<ProductsResponse> => {
  const categoryFilters = { ...filters, category: categoryId };
  return getAllProducts(categoryFilters);
};

/**
 * Get products by brand with enhanced filtering
 */
export const getProductsByBrand = async (
  brandId: string, 
  filters?: Omit<ProductFilters, 'brand'> & Record<string, any>
): Promise<ProductsResponse> => {
  const brandFilters = { ...filters, brand: brandId };
  return getAllProducts(brandFilters);
};

/**
 * Get flash deals
 */
export const getFlashDeals = async (filters?: Omit<ProductFilters, 'flashDeals'>): Promise<ProductsResponse> => {
  const flashDealFilters = { ...filters, flashDeals: true };
  return getAllProducts(flashDealFilters);
};

/**
 * Enhanced getAllSpecs function that returns all available specifications
 * for filtering, optionally filtered by category and/or brand
 */
export const getAllSpecs = async (params?: { 
  category?: string; 
  brand?: string; 
  includeCount?: boolean;
  activeOnly?: boolean;
  productIds?: string[]; // New parameter for filtering by specific products
}): Promise<SpecsResponse> => {
  const queryParams = new URLSearchParams();
  
  // Only add parameters if they are valid and non-empty
  if (params?.category && params.category.trim() !== '') {
    queryParams.append('category', params.category.trim());
  }
  
  if (params?.brand && params.brand.trim() !== '') {
    queryParams.append('brand', params.brand.trim());
  }

  if (params?.includeCount !== undefined) {
    queryParams.append('includeCount', params.includeCount.toString());
  }

  if (params?.activeOnly !== undefined) {
    queryParams.append('activeOnly', params.activeOnly.toString());
  }

  // Add product IDs if provided
  if (params?.productIds && params.productIds.length > 0) {
    queryParams.append('productIds', params.productIds.join(','));
  }
  
  try {
    const url = `/products/specs${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    console.log('Making request to:', url); // Debug log
    
    const response = await axiosInstance.get(url);
    return response.data;
  } catch (error) {
    console.error('Error in getAllSpecs API call:', error);

    if (axios.isAxiosError(error)) {
      console.error('Response status:', error.response?.status);
      console.error('Response data:', error.response?.data);
    }

    throw error;
  }
};

/**
 * Get specific spec values with product counts
 */
export const getSpecValues = async (
  specName: string, 
  params?: { 
    category?: string; 
    brand?: string; 
    includeCount?: boolean;
    activeOnly?: boolean;
  }
): Promise<SpecValuesResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.category) {
    queryParams.append('category', params.category);
  }
  
  if (params?.brand) {
    queryParams.append('brand', params.brand);
  }

  if (params?.includeCount !== undefined) {
    queryParams.append('includeCount', params.includeCount.toString());
  }

  if (params?.activeOnly !== undefined) {
    queryParams.append('activeOnly', params.activeOnly.toString());
  }
  
  const response = await axiosInstance.get(`/products/specs/${encodeURIComponent(specName)}?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get all brands with product counts
 */
export const getAllBrands = async (params?: {
  category?: string;
  activeOnly?: boolean;
  productIds?: string[]; // New parameter for filtering by specific products
}): Promise<BrandsResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.category) {
    queryParams.append('category', params.category);
  }

  if (params?.activeOnly !== undefined) {
    queryParams.append('activeOnly', params.activeOnly.toString());
  }

  // Add product IDs if provided
  if (params?.productIds && params.productIds.length > 0) {
    queryParams.append('productIds', params.productIds.join(','));
  }
  
  const response = await axiosInstance.get(`/products/brands?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get price range for products (useful for price slider)
 */
export const getPriceRange = async (params?: {
  category?: string;
  brand?: string;
  activeOnly?: boolean;
}): Promise<PriceRangeResponse> => {
  const queryParams = new URLSearchParams();
  
  if (params?.category) {
    queryParams.append('category', params.category);
  }
  
  if (params?.brand) {
    queryParams.append('brand', params.brand);
  }

  if (params?.activeOnly !== undefined) {
    queryParams.append('activeOnly', params.activeOnly.toString());
  }
  
  const response = await axiosInstance.get(`/products/price-range?${queryParams.toString()}`);
  return response.data;
};

/**
 * Get products with advanced filtering and sorting options
 */
export const getAdvancedProducts = async (options: {
  // Basic filters
  search?: string;
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  
  // Availability filters
  inStock?: boolean;
  flashDeals?: boolean;
  newArrivals?: boolean;
  
  // Rating filter
  minRating?: number;
  
  // Dynamic spec filters
  specs?: Record<string, string | string[]>;
  
  // Sorting and pagination
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name' | 'popularity';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
  
  // Additional options
  activeOnly?: boolean;
}): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  
  // Add basic filters
  if (options.search) params.append('search', options.search);
  if (options.category) params.append('category', options.category);
  if (options.brand) params.append('brand', options.brand);
  if (options.minPrice !== undefined) params.append('minPrice', options.minPrice.toString());
  if (options.maxPrice !== undefined) params.append('maxPrice', options.maxPrice.toString());
  
  // Add availability filters
  if (options.inStock !== undefined) params.append('inStock', options.inStock.toString());
  if (options.flashDeals !== undefined) params.append('flashDeals', options.flashDeals.toString());
  if (options.newArrivals !== undefined) params.append('newArrivals', options.newArrivals.toString());
  
  // Add rating filter
  if (options.minRating !== undefined) params.append('minRating', options.minRating.toString());
  
  // Add dynamic spec filters
  if (options.specs) {
    Object.entries(options.specs).forEach(([specName, value]) => {
      if (Array.isArray(value)) {
        params.append(specName, value.join(','));
      } else {
        params.append(specName, value);
      }
    });
  }
  
  // Add sorting and pagination
  if (options.sortBy) params.append('sortBy', options.sortBy);
  if (options.sortOrder) params.append('sortOrder', options.sortOrder);
  if (options.page) params.append('page', options.page.toString());
  if (options.limit) params.append('limit', options.limit.toString());
  
  // Add additional options
  if (options.activeOnly !== undefined) params.append('activeOnly', options.activeOnly.toString());
  
  const response = await axiosInstance.get(`/products/advanced?${params.toString()}`);
  return response.data;
};

/**
 * Get related products
 */
export const getRelatedProducts = async (
  productId: string,
  limit?: number
): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  
  const response = await axiosInstance.get(`/products/${productId}/related?${params.toString()}`);
  return response.data;
};

/**
 * Get featured products
 */
export const getFeaturedProducts = async (limit?: number): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  
  const response = await axiosInstance.get(`/products/featured?${params.toString()}`);
  return response.data;
};

/**
 * Get new arrival products
 */
export const getNewArrivals = async (limit?: number): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  
  const response = await axiosInstance.get(`/products/new-arrivals?${params.toString()}`);
  return response.data;
};

/**
 * Get popular products (based on views, purchases, etc.)
 */
export const getPopularProducts = async (limit?: number): Promise<ProductsResponse> => {
  const params = new URLSearchParams();
  if (limit) params.append('limit', limit.toString());
  
  const response = await axiosInstance.get(`/products/popular?${params.toString()}`);
  return response.data;
};