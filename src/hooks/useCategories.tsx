import { useState, useEffect } from 'react';
import { getAllCategories } from '../services/categoryApi';
import { Category } from '../types/Category';

export interface NavigationCategory {
  _id: string;
  name: string;
  slug: string;
  hasSubcategories: boolean;
  subcategories: Category[];
}

interface UseCategoriesReturn {
  categories: NavigationCategory[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useCategories = (): UseCategoriesReturn => {
  const [categories, setCategories] = useState<NavigationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

// Update the organizeCategories function in useCategories.tsx
const organizeCategories = (categoryList: Category[]): NavigationCategory[] => {
  // Filter only active categories
  const activeCategories = categoryList.filter(cat => cat.isActive);
  
  // Get parent categories (categories without parent) and sort them by order
  const parentCategories = activeCategories
    .filter(cat => !cat.parent)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  
  // For each parent category, find its subcategories and sort them by order
  const organized = parentCategories.map(parent => {
    const subcategories = activeCategories
      .filter(cat => cat.parent && cat.parent._id === parent._id)
      .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
    
    return {
      _id: parent._id,
      name: parent.name,
      slug: parent.slug,
      hasSubcategories: subcategories.length > 0,
      subcategories: subcategories
    };
  });

  return organized;
};

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getAllCategories();
      
      if (response.success) {
        const organizedCategories = organizeCategories(response.data.categories);
        setCategories(organizedCategories);
      } else {
        throw new Error('Failed to fetch categories');
      }
    } catch (err: any) {
      console.error('Failed to fetch categories:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Failed to load categories';
      setError(errorMessage);
      setCategories([]); // Reset categories on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch categories on hook initialization
  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    refetch: fetchCategories
  };
};