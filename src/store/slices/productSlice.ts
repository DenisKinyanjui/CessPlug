import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  inStock: boolean;
  isNew?: boolean;
  discount?: number;
  tags?: string[];
}

interface ProductState {
  products: Product[];
  categories: string[];
  brands: string[];
  searchQuery: string;
  filters: {
    category: string;
    brand: string;
    priceRange: [number, number];
    rating: number;
  };
  loading: boolean;
}

const initialState: ProductState = {
  products: [],
  categories: [],
  brands: [],
  searchQuery: '',
  filters: {
    category: '',
    brand: '',
    priceRange: [0, 10000],
    rating: 0,
  },
  loading: false,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setProducts: (state, action: PayloadAction<Product[]>) => {
      state.products = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<ProductState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setCategories: (state, action: PayloadAction<string[]>) => {
      state.categories = action.payload;
    },
    setBrands: (state, action: PayloadAction<string[]>) => {
      state.brands = action.payload;
    },
  },
});

export const { setProducts, setSearchQuery, setFilters, setCategories, setBrands } = productSlice.actions;
export default productSlice.reducer;