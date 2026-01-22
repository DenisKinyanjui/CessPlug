// src/services/searchApi.ts
export interface SearchSuggestion {
  _id: string;
  name: string;
  slug: string;
  category?: {
    _id: string;
    name: string;
    slug: string;
  };
  brand?: {
    _id: string;
    name: string;
    slug: string;
  };
  price: number;
  images: string[];
}

export interface SearchResponse {
  success: boolean;
  data: {
    products: SearchSuggestion[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

/**
 * Search for products with autocomplete suggestions
 */
export const searchProducts = async (
  query: string,
  options: {
    limit?: number;
    signal?: AbortSignal;
  } = {}
): Promise<SearchResponse> => {
  const { limit = 8, signal } = options;
  
  const params = new URLSearchParams({
    search: query,
    limit: limit.toString(),
    activeOnly: 'true', // Only return active products for suggestions
  });

  const response = await fetch(`/api/products?${params}`, {
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`Search failed: ${response.statusText}`);
  }

  return response.json();
};

/**
 * Get popular search terms (you can implement this later)
 */
export const getPopularSearches = async (): Promise<string[]> => {
  // This would be implemented based on your analytics or popular searches
  // For now, return some default popular searches
  return [
    'iPhone',
    'Samsung Galaxy',
    'MacBook',
    'AirPods',
    'Gaming Laptop',
  ];
};