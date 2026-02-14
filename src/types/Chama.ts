/**
 * Chama (Group-Based Rotating Purchase) Type Definitions
 * Defines all TypeScript interfaces for chama functionality
 */

export interface ChamaMember {
  _id: string;
  userId: string;
  userName: string;
  userPhone: string;
  userEmail: string;
  position: number; // Position in rotation (1-10)
  status: "active" | "defaulter" | "removed";
  joinedAt: string;
  turn?: number; // Current turn number (1-10)
}

export interface ChamaGroup {
  _id: string;
  name: string;
  description: string;
  weeklyContribution: number; // Amount each member contributes weekly
  totalWeeks: number; // Total weeks in rotation (usually 10)
  currentWeek: number; // Current week of rotation
  members: ChamaMember[];
  status: "draft" | "active" | "completed";
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChamaEligibility {
  isEligible: boolean;
  maxAmount: number; // Maximum amount user can redeem
  groupName: string;
  groupId: string;
  currentWeek: number;
  totalWeeks: number;
  userPosition: number;
  reasons?: string[]; // Reasons for ineligibility
  ineligibilityReason?: string; // User-friendly message
}

export interface ChamaContribution {
  _id: string;
  chamaGroupId: string;
  userId: string;
  week: number;
  amount: number;
  paymentMethod: "mpesa" | "cod" | "bank_transfer";
  paymentStatus: "pending" | "completed" | "failed";
  transactionReference?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ChamaRedemption {
  _id: string;
  chamaGroupId: string;
  userId: string;
  orderId: string; // Reference to order placed
  week: number;
  amount: number;
  paymentMethod: "chama_credit" | "hybrid"; // Chama credit + other payment
  chamaAmount: number; // Amount paid from chama credit
  additionalPaymentAmount?: number; // Additional amount paid via M-Pesa/COD
  additionalPaymentMethod?: "mpesa" | "cod";
  status: "completed" | "cancelled";
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  addedAt: string;
}

export interface ChamaCheckoutContext {
  useChamaCredit: boolean;
  chamaGroupId?: string;
  chamaMaxAmount?: number;
  chamaGroupName?: string;
  isChamaEligible: boolean;
  ineligibilityReason?: string;
}

/**
 * API Response Types
 */

export interface GetMyCharamasResponse {
  success: boolean;
  message: string;
  data: ChamaGroup[];
}

export interface GetChamaByIdResponse {
  success: boolean;
  message: string;
  data: ChamaGroup;
}

export interface CheckChamaEligibilityResponse {
  success: boolean;
  message: string;
  data: ChamaEligibility;
}

export interface GetChamaRedemptionHistoryResponse {
  success: boolean;
  message: string;
  data: ChamaRedemption[];
}
