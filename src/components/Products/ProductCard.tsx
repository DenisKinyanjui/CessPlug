import React, { useState, useEffect } from 'react';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { addToCart } from '../../store/slices/cartSlice';
import { Product as BackendProduct } from '../../types/Product';

interface Product {
  id: string;
  slug?: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  brand: string;
  rating: number;
  reviews: number;
  discount: number;
  inStock: boolean;
  isNew: boolean;
}

interface ProductCardProps {
  product: Product | BackendProduct;
  showCountdown?: boolean;
  fixedHeight?: boolean;
  showDiscountBadge?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  fixedHeight = true, 
  showDiscountBadge = false 
}) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const wishlistStr = localStorage.getItem('wishlist');
    const wishlist: Array<{ id: string }> = wishlistStr ? JSON.parse(wishlistStr) : [];
    const productId = 'id' in product ? product.id : (product as BackendProduct)._id;
    setIsInWishlist(wishlist.some((item) => item.id === productId));
  }, [product]);

  const transformedProduct: Product = React.useMemo(() => {
    if ('id' in product && 'image' in product) {
      return product as Product;
    }

    const backendProduct = product as BackendProduct;
    
    // FIXED: Better logic for handling original price vs discounted price
    let displayPrice = backendProduct.price;
    let displayOriginalPrice = backendProduct.originalPrice;
    
    // If there's a discount percentage and no explicit originalPrice, calculate it
    if (backendProduct.discount > 0 && !backendProduct.originalPrice) {
      displayOriginalPrice = backendProduct.price;
      displayPrice = backendProduct.price * (1 - backendProduct.discount / 100);
    }
    // If there's both originalPrice and current price, and they're different
    else if (backendProduct.originalPrice && backendProduct.originalPrice !== backendProduct.price) {
      displayOriginalPrice = backendProduct.originalPrice;
      displayPrice = backendProduct.price;
    }
    // If finalPrice exists and is different from price, use it
    else if (backendProduct.finalPrice && backendProduct.finalPrice !== backendProduct.price) {
      displayOriginalPrice = backendProduct.price;
      displayPrice = backendProduct.finalPrice;
    }

    return {
      id: backendProduct._id,
      slug: backendProduct.slug,
      name: backendProduct.name,
      price: displayPrice,
      originalPrice: displayOriginalPrice,
      image: backendProduct.images?.[0] || '/placeholder-image.jpg',
      category: typeof backendProduct.category === 'object'
        ? backendProduct.category.name
        : backendProduct.category,
      brand: typeof backendProduct.brand === 'object'
        ? backendProduct.brand.name
        : backendProduct.brand,
      rating: backendProduct.rating,
      reviews: backendProduct.numReviews,
      discount: backendProduct.discount,
      inStock: backendProduct.stock > 0,
      isNew: backendProduct.isNewArrival
    };
  }, [product]);

  const handleAddToCart = () => {
    dispatch(addToCart({
      id: transformedProduct.id,
      name: transformedProduct.name,
      price: transformedProduct.price,
      image: transformedProduct.image,
      category: transformedProduct.category,
    }));
  };

  const handleProductClick = () => {
    const route = transformedProduct.slug ? `/product/${transformedProduct.slug}` : `/product/${transformedProduct.id}`;
    navigate(route);
  };

  const toggleWishlist = () => {
    const wishlistStr = localStorage.getItem('wishlist');
    const wishlist: Array<{ id: string }> = wishlistStr ? JSON.parse(wishlistStr) : [];

    const productToSave = {
      id: transformedProduct.id,
      name: transformedProduct.name,
      price: transformedProduct.price,
      image: transformedProduct.image,
      slug: transformedProduct.slug
    };

    if (isInWishlist) {
      const updatedWishlist = wishlist.filter((item) => item.id !== transformedProduct.id);
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
    } else {
      const updatedWishlist = [...wishlist, productToSave];
      localStorage.setItem('wishlist', JSON.stringify(updatedWishlist));
      setIsInWishlist(true);
    }
  };

  const renderStars = (rating: number) => {
    if (rating === 0) {
      return [...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={14}
          className="text-gray-300"
        />
      ));
    }
    
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={14}
        className={i < Math.floor(rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}
      />
    ));
  };

  // FIXED: Better logic for determining when to show original price
  const shouldShowOriginalPrice = transformedProduct.originalPrice && 
                                transformedProduct.originalPrice > transformedProduct.price;

  // Calculate discount percentage for display
  const discountPercentage = shouldShowOriginalPrice 
    ? Math.round(((transformedProduct.originalPrice! - transformedProduct.price) / transformedProduct.originalPrice!) * 100)
    : transformedProduct.discount;

  return (
    <div className={`
      bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 
      overflow-hidden border border-gray-100 flex flex-col
      ${fixedHeight ? 'h-full' : ''}
    `}>
      {/* Image container with fixed aspect ratio */}
      <div className="relative pt-[100%]">
        <div className="absolute inset-0 p-2 flex items-center justify-center bg-white">
          <img
            onClick={handleProductClick}
            src={transformedProduct.image}
            alt={transformedProduct.name}
            className="w-full h-4/5 object-contain transition-transform duration-300 group-hover:scale-105 cursor-pointer"
          />
        </div>

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
          {/* FIXED: Only show discount badge when showDiscountBadge prop is true */}
          {showDiscountBadge && (discountPercentage > 0 || shouldShowOriginalPrice) && (
            <span className="bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded">
              {discountPercentage}% OFF
            </span>
          )}
          {!transformedProduct.inStock && (
            <span className="bg-gray-600 text-white text-xs font-semibold px-2 py-0.5 rounded">
              SOLD OUT
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button 
          onClick={toggleWishlist}
          className={`absolute top-2 right-2 p-1.5 rounded-full transition ${
            isInWishlist 
              ? 'text-red-500 bg-white/80 hover:bg-white' 
              : 'bg-white/80 hover:bg-white text-gray-700 hover:text-red-500'
          }`}
        >
          <Heart 
            size={16} 
            fill={isInWishlist ? 'currentColor' : 'none'}
          />
        </button>

        {/* Floating Cart Button */}
        <button
          onClick={handleAddToCart}
          disabled={!transformedProduct.inStock}
          className={`absolute bottom-2 right-2 z-10 p-1.5 rounded-full shadow-sm transition-all ${
            transformedProduct.inStock
              ? 'bg-orange-500 hover:bg-orange-600 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          <ShoppingCart size={16} />
        </button>
      </div>

      {/* Content container with flex-grow for equal height */}
      <div className="p-3 flex flex-col flex-grow">
        <h3
          onClick={handleProductClick}
          className="text-base font-semibold text-gray-800 line-clamp-2 hover:text-orange-500 transition cursor-pointer mb-1"
        >
          {transformedProduct.name}
        </h3>

        <div className="flex items-center mt-1 space-x-1">
          <div className="flex">{renderStars(transformedProduct.rating)}</div>
          {transformedProduct.reviews > 0 && (
            <span className="text-xs text-gray-500">({transformedProduct.reviews})</span>
          )}
        </div>

        {/* FIXED: Better price display layout */}
        <div className="mt-2 flex flex-col">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-base font-bold text-orange-600">
              Ksh {transformedProduct.price.toLocaleString()}
            </span>
            {shouldShowOriginalPrice && (
              <span className="text-sm text-gray-400 line-through">
                Ksh {transformedProduct.originalPrice!.toLocaleString()}
              </span>
            )}
          </div>
          {shouldShowOriginalPrice && (
            <span className="text-xs text-green-600 mt-1">
              Save Ksh {(transformedProduct.originalPrice! - transformedProduct.price).toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;