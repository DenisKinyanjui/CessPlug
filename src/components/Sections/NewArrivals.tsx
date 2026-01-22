import React, { useEffect, useState } from "react";
import { getAllProducts } from "../../services/productApi";
import { ProductsResponse } from "../../types/Product";
import ProductCard from "./../Products/ProductCard";
import { Loader2, Sparkles } from "lucide-react";

const NewArrivals: React.FC = () => {
  const [products, setProducts] = useState<ProductsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        setLoading(true);
        setError(null);
        // Fetch latest 8 products sorted by creation date (newest first)
        const response = await getAllProducts({
          limit: 10,
          sortBy: "newest",
        });
        setProducts(response);
      } catch (err) {
        console.error("Failed to fetch new arrivals:", err);
        setError("Failed to load new arrivals. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (error) {
    return (
      <section className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
        <Sparkles className="h-auto text-orange-500" />
        <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6 text-gray-800">
          New Arrivals
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-600 text-sm md:text-base">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm md:text-base"
          >
            Try Again
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="container mx-auto px-4 sm:px-6 py-6 md:py-8">
      <div className="flex flex-row gap-4 mb-4">
        <div className="bg-orange-100 p-2 md:p-3 rounded-full h-12 w-12">
          <Sparkles className="h-auto text-orange-500" />
        </div>
        <h2 className="text-xl md:text-2xl font-bold md:mb-6 text-gray-800">
          New Arrivals
        </h2>
      </div>
      {loading ? (
        <div className="flex flex-col items-center justify-center py-8 md:py-12">
          <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
          <p className="mt-3 text-gray-600 text-sm md:text-base">
            Loading new arrivals...
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-2">
            {products?.data.products.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>

          {/* Optional View All Button */}
          {products?.data.products.length === 8 && (
            <div className="text-center mt-6 md:mt-8">
              <a
                href="/products?sortBy=newest"
                className="inline-flex items-center bg-orange-500 hover:bg-orange-600 text-white font-medium py-2 px-4 md:py-2.5 md:px-6 rounded-lg transition-colors text-sm md:text-base"
              >
                View All New Products
              </a>
            </div>
          )}
        </>
      )}
    </section>
  );
};

export default NewArrivals;
