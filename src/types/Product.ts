export interface Product {
  originalPrice: any;
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discount: number;
  finalPrice: number; // Calculated field (price - discount)
  images: string[];
  brand: {
    _id: string;
    name: string;
    slug: string;
    logo?: string;
  };
  category: {
    _id: string;
    name: string;
    slug: string;
  };
  stock: number;
  rating: number;
  numReviews: number;
  isFlashDeal: boolean;
  flashPrice?: number; // Price during flash deal
  flashEndsAt?: string;
  isNewArrival: boolean;
  isFeatured?: boolean;
  specifications?: {
    name: string;
    key: string;
    value: string;
  }[];
  features?: string[];
  isActive?: boolean;
  views?: number; // For popularity tracking
  purchases?: number; // For popularity tracking
  createdAt: string;
  updatedAt: string;
}

// Enhanced ProductFilters interface to support all filtering requirements
export interface ProductFilters {
  // Text search
  search?: string;
  
  // Category and brand filters
  category?: string;
  brand?: string;
  
  // Price filters
  minPrice?: number;
  maxPrice?: number;
  
  // Availability filters
  inStock?: boolean;
  flashDeals?: boolean;
  newArrivals?: boolean;
  featured?: boolean;
  
  // Rating filter
  minRating?: number;
  
  // Sorting options
  sortBy?: 'price' | 'rating' | 'createdAt' | 'name' | 'popularity' | 'newest' | 'price_low' | 'price_high';
  sortOrder?: 'asc' | 'desc';
  
  // Pagination
  page?: number;
  limit?: number;
  
  // Additional options
  activeOnly?: boolean;
  
  // Dynamic specification filters (e.g., ram: "8GB", storage: "256GB")
  // These will be handled as additional properties
  [key: string]: any;
}

// Enhanced ProductsResponse with additional metadata
export interface ProductsResponse {
  success: boolean;
  data: {
    products: Product[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
    filters?: {
      appliedFilters: Record<string, any>;
      availableFilters: {
        categories: Array<{
          _id: string;
          name: string;
          slug: string;
          productCount: number;
        }>;
        brands: Array<{
          _id: string;
          name: string;
          slug: string;
          productCount: number;
        }>;
        priceRange: {
          min: number;
          max: number;
        };
        specs: Array<{
          name: string;
          values: Array<{
            value: string;
            count: number;
          }>;
        }>;
      };
    };
  };
}

export interface ProductResponse {
  success: boolean;
  data: {
    product: Product;
  };
}

export interface CreateProductData {
  name: string;
  description: string;
  price: number;
  discount?: number;
  images: string[];
  brand: string;
  category: string;
  stock: number;
  specifications?: {
    key: string;
    value: string;
  }[];
  features?: string[];
  isFlashDeal?: boolean;
  flashPrice?: number;
  flashEndsAt?: string;
  isNewArrival?: boolean;
  isFeatured?: boolean;
}

// Specification-related interfaces
export interface ProductSpecification {
  key: string;
  value: string;
  displayName?: string; // User-friendly name for the spec
  unit?: string; // Unit of measurement (GB, MHz, etc.)
  isFilterable?: boolean; // Whether this spec should appear in filters
  order?: number; // Display order in filters
}

// Enhanced product with computed fields
export interface ProductWithComputedFields extends Product {
  finalPrice: number;
  discountPercentage: number;
  isInStock: boolean;
  isOnSale: boolean;
  popularityScore: number;
}

// Search result interface
export interface ProductSearchResult {
  products: Product[];
  total: number;
  suggestions?: string[];
  corrections?: string[];
  facets: {
    categories: Array<{ name: string; count: number; slug: string }>;
    brands: Array<{ name: string; count: number; slug: string }>;
    priceRanges: Array<{ range: string; count: number; min: number; max: number }>;
    specifications: Record<string, Array<{ value: string; count: number }>>;
  };
}

// Advanced filter options
export interface AdvancedProductFilters extends ProductFilters {
  // Price range options
  priceRanges?: Array<{
    label: string;
    min: number;
    max: number;
  }>;
  
  // Rating range
  ratingRange?: {
    min: number;
    max: number;
  };
  
  // Availability options
  availability?: 'all' | 'inStock' | 'outOfStock' | 'lowStock';
  
  // Date range filters
  dateRange?: {
    field: 'createdAt' | 'updatedAt';
    from?: string;
    to?: string;
  };
  
  // Specification filters with operators
  specFilters?: Array<{
    key: string;
    value: string | string[];
    operator: 'equals' | 'contains' | 'in' | 'range';
  }>;
}

// Filter metadata for UI
export interface FilterMetadata {
  categories: Array<{
    _id: string;
    name: string;
    slug: string;
    productCount: number;
    children?: FilterMetadata['categories'];
  }>;
  brands: Array<{
    _id: string;
    name: string;
    slug: string;
    logo?: string;
    productCount: number;
  }>;
  specifications: Array<{
    key: string;
    displayName: string;
    type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect' | 'range';
    values: Array<{
      value: string;
      displayName: string;
      count: number;
    }>;
    unit?: string;
    min?: number;
    max?: number;
  }>;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  ratingRange: {
    min: number;
    max: number;
  };
}

// Sorting options for UI
export interface SortOption {
  value: string;
  label: string;
  field: string;
  order: 'asc' | 'desc';
}

export const SORT_OPTIONS: SortOption[] = [
  { value: 'newest', label: 'Newest First', field: 'createdAt', order: 'desc' },
  { value: 'oldest', label: 'Oldest First', field: 'createdAt', order: 'asc' },
  { value: 'price_low', label: 'Price: Low to High', field: 'finalPrice', order: 'asc' },
  { value: 'price_high', label: 'Price: High to Low', field: 'finalPrice', order: 'desc' },
  { value: 'rating', label: 'Highest Rated', field: 'rating', order: 'desc' },
  { value: 'popularity', label: 'Most Popular', field: 'popularityScore', order: 'desc' },
  { value: 'name_asc', label: 'Name: A to Z', field: 'name', order: 'asc' },
  { value: 'name_desc', label: 'Name: Z to A', field: 'name', order: 'desc' },
  { value: 'discount', label: 'Highest Discount', field: 'discount', order: 'desc' },
];

// Product list view configurations
export type ProductViewMode = 'grid' | 'list' | 'compact';

export interface ProductListConfig {
  viewMode: ProductViewMode;
  itemsPerPage: number;
  showFilters: boolean;
  showSorting: boolean;
  showPagination: boolean;
  enableInfiniteScroll?: boolean;
}

// Product card display options
export interface ProductCardConfig {
  showRating: boolean;
  showReviews: boolean;
  showBrand: boolean;
  showCategory: boolean;
  showDiscount: boolean;
  showStock: boolean;
  showQuickView: boolean;
  showWishlist: boolean;
  showCompare: boolean;
  imageAspectRatio: 'square' | '4:3' | '16:9' | 'auto';
}