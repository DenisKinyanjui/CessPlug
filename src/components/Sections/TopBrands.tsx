import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getAllBrands } from "../../services/brandApi";
import { Brand } from "../../types/Brand";

const TopBrands: React.FC = () => {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [startIndex, setStartIndex] = useState(0);
  const brandsPerPage = 6;

  // All brands have the same consistent background color
  const brandBackgroundColor = "bg-purple-200";

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setLoading(true);
        const response = await getAllBrands();

        // Sort brands with logos/images first
        const sortedBrands = [...response.data.brands].sort((a, b) => {
          if (a.logo && !b.logo) return -1;
          if (!a.logo && b.logo) return 1;
          return 0;
        });

        setBrands(sortedBrands);
        setError(null);
      } catch (err) {
        console.error("Error fetching brands:", err);
        setError("Failed to load brands");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const nextBrands = () => {
    if (startIndex + brandsPerPage < brands.length) {
      setStartIndex(startIndex + brandsPerPage);
    }
  };

  const prevBrands = () => {
    if (startIndex - brandsPerPage >= 0) {
      setStartIndex(startIndex - brandsPerPage);
    }
  };

  const visibleBrands = brands.slice(startIndex, startIndex + brandsPerPage);

  if (loading) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              TOP <span className="text-orange-500">ELECTRONICS BRANDS</span>
            </h2>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold text-sm">
              VIEW ALL
            </button>
          </div>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              TOP <span className="text-orange-500">ELECTRONICS BRANDS</span>
            </h2>
            <button className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold text-sm">
              VIEW ALL
            </button>
          </div>
          <div className="flex justify-center items-center h-32">
            <div className="text-red-500 text-center">
              <p className="text-lg font-semibold">{error}</p>
              <p className="text-sm mt-2">Please try refreshing the page</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            TOP <span className="text-orange-500">ELECTRONICS BRANDS</span>
          </h2>
          <Link
            to="/products"
            className="bg-orange-500 text-white px-4 py-2 rounded-md font-semibold text-sm hover:bg-orange-600 transition-colors"
          >
            VIEW ALL
          </Link>
        </div>

        {/* Brands Container */}
        <div className="relative">
          <div className="flex items-center gap-4">
            {/* Left Arrow */}
            {startIndex > 0 && (
              <button
                onClick={prevBrands}
                className="flex-shrink-0 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
            )}

            {/* Brands Grid */}
            <div className="flex gap-3 overflow-hidden flex-1 justify-center">
              {visibleBrands.map((brand, index) => (
                <Link
                  key={brand._id}
                  to={`/products?brand=${brand.slug}`}
                  className="flex-shrink-0 group"
                >
                  <div
                    className={`
                    ${brandBackgroundColor} 
                    rounded-2xl p-4 flex flex-col items-center justify-center 
                    w-44 max-h-28 border border-transparent hover:border-purple-900 
                    transition-all duration-300 shadow-sm hover:shadow-md
                    relative overflow-hidden
                  `}
                  >
                    {/* Brand Name Tag */}
                    <div className="absolute top-15 left-2">
                      <span className="bg-purple-800 text-white px-2.5 py-0.5 rounded-lg text-xs font-medium uppercase tracking-wide">
                        {brand.name}
                      </span>
                    </div>

                    {/* Brand Logo */}
                    <div className="flex items-center justify-center h-full mt-2 ml-16">
                      {brand.logo ? (
                        <img
                          src={brand.logo}
                          alt={brand.name}
                          className="h-2/3 max-h-12 w-auto object-contain max-w-20 rounded-lg z-20"
                          style={{
                            filter: "none",
                            mixBlendMode: "normal",
                          }}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "";
                            target.style.display = "none";
                            // Show brand name as fallback
                            const parent = target.parentElement;
                            if (parent) {
                              parent.innerHTML = `<span class="text-purple-800 font-bold text-sm">${brand.name}</span>`;
                            }
                          }}
                        />
                      ) : (
                        <span className="text-purple-800 font-bold text-sm">
                          {brand.name}
                        </span>
                      )}
                      {/* Circles in top-right */}
                      <div className="absolute top-0 right-0 h-10 w-10">
                        <div className="absolute top-1 left-1 bg-purple-800 rounded-full h-12 w-12 z-0"></div>
                        <div className="absolute top-0 left-0 h-14 w-14 rounded-full border-2 border-purple-600 bg-transparent z-10"></div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right Arrow */}
            {startIndex + brandsPerPage < brands.length && (
              <button
                onClick={nextBrands}
                className="flex-shrink-0 p-2 rounded-full hover:bg-gray-200 transition-colors"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TopBrands;
