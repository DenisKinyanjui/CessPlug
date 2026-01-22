export interface Review {
  _id: string;
  product: string;
  user: {
    _id: string;
    name: string;
    avatar?: string;
  };
  name: string;
  rating: number;
  comment: string;
  title?: string;
  verified: boolean;
  helpful: number;
  createdAt: string;
  updatedAt: string;
}

export interface ReviewsResponse {
  success: boolean;
  data: {
    reviews: Review[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface CreateReviewData {
  rating: number;
  comment: string;
  title?: string;
}

export interface CanReviewResponse {
  success: boolean;
  canReview: boolean;
  reason?: 'purchase_required' | 'already_reviewed';
}