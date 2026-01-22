import React, { useState, useEffect } from "react";
import { TrendingUp, ShoppingBag, Loader2 } from "lucide-react";
import ProductCard from "../Products/ProductCard";
import { getFrequentlyBought } from "../../services/orderApi";
import { Product } from "../../types/Product";

interface FrequentlyBoughtProps {
  limit?: number;
  title?: string;
  subtitle?: string;
  showIcon?: boolean;
  className?: string;
}

interface FrequentlyBoughtProduct extends Product {
  totalPurchases: number;
  totalOrders: number;
}

const FrequentlyBought: React.FC<FrequentlyBoughtProps> = ({
  limit = 5,
  title = "Most Popular Products",
  showIcon = true,
  className = "",
}) => {
  const [products, setProducts] = useState<FrequentlyBoughtProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFrequentlyBought = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await getFrequentlyBought(limit);

        if (response.success) {
          setProducts(response.data.products);
        } else {
          setError("Failed to load products");
        }
      } catch (err) {
        console.error("Error fetching frequently bought products:", err);
        setError("Failed to load products");
      } finally {
        setLoading(false);
      }
    };

    fetchFrequentlyBought();
  }, [limit]);

  if (loading) {
    return (
      <section className={`py-8 md:py-12 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              <p className="text-gray-600">Loading popular products...</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className={`py-8 md:py-12 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
              <p className="text-gray-600 text-center text-sm md:text-base">
                Unable to load products at this time.
                <br />
                Please try again later.
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return (
      <section className={`py-8 md:py-12 bg-gray-50 ${className}`}>
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center min-h-[300px] md:min-h-[400px]">
            <div className="flex flex-col items-center space-y-4">
              <ShoppingBag className="h-10 w-10 md:h-12 md:w-12 text-gray-400" />
              <p className="text-gray-600 text-center text-sm md:text-base">
                No popular products available yet.
                <br />
                Check back soon!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-8 md:py-12 bg-gray-50 ${className}`}>
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-6 md:mb-10 flex justify-between items-center">
          <div className="flex flex-row sm:flex-row items-start sm:items-center mb-3 md:mb-4 gap-3">
            {showIcon && (
              <div className="bg-orange-100 p-2 md:p-3 rounded-full">
                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-orange-600" />
              </div>
            )}
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {title}
            </h2>
          </div>
          {/* <p className="text-sm md:text-lg text-gray-600 sm:ml-12 md:ml-16">
            {subtitle}
          </p> */}

          {/* View All Button (Optional) */}
          {products.length >= limit && (
            <div className="mt-8 md:mt-10">
              <button className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-6 md:py-3 md:px-8 rounded-lg transition-colors duration-200 inline-flex items-center space-x-2 text-sm md:text-base">
                <ShoppingBag className="h-4 w-4 md:h-5 md:w-5" />
                <span>View All Products</span>
              </button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-2">
          {products.map((product, index) => (
            <div key={product._id} className="relative">
              <ProductCard product={product} />

              {/* Purchase Count Badge */}
              <div className="absolute -top-2 left-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg z-10">
                #{index + 1}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FrequentlyBought;
