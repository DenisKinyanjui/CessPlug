import { useState, useEffect, useCallback } from 'react';
import { getAllProducts, getAllSpecs } from '../services/productApi';
import { Product, ProductFilters } from '../types/Product';

interface FilterSpec {
  name: string;
  values: string[];
}

interface UseProductsOptions {
  initialFilters?: ProductFilters;
  autoFetch?: boolean;
}

interface UseProductsReturn {
  products: Product[];
  filterSpecs: FilterSpec[];
  loading: boolean;
  specsLoading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  fetchProducts: (filters?: ProductFilters) => Promise<void>;
  fetchFilterSpecs: (params?: { category?: string; brand?: string }) => Promise<void>;
  refetch: () => Promise<void>;
}

export const useProducts = (options: UseProductsOptions = {}): UseProductsReturn => {
  const { initialFilters, autoFetch = true } = options;

  const [products, setProducts] = useState<Product[]>([]);
  const [filterSpecs, setFilterSpecs] = useState<FilterSpec[]>([]);
  const [loading, setLoading] = useState(false);
  const [specsLoading, setSpecsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [currentFilters, setCurrentFilters] = useState<ProductFilters>(initialFilters || {});

  const fetchProducts = useCallback(async (filters: ProductFilters = currentFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllProducts(filters);
      setProducts(response.data.products);
      setPagination(response.data.pagination);
      setCurrentFilters(filters);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load products';
      setError(errorMessage);
      setProducts([]);
      setPagination(null);
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  }, [currentFilters]);

  const fetchFilterSpecs = useCallback(async (params?: { category?: string; brand?: string }) => {
    if (!params?.category && !params?.brand) return;

    setSpecsLoading(true);
    try {
      const response = await getAllSpecs(params);
      setFilterSpecs(response.data.specs);
    } catch (err) {
      console.error('Error fetching filter specs:', err);
      setFilterSpecs([]);
    } finally {
      setSpecsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    await fetchProducts(currentFilters);
  }, [fetchProducts, currentFilters]);

  useEffect(() => {
    if (autoFetch) {
      fetchProducts(initialFilters);
    }
  }, [autoFetch, initialFilters, fetchProducts]);

  return {
    products,
    filterSpecs,
    loading,
    specsLoading,
    error,
    pagination,
    fetchProducts,
    fetchFilterSpecs,
    refetch,
  };
};