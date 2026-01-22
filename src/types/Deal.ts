import { Product } from './Product';

export interface FlashDeal {
  flashPrice: any;
  _id: string;
  product: Product;
  discount: number;
  flashEndsAt: string;
  isFlashDeal: true;
  createdAt: string;
  updatedAt: string;
}

export interface FlashDealsResponse {
  success: boolean;
  data: {
    flashDeals: FlashDeal[];
  };
}

export interface CreateFlashDealData {
  productId: string;
  discount: number;
  endsAt: string;
}