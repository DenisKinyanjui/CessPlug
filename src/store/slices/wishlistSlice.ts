import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface WishlistItem {
  _id: string;
  name: string;
  price: number;
  image: string;
  stock: number;
}

interface WishlistState {
  items: WishlistItem[];
}

const initialState: WishlistState = {
  items: []
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    // Add item to wishlist
    addToWishlist: (state, action: PayloadAction<WishlistItem>) => {
      const exists = state.items.find(item => item._id === action.payload._id);
      if (!exists) {
        state.items.push(action.payload);
      }
    },

    // Remove item from wishlist
    removeFromWishlist: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(item => item._id !== action.payload);
    },

    // Clear entire wishlist
    clearWishlist: (state) => {
      state.items = [];
    },

    // Load wishlist from localStorage
    loadWishlist: (state, action: PayloadAction<WishlistItem[]>) => {
      state.items = action.payload;
    }
  }
});

export const {
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
  loadWishlist
} = wishlistSlice.actions;

// Selector to check if item is in wishlist
export const selectIsInWishlist = (items: WishlistItem[], itemId: string) => {
  return items.some(item => item._id === itemId);
};

export default wishlistSlice.reducer;
