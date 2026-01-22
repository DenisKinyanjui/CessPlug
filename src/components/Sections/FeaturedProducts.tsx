import React, { useState, useEffect } from 'react';
import { Star, ArrowRight, Loader2 } from 'lucide-react';
import ProductCard from '../Products/ProductCard';
import { Product } from '../../types/Product';
import { getAllProducts } from '../../services/productApi';

const FeaturedProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        setError('');
        
        const response = await getAllProducts({
          limit: 10,
          page: 1,
          // @ts-ignore - featured filter will be handled by backend dynamic filtering
          featured: 'true'
        });

        if (response.success) {
          setProducts(response.data.products);
        } else {
          setError('Failed to load featured products');
        }
      } catch (err: any) {
        console.error('Error fetching featured products:', err);
        setError(err.message || 'Failed to load featured products');
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8">Discover our handpicked selection of premium products</p>
          </div>
          
          <div className="flex flex-col items-center justify-center py-8 md:py-12">
            <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
            <span className="mt-2 text-gray-600 text-sm md:text-base">Loading featured products...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8">Discover our handpicked selection of premium products</p>
          </div>
          
          <div className="text-center py-8 md:py-12">
            <div className="text-red-500 mb-4">
              <svg className="mx-auto h-10 w-10 md:h-12 md:w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L4.316 15.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <p className="text-red-600 font-medium text-sm md:text-base">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            >
              Try Again
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Featured Products</h2>
            <p className="text-gray-600 text-sm md:text-base mb-6 md:mb-8">Discover our handpicked selection of premium products</p>
          </div>
          
          <div className="text-center py-8 md:py-12">
            <div className="text-gray-400 mb-4">
              <Star className="mx-auto h-10 w-10 md:h-12 md:w-12" />
            </div>
            <p className="text-gray-600 text-sm md:text-base">No featured products available at the moment.</p>
            <p className="text-xs md:text-sm text-gray-500 mt-2">Check back soon for exciting new products!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-row items-center mb-3 md:mb-4">
            <Star className="h-6 w-6 md:h-8 md:w-8 text-orange-500 mr-2" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Featured Products</h2>
          </div>
          <p className="text-gray-600 text-sm md:text-base ml-8 md:ml-10">
            Discover our handpicked selection of premium products
          </p>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
          {products.map((product) => (
            <ProductCard 
              key={product._id} 
              product={{
                id: product._id,
                slug: product.slug,
                name: product.name,
                price: product.finalPrice || (product.price * (1 - product.discount / 100)),
                originalPrice: product.discount > 0 ? product.price : undefined,
                image: product.images[0],
                category: product.category?.name || '',
                brand: product.brand?.name || '',
                rating: product.rating,
                reviews: product.numReviews,
                discount: product.discount,
                inStock: product.stock > 0,
                isNew: product.isNewArrival || false,
              }}
            />
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center">
          <a
            href="/products?featured=true"
            className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 md:py-3 md:px-6 rounded-lg transition-colors duration-300 group text-sm md:text-base"
          >
            View All Featured Products
            <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 group-hover:translate-x-1 transition-transform duration-300" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;