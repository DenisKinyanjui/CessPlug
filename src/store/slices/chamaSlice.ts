import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChamaGroup {
  _id: string;
  name: string;
  description: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  weeklyContribution: number;
  currentWeek: number;
  currentTurnPosition: number;
  members: Array<{ userId: string; position: number; name?: string }>;
  userPosition?: number;
  joinedAt?: string;
}

interface ChamaEligibility {
  eligible: boolean;
  reason: string;
  maxRedemptionAmount?: number;
  userPosition?: number;
}

interface ChamaState {
  myChamas: ChamaGroup[];
  selectedChama: ChamaGroup | null;
  eligibility: ChamaEligibility | null;
  loading: boolean;
  error: string | null;
}

const initialState: ChamaState = {
  myChamas: [],
  selectedChama: null,
  eligibility: null,
  loading: false,
  error: null
};

const chamaSlice = createSlice({
  name: 'chama',
  initialState,
  reducers: {
    // Set user's chama groups
    setMyChamas: (state, action: PayloadAction<ChamaGroup[]>) => {
      state.myChamas = action.payload;
      state.error = null;
    },

    // Set selected chama group
    setSelectedChama: (state, action: PayloadAction<ChamaGroup | null>) => {
      state.selectedChama = action.payload;
    },

    // Set eligibility status
    setEligibility: (state, action: PayloadAction<ChamaEligibility>) => {
      state.eligibility = action.payload;
    },

    // Clear eligibility when navigating away
    clearEligibility: (state) => {
      state.eligibility = null;
    },

    // Set loading state
    setChamaLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },

    // Set error
    setChamaError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },

    // Clear chama state (on logout)
    clearChama: (state) => {
      state.myChamas = [];
      state.selectedChama = null;
      state.eligibility = null;
      state.error = null;
    }
  }
});

export const {
  setMyChamas,
  setSelectedChama,
  setEligibility,
  clearEligibility,
  setChamaLoading,
  setChamaError,
  clearChama
} = chamaSlice.actions;

export default chamaSlice.reducer;
