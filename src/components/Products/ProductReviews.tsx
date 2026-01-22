import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Star, User, Calendar, MessageSquare, Send, ShoppingBag, Lock } from 'lucide-react';
import * as reviewApi from '../../services/reviewApi';
import { Review } from '../../types/Review';
import { useAuth } from '../../contexts/AuthContext';

interface ProductReviewsProps {
  productId: string;
  averageRating: number;
  totalReviews: number;
  onReviewsUpdate?: (newRating: number, newTotal: number) => void;
}

const ProductReviews: React.FC<ProductReviewsProps> = ({ 
  productId, 
  averageRating: initialRating, 
  totalReviews: initialTotal,
  onReviewsUpdate 
}) => {
  const { isAuthenticated, user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [canReview, setCanReview] = useState<boolean | null>(null);
  const [reviewRestrictionReason, setReviewRestrictionReason] = useState<string | null>(null);
  const [isCheckingReviewEligibility, setIsCheckingReviewEligibility] = useState(false);
  const [newReview, setNewReview] = useState({
    rating: 0,
    comment: '',
    title: ''
  });
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0
  });
  const [averageRating, setAverageRating] = useState(initialRating);
  const [totalReviews, setTotalReviews] = useState(initialTotal);

  useEffect(() => {
    fetchReviews();
  }, [productId, pagination.page]);

  useEffect(() => {
    if (isAuthenticated) {
      checkReviewEligibility();
    }
  }, [productId, isAuthenticated]);

  const checkReviewEligibility = async () => {
    setIsCheckingReviewEligibility(true);
    try {
      const response = await reviewApi.canReviewProduct(productId);
      setCanReview(response.canReview);
      
      if (!response.canReview && response.reason) {
        switch (response.reason) {
          case 'purchase_required':
            setReviewRestrictionReason('You must purchase this product before you can review it.');
            break;
          case 'already_reviewed':
            setReviewRestrictionReason('You have already reviewed this product.');
            break;
          default:
            setReviewRestrictionReason('You cannot review this product at this time.');
        }
      } else {
        setReviewRestrictionReason(null);
      }
    } catch (err: any) {
      console.error('Error checking review eligibility:', err);
      setCanReview(false);
      setReviewRestrictionReason('Unable to verify review eligibility.');
    } finally {
      setIsCheckingReviewEligibility(false);
    }
  };

  const fetchReviews = async () => {
    setIsLoading(true);
    try {
      const response = await reviewApi.getProductReviews(productId, pagination.page, pagination.limit);
      setReviews(response.data.reviews);
      setPagination(response.data.pagination);
      
      if (response.data.reviews.length > 0) {
        const totalRating = response.data.reviews.reduce((sum, review) => sum + review.rating, 0);
        const avgRating = totalRating / response.data.reviews.length;
        setAverageRating(avgRating);
        setTotalReviews(response.data.pagination.total);
        
        if (onReviewsUpdate) {
          onReviewsUpdate(avgRating, response.data.pagination.total);
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarClick = (rating: number) => {
    setNewReview(prev => ({ ...prev, rating }));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newReview.rating || !newReview.comment.trim()) {
      setError('Please provide both a rating and a comment');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await reviewApi.createReview(productId, {
        rating: newReview.rating,
        comment: newReview.comment.trim(),
        title: newReview.title.trim() || undefined
      });

      setNewReview({ rating: 0, comment: '', title: '' });
      setShowReviewForm(false);
      await fetchReviews();
      await checkReviewEligibility(); // Recheck eligibility after submitting
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Failed to submit review. Please try again.';
      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoadMore = () => {
    if (pagination.page < pagination.pages) {
      setPagination(prev => ({ ...prev, page: prev.page + 1 }));
    }
  };

  const renderStars = (rating: number, interactive = false, size = 20) => {
    return [...Array(5)].map((_, i) => (
      <button
        key={i}
        type={interactive ? 'button' : undefined}
        onClick={interactive ? () => handleStarClick(i + 1) : undefined}
        className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}`}
        disabled={!interactive}
      >
        <Star
          size={size}
          className={`${
            i < rating 
              ? 'text-yellow-400 fill-current' 
              : interactive 
                ? 'text-gray-300 hover:text-yellow-300' 
                : 'text-gray-300'
          } transition-colors`}
        />
      </button>
    ));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (isLoading && pagination.page === 1) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                  </div>
                </div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center">
          <MessageSquare className="mr-3 text-orange-500" size={28} />
          Customer Reviews
        </h2>
      </div>

      {/* Average Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6 mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-4xl font-bold text-gray-800">
              {averageRating.toFixed(1)}
            </div>
            <div>
              <div className="flex items-center space-x-1 mb-1">
                {renderStars(averageRating)}
              </div>
              <p className="text-gray-600">
                Based on {totalReviews} review{totalReviews !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          
          {/* Rating Distribution */}
          <div className="hidden md:block">
            <div className="space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = reviews.filter(r => r.rating === star).length;
                const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                
                return (
                  <div key={star} className="flex items-center space-x-2 text-sm">
                    <span className="w-8">{star}★</span>
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-gray-600">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Write Review Section */}
      {isAuthenticated ? (
        <>
          {isCheckingReviewEligibility ? (
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
              <div className="flex items-center justify-center mb-2">
                <div className="w-5 h-5 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mr-3"></div>
                <span className="text-gray-600">Checking review eligibility...</span>
              </div>
            </div>
          ) : canReview ? (
            <button
              onClick={() => setShowReviewForm(!showReviewForm)}
              className="bg-orange-500 hover:bg-orange-600 text-white mb-4 px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
            >
              <Star size={16} />
              <span>{showReviewForm ? 'Hide Review Form' : 'Write a Review'}</span>
            </button>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-8">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  {reviewRestrictionReason?.includes('purchase') ? (
                    <ShoppingBag className="text-yellow-600" size={24} />
                  ) : (
                    <Lock className="text-yellow-600" size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Unable to Review
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    {reviewRestrictionReason || 'You cannot review this product at this time.'}
                  </p>
                  {reviewRestrictionReason?.includes('purchase') && (
                    <p className="text-yellow-600 text-sm">
                      Only verified purchasers can leave reviews to ensure authenticity and quality.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {canReview && showReviewForm && (
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Write Your Review</h3>
              
              <form onSubmit={handleSubmitReview} className="space-y-4">
                {/* Star Rating Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Rating
                  </label>
                  <div className="flex items-center space-x-1">
                    {renderStars(newReview.rating, true, 24)}
                    <span className="ml-3 text-gray-600">
                      {newReview.rating > 0 ? `${newReview.rating} out of 5 stars` : 'Click to rate'}
                    </span>
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Review
                  </label>
                  <textarea
                    value={newReview.comment}
                    onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    placeholder="Share your experience with this product..."
                    required
                    maxLength={500}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    {newReview.comment.length}/500 characters
                  </p>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                    {error}
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex items-center space-x-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || !newReview.rating || !newReview.comment.trim()}
                    className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>Submit Review</span>
                      </>
                    )}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => {
                      setShowReviewForm(false);
                      setNewReview({ rating: 0, comment: '', title: '' });
                      setError(null);
                    }}
                    className="text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </>
      ) : (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <User className="text-blue-600 mr-2" size={24} />
            <span className="text-lg font-semibold text-blue-800">Want to share your experience?</span>
          </div>
          <p className="text-blue-700 mb-4">
            Login to write a review and help other customers make informed decisions.
          </p>
          <Link
            to="/auth/login"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors inline-flex items-center space-x-2"
          >
            <User size={16} />
            <span>Login to Write a Review</span>
          </Link>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-6">
        {reviews.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-500 text-lg">No reviews yet</p>
            <p className="text-gray-400">Be the first to review this product!</p>
          </div>
        ) : (
          reviews.map((review) => (
            <div key={review._id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              {/* Review Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {review.user.avatar ? (
                      <img 
                        src={review.user.avatar} 
                        alt={review.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User size={20} className="text-gray-600" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-semibold text-gray-800">{review.user.name}</h4>
                      {review.verified && (
                        <span className="bg-green-100 text-green-600 text-xs px-2 py-1 rounded-full font-medium">
                          Verified Purchase
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 mt-1">
                      <div className="flex items-center space-x-1">
                        {renderStars(review.rating, false, 16)}
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <div className="flex items-center space-x-1 text-sm text-gray-500">
                        <Calendar size={14} />
                        <span>{formatDate(review.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Review Title */}
              {review.title && (
                <h5 className="font-semibold text-gray-800 mb-2">{review.title}</h5>
              )}

              {/* Review Content */}
              <p className="text-gray-700 leading-relaxed">{review.comment}</p>
            </div>
          ))
        )}
      </div>

      {/* Load More Button */}
      {reviews.length > 0 && pagination.page < pagination.pages && (
        <div className="text-center mt-8">
          <button 
            onClick={handleLoadMore}
            disabled={isLoading}
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Loading...' : 'Load More Reviews'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductReviews;