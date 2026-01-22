// src/hooks/useFilterOptions.ts
import { useMemo } from 'react';
import { Product } from '../types/Product';

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo?: string;
  productCount: number;
}

export interface SpecOption {
  name: string;
  values: Array<{
    value: string;
    count: number;
  }>;
}

export interface FilterOptions {
  brands: Brand[];
  specs: SpecOption[];
  priceRange: {
    min: number;
    max: number;
  };
}

/**
 * Custom hook to extract filter options from products
 * This hook memoizes the results to avoid recalculation unless products change
 */
export const useFilterOptions = (products: Product[]): FilterOptions => {
  return useMemo(() => {
    if (products.length === 0) {
      return {
        brands: [],
        specs: [],
        priceRange: { min: 0, max: 1000000 }
      };
    }

    // Extract unique brands with counts
    const brandMap = new Map<string, Brand>();
    
    // FIXED: Extract unique specifications with counts - handle exact string values
    const specMap = new Map<string, Map<string, number>>();
    
    // Track price range
    let minPrice = Infinity;
    let maxPrice = -Infinity;

    products.forEach(product => {
      // Process price range - handle both regular price and flash deal prices
      let productPrice = typeof product.price === 'number' ? product.price : 0;
      
      // If it's a flash deal, use the flash price instead
      if (product.isFlashDeal && product.flashPrice && typeof product.flashPrice === 'number') {
        productPrice = product.flashPrice;
      }
      
      // Also consider finalPrice if available
      if (product.finalPrice && typeof product.finalPrice === 'number') {
        productPrice = Math.min(productPrice, product.finalPrice);
      }
      
      if (productPrice > 0) {
        minPrice = Math.min(minPrice, productPrice);
        maxPrice = Math.max(maxPrice, productPrice);
      }

      // Process brands
      if (product.brand) {
        const brandKey = typeof product.brand === 'string' ? product.brand : product.brand._id;
        const brandName = typeof product.brand === 'string' ? product.brand : product.brand.name;
        const brandSlug = typeof product.brand === 'string' ? product.brand : product.brand.slug;
        
        if (brandMap.has(brandKey)) {
          const existingBrand = brandMap.get(brandKey)!;
          existingBrand.productCount += 1;
        } else {
          brandMap.set(brandKey, {
            _id: brandKey,
            name: brandName || brandKey,
            slug: brandSlug || brandKey,
            logo: (typeof product.brand === 'object' && product.brand.logo) ? product.brand.logo : undefined,
            productCount: 1
          });
        }
      }

      // FIXED: Process specifications - treat each value as an exact string
      if (product.specifications && Array.isArray(product.specifications)) {
        product.specifications.forEach(spec => {
          if (spec.name && spec.value && spec.value.trim() !== '') {
            const specName = spec.name.trim();
            // FIXED: Use exact string value without any modification or splitting
            const specValue = spec.value; // Keep original value exactly as is
            
            if (!specMap.has(specName)) {
              specMap.set(specName, new Map());
            }
            const valueMap = specMap.get(specName)!;
            const currentCount = valueMap.get(specValue) || 0;
            valueMap.set(specValue, currentCount + 1);
          }
        });
      }
    });

    // Convert maps to arrays and sort
    const brands = Array.from(brandMap.values())
      .filter(brand => brand.productCount > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    // FIXED: Convert spec map to array format with exact string preservation
    const specs = Array.from(specMap.entries())
      .map(([name, valueMap]) => ({
        name,
        values: Array.from(valueMap.entries())
          .map(([value, count]) => ({ value, count }))
          .filter(item => item.count > 0)
          // FIXED: Sort values as strings without any modification
          .sort((a, b) => a.value.localeCompare(b.value))
      }))
      .filter(spec => spec.values.length > 0)
      .sort((a, b) => a.name.localeCompare(b.name));

    // Handle edge cases for price range with better defaults
    const finalPriceRange = {
      min: minPrice === Infinity ? 0 : Math.floor(minPrice),
      max: maxPrice === -Infinity ? 1000000 : Math.ceil(maxPrice)
    };

    // Ensure min is never equal to max
    if (finalPriceRange.min === finalPriceRange.max) {
      if (finalPriceRange.min === 0) {
        finalPriceRange.max = 1000000;
      } else {
        finalPriceRange.min = Math.max(0, finalPriceRange.max - 100);
      }
    }

    const result = {
      brands,
      specs,
      priceRange: finalPriceRange
    };

    return result;
  }, [products]);
};