//src/pages/ProductListing.tsx
import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Grid,
  List,
  ChevronDown,
  Package,
  Filter,
  X,
  Clock,
  ShoppingCart,
  Star,
  Heart,
} from "lucide-react";
import { useDispatch } from "react-redux";
import { getAllProducts } from "../services/productApi";
import { getFlashDeals } from "../services/dealApi";
import { getAllCategories as getCategoriesApi } from "../services/categoryApi";
import { addToCart } from "../store/slices/cartSlice";
import { Product, ProductFilters } from "../types/Product";
import { Category } from "../types/Category";
import { FlashDeal } from "../types/Deal";
import ProductCard from "../components/Products/ProductCard";
import FilterSidebar from "../components/Products/FilterSidebar";
import SEOHelmet from "../components/SEO/SEOHelmet";
import { useFilterOptions } from "../hooks/useFilterOptions";
import { useCountdown } from "../hooks/useCountdown";

type ViewMode = "grid" | "list";
type SortOption = "newest" | "price_low" | "price_high" | "rating";

// List View Product Card Component
const ProductListCard: React.FC<{
  product: Product;
  showCountdown?: boolean;
  showDiscountBadge?: boolean;
}> = ({ product, showDiscountBadge = false }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isInWishlist, setIsInWishlist] = useState(false);

  useEffect(() => {
    const wishlistStr = localStorage.getItem("wishlist");
    const wishlist: Array<{ id: string }> = wishlistStr
      ? JSON.parse(wishlistStr)
      : [];
    setIsInWishlist(wishlist.some((item) => item.id === product._id));
  }, [product._id]);

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.finalPrice || product.price,
        image: product.images?.[0] || "/placeholder-image.jpg",
        category:
          typeof product.category === "object"
            ? product.category.name
            : product.category,
      })
    );
  };

  const handleProductClick = () => {
    const route = product.slug
      ? `/product/${product.slug}`
      : `/product/${product._id}`;
    navigate(route);
  };

  const toggleWishlist = () => {
    const wishlistStr = localStorage.getItem("wishlist");
    const wishlist: Array<{ id: string }> = wishlistStr
      ? JSON.parse(wishlistStr)
      : [];

    const productToSave = {
      id: product._id,
      name: product.name,
      price: product.finalPrice || product.price,
      image: product.images?.[0] || "/placeholder-image.jpg",
      slug: product.slug,
    };

    if (isInWishlist) {
      const updatedWishlist = wishlist.filter(
        (item) => item.id !== product._id
      );
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsInWishlist(false);
    } else {
      const updatedWishlist = [...wishlist, productToSave];
      localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
      setIsInWishlist(true);
    }
  };

  const renderStars = (rating: number) => {
    if (rating === 0) {
      return [...Array(5)].map((_, i) => (
        <Star key={i} size={16} className="text-gray-300" />
      ));
    }

    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={16}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }
      />
    ));
  };

  const displayPrice = product.finalPrice || product.price;
  const hasDiscount =
    product.originalPrice && product.originalPrice > displayPrice;
  const discountPercentage = hasDiscount
    ? Math.round(
        ((product.originalPrice - displayPrice) / product.originalPrice) * 100
      )
    : product.discount;

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-100 p-4">
      <div className="flex gap-4">
        {/* Product Image */}
        <div className="relative w-32 h-32 flex-shrink-0">
          <img
            onClick={handleProductClick}
            src={product.images?.[0] || "/placeholder-image.jpg"}
            alt={product.name}
            className="w-full h-full object-contain rounded-lg cursor-pointer hover:scale-105 transition-transform duration-300"
          />

          {/* Badges */}
          <div className="absolute top-1 left-1 flex flex-col gap-1">
            {showDiscountBadge && discountPercentage > 0 && (
              <span className="bg-red-500 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                {discountPercentage}% OFF
              </span>
            )}
            {product.stock === 0 && (
              <span className="bg-gray-600 text-white text-xs font-semibold px-1.5 py-0.5 rounded">
                SOLD OUT
              </span>
            )}
          </div>
        </div>

        {/* Product Details */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h3
              onClick={handleProductClick}
              className="text-lg font-semibold text-gray-800 hover:text-orange-500 transition cursor-pointer mb-2 line-clamp-2"
            >
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2 mb-2">
              <div className="flex">{renderStars(product.rating)}</div>
              {product.numReviews > 0 && (
                <span className="text-sm text-gray-500">
                  ({product.numReviews} reviews)
                </span>
              )}
            </div>

            {/* Category and Brand */}
            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
              <span>
                Category:{" "}
                {typeof product.category === "object"
                  ? product.category.name
                  : product.category}
              </span>
              <span>
                Brand:{" "}
                {typeof product.brand === "object"
                  ? product.brand.name
                  : product.brand}
              </span>
            </div>

            {/* Description (if available) */}
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {product.description}
              </p>
            )}
          </div>

          {/* Price and Actions */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-3">
                <span className="text-xl font-bold text-orange-600">
                  Ksh {displayPrice.toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through">
                    Ksh {product.originalPrice!.toLocaleString()}
                  </span>
                )}
              </div>
              {hasDiscount && (
                <span className="text-sm text-green-600">
                  Save Ksh{" "}
                  {(product.originalPrice! - displayPrice).toLocaleString()}
                </span>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={toggleWishlist}
                className={`p-2 rounded-full transition ${
                  isInWishlist
                    ? "text-red-500 bg-red-50 hover:bg-red-100"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-red-500"
                }`}
              >
                <Heart
                  size={20}
                  fill={isInWishlist ? "currentColor" : "none"}
                />
              </button>

              <button
                onClick={handleAddToCart}
                disabled={product.stock === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  product.stock > 0
                    ? "bg-orange-500 hover:bg-orange-600 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                <ShoppingCart size={18} />
                {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProductListing: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // State management
  const [products, setProducts] = useState<Product[]>([]);
  const [initialProducts, setInitialProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if we're showing flash deals
  const isFlashDealsView = searchParams.get("deals") === "flash";

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0,
  });

  // Extract filter options from initial products using custom hook
  const filterOptions = useFilterOptions(initialProducts);

  // Get earliest flash deal end time for countdown
  const getEarliestEndTime = () => {
    if (flashDeals.length === 0) {
      const defaultDate = new Date();
      defaultDate.setHours(defaultDate.getHours() + 16);
      defaultDate.setMinutes(defaultDate.getMinutes() + 43);
      defaultDate.setSeconds(defaultDate.getSeconds() + 27);
      return defaultDate;
    }

    const earliestDeal = flashDeals.reduce((earliest, deal) => {
      const dealEndTime = new Date(deal.flashEndsAt).getTime();
      const earliestEndTime = new Date(earliest.flashEndsAt).getTime();
      return dealEndTime < earliestEndTime ? deal : earliest;
    });

    return new Date(earliestDeal.flashEndsAt);
  };

  const targetDate = getEarliestEndTime();
  const { days, hours, minutes, seconds } = useCountdown(targetDate);

  // Get current filters from URL with proper decoding for spec values
  const getCurrentFilters = useCallback((): ProductFilters => {
    const filters: ProductFilters = {};
    const params = Object.fromEntries(searchParams.entries());

    // Basic filters
    if (params.category) filters.category = params.category;
    if (params.brand) filters.brand = params.brand;
    if (params.search) filters.search = params.search;
    if (params.minPrice) filters.minPrice = Number(params.minPrice);
    if (params.maxPrice) filters.maxPrice = Number(params.maxPrice);
    if (params.sortBy) filters.sortBy = params.sortBy as any;
    if (params.page) filters.page = Number(params.page);

    // Dynamic specification filters
    Object.keys(params).forEach((key) => {
      if (
        ![
          "category",
          "brand",
          "search",
          "minPrice",
          "maxPrice",
          "sortBy",
          "page",
          "limit",
          "deals",
        ].includes(key)
      ) {
        try {
          filters[key] = params[key];
        } catch (error) {
          console.warn(
            `Failed to process spec value for ${key}:`,
            params[key],
            error
          );
          filters[key] = params[key];
        }
      }
    });

    filters.limit = 12;

    return filters;
  }, [searchParams]);

  // Load flash deals
  const loadFlashDeals = useCallback(async () => {
    if (!isFlashDealsView) return;

    setLoading(true);
    setError(null);

    try {
      const response = await getFlashDeals();

      if (response.success) {
        setFlashDeals(response.data.flashDeals);
        const flashProducts = response.data.flashDeals.map(
          (deal: FlashDeal) => ({
            ...deal.product,
            isFlashDeal: true,
            flashPrice: deal.flashPrice,
            flashEndsAt: deal.flashEndsAt,
          })
        );

        const page = Number(searchParams.get("page")) || 1;
        const limit = 12;
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedProducts = flashProducts.slice(startIndex, endIndex);

        setProducts(paginatedProducts);
        setPagination({
          page,
          limit,
          total: flashProducts.length,
          pages: Math.ceil(flashProducts.length / limit),
        });

        setInitialProducts(flashProducts);
      } else {
        setError("Failed to load flash deals");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load flash deals");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [isFlashDealsView, searchParams.get("page")]);

  // Load initial products (for filter options)
  const loadInitialProducts = useCallback(async () => {
    if (isFlashDealsView) return;

    try {
      const basicFilters: ProductFilters = { limit: 1000 };

      const category = searchParams.get("category");
      const search = searchParams.get("search");

      if (category) basicFilters.category = category;
      if (search) basicFilters.search = search;

      const response = await getAllProducts(basicFilters);

      if (response.success) {
        setInitialProducts(response.data.products);
      }
    } catch (err: any) {
      console.error("Failed to load initial products:", err);
      setInitialProducts([]);
    }
  }, [
    searchParams.get("category"),
    searchParams.get("search"),
    isFlashDealsView,
  ]);

  // Load filtered products
  const loadProducts = useCallback(async () => {
    if (isFlashDealsView) {
      loadFlashDeals();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filters = getCurrentFilters();

      const response = await getAllProducts(filters);

      if (response.success) {
        setProducts(response.data.products);
        setPagination(response.data.pagination);
      } else {
        setError("Failed to load products");
      }
    } catch (err: any) {
      setError(err.message || "Failed to load products");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [getCurrentFilters, isFlashDealsView, loadFlashDeals]);

  // Load categories on mount
  const loadCategories = useCallback(async () => {
    try {
      const response = await getCategoriesApi();
      if (response.success) {
        setCategories(response.data.categories);
      }
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  }, []);

  // Update URL when filters change
  const updateURL = useCallback(
    (newFilters: Partial<ProductFilters>) => {
      const params = new URLSearchParams(searchParams);

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.set(key, value.toString());
        } else {
          params.delete(key);
        }
      });

      if (!newFilters.hasOwnProperty("page")) {
        params.delete("page");
      }

      setSearchParams(params);
    },
    [searchParams, setSearchParams]
  );

  // Load data on mount and when category/search changes
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    loadInitialProducts();
  }, [loadInitialProducts]);

  useEffect(() => {
    loadProducts();
  }, [searchParams]);

  // Event handlers
  const handlePriceChange = (min: number, max: number) => {
    updateURL({
      minPrice: min || undefined,
      maxPrice: max || undefined,
    });
  };

  const handleSortChange = (sortBy: SortOption) => {
    updateURL({ sortBy });
  };

  const handlePageChange = (page: number) => {
    updateURL({ page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleClearFilters = () => {
    const params = new URLSearchParams();

    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const deals = searchParams.get("deals");

    if (category) params.set("category", category);
    if (search) params.set("search", search);
    if (deals) params.set("deals", deals);

    setSearchParams(params);
  };

  const handleFilterChange = () => {};

  // Get current category for SEO and display
  const currentCategory = categories.find(
    (cat) =>
      cat.slug === searchParams.get("category") ||
      cat._id === searchParams.get("category")
  );

  const currentSort = (searchParams.get("sortBy") as SortOption) || "newest";

  // Check for active filters
  const hasActiveFilters = Array.from(searchParams.entries()).some(
    ([key, value]) => {
      if (
        key === "search" ||
        key === "page" ||
        key === "limit" ||
        key === "deals"
      )
        return false;
      if (!value) return false;

      if (
        !["category", "brand", "minPrice", "maxPrice", "sortBy"].includes(key)
      ) {
        try {
          const decodedValue = decodeURIComponent(value);
          return decodedValue.trim() !== "";
        } catch {
          return value.trim() !== "";
        }
      }

      return true;
    }
  );

  // Render pagination controls
  const renderPagination = () => {
    if (pagination.pages <= 1) return null;

    const pages = [];
    const currentPage = pagination.page;
    const totalPages = pagination.pages;

    if (totalPages > 0) {
      pages.push(1);
    }

    if (currentPage > 3) {
      pages.push("...");
    }

    const startPage = Math.max(2, currentPage - 1);
    const endPage = Math.min(totalPages - 1, currentPage + 1);

    for (let i = startPage; i <= endPage; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (currentPage < totalPages - 2) {
      pages.push("...");
    }

    if (totalPages > 1 && !pages.includes(totalPages)) {
      pages.push(totalPages);
    }

    return (
      <div className="flex flex-wrap items-center justify-center gap-2 mt-6 md:mt-8">
        <button
          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage <= 1}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          Previous
        </button>

        {pages.map((page, index) => (
          <button
            key={`page-${index}`}
            onClick={() =>
              typeof page === "number" ? handlePageChange(page) : null
            }
            disabled={page === "..." || page === currentPage}
            className={`px-3 py-2 text-sm border rounded-md min-w-[40px] transition-colors ${
              page === currentPage
                ? "bg-orange-500 text-white border-orange-500"
                : page === "..."
                ? "border-transparent cursor-default text-gray-400"
                : "border-gray-300 hover:bg-gray-50 hover:border-gray-400"
            }`}
            aria-label={
              typeof page === "number" ? `Go to page ${page}` : undefined
            }
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        ))}

        <button
          onClick={() =>
            handlePageChange(Math.min(totalPages, currentPage + 1))
          }
          disabled={currentPage >= totalPages}
          className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          Next
        </button>
      </div>
    );
  };

  // Get page title and description
  const getPageTitle = () => {
    if (isFlashDealsView) return "Flash Deals";
    if (currentCategory) return currentCategory.name;
    return "All Products";
  };

  const getPageDescription = () => {
    if (isFlashDealsView)
      return "Limited time flash deals with amazing discounts!";
    if (currentCategory)
      return `Shop the best ${currentCategory.name} products at CessPlug.`;
    return "Browse our wide selection of products at CessPlug.";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* SEO Headers */}
      <SEOHelmet
        title={`${getPageTitle()} | CessPlug`}
        description={getPageDescription()}
        keywords={
          isFlashDealsView
            ? "flash deals, limited offers, discounts"
            : `${getPageTitle()}, buy ${getPageTitle()}, ${getPageTitle()} deals`
        }
      />

      <div className="flex relative">
        {/* Mobile Filter Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed bottom-6 right-6 z-40 bg-orange-500 text-white p-3 rounded-full shadow-lg hover:bg-orange-600 transition-colors"
        >
          <Filter size={20} />
        </button>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Filter Sidebar - Hide for flash deals view */}
        {!isFlashDealsView && (
          <div
            className={`
            fixed lg:sticky lg:top-0 h-screen overflow-y-auto z-50 lg:z-0
            w-72 sm:w-80 bg-white shadow-lg lg:shadow-none
            transform transition-transform duration-300 ease-in-out lg:transform-none
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            ${sidebarOpen ? "block" : "hidden lg:block"}
          `}
          >
            <div className="lg:hidden flex justify-between items-center p-4 border-b">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-md"
              >
                <X size={20} />
              </button>
            </div>

            <FilterSidebar
              className="px-2 mb-64 md:mb-0 lg:mb-0"
              onFilterChange={handleFilterChange}
              filteredProducts={products}
              filterOptions={filterOptions}
              currentCategory={currentCategory?._id}
              loading={loading}
            />
          </div>
        )}

        {/* Main Content */}
        <div className={`flex-1 ${!isFlashDealsView ? "lg:ml-0" : ""}`}>
          <div className="p-4 sm:p-6">
            {/* Header */}
            <div className="mb-4 sm:mb-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    {isFlashDealsView && (
                      <Clock className="h-6 w-6 text-orange-500" />
                    )}
                    <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                      {getPageTitle()}
                    </h1>
                  </div>
                  {searchParams.get("search") && (
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      Search results for "{searchParams.get("search")}"
                    </p>
                  )}
                  {isFlashDealsView && (
                    <p className="text-gray-600 mt-1 text-sm sm:text-base">
                      Limited time offers - Don't miss out!
                    </p>
                  )}
                  <div className="flex items-center gap-2 sm:gap-4 mt-1">
                    <p className="text-xs sm:text-sm text-gray-500">
                      {pagination.total}{" "}
                      {isFlashDealsView ? "flash deals" : "products"} found
                      {pagination.pages > 1 && (
                        <span className="ml-1">
                          (Page {pagination.page} of {pagination.pages})
                        </span>
                      )}
                    </p>
                    {hasActiveFilters && (
                      <button
                        onClick={handleClearFilters}
                        className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
                      >
                        <X size={12} />
                        Clear All Filters
                      </button>
                    )}
                  </div>
                </div>

                {/* Flash Deal Countdown Timer */}
                {isFlashDealsView && flashDeals.length > 0 && (
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm md:text-base text-gray-600">
                        Deals end in
                      </span>
                      <div className="flex gap-1 md:gap-2">
                        <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                          <span className="font-bold">
                            {days.toString().padStart(2, "0")}
                          </span>
                          <span className="text-xs block">d</span>
                        </div>
                        <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                          <span className="font-bold">
                            {hours.toString().padStart(2, "0")}
                          </span>
                          <span className="text-xs block">h</span>
                        </div>
                        <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                          <span className="font-bold">
                            {minutes.toString().padStart(2, "0")}
                          </span>
                          <span className="text-xs block">m</span>
                        </div>
                        <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                          <span className="font-bold">
                            {seconds.toString().padStart(2, "0")}
                          </span>
                          <span className="text-xs block">s</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Controls */}
                <div className="flex items-center gap-2 sm:gap-4">
                  {/* Mobile Filter Toggle - Hide for flash deals */}
                  {!isFlashDealsView && (
                    <button
                      onClick={() => setSidebarOpen(true)}
                      className="lg:hidden flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-xs sm:text-sm"
                    >
                      <Filter size={14} />
                      Filters
                      {hasActiveFilters && (
                        <span className="bg-orange-500 text-white text-[10px] sm:text-xs px-1.5 py-0.5 rounded-full">
                          Active
                        </span>
                      )}
                    </button>
                  )}

                  {/* Sort Dropdown */}
                  <div className="relative">
                    <select
                      value={currentSort}
                      onChange={(e) =>
                        handleSortChange(e.target.value as SortOption)
                      }
                      className="appearance-none bg-white border border-gray-300 rounded-md px-3 sm:px-4 py-1.5 sm:py-2 pr-6 sm:pr-8 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-xs sm:text-sm"
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="rating">Highest Rated</option>
                    </select>
                    <ChevronDown
                      size={14}
                      className="absolute right-1.5 sm:right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="hidden lg:flex border border-gray-300 rounded-md overflow-hidden">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2 ${
                        viewMode === "grid"
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <Grid size={16} />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2 ${
                        viewMode === "list"
                          ? "bg-orange-500 text-white"
                          : "bg-white text-gray-600 hover:bg-gray-50"
                      }`}
                    >
                      <List size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex justify-center items-center py-12 sm:py-20">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
              </div>
            )}

            {/* Error State */}
            {error && !loading && (
              <div className="text-center py-12 sm:py-20">
                <div className="text-red-500 text-base sm:text-lg mb-2">
                  {error}
                </div>
                <button
                  onClick={loadProducts}
                  className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Empty State */}
            {!loading && !error && products.length === 0 && (
              <div className="text-center py-12 sm:py-20">
                <Package
                  size={48}
                  className="mx-auto mb-3 sm:mb-4 text-gray-300"
                />
                <h3 className="text-lg sm:text-xl font-semibold text-gray-600 mb-1 sm:mb-2">
                  {isFlashDealsView ? "No deal available" : "No products found"}
                </h3>
                <p className="text-gray-500 mb-3 sm:mb-4 text-sm sm:text-base">
                  {isFlashDealsView
                    ? "Check back later for amazing deals!"
                    : "Try adjusting your filters or search terms"}
                </p>
                {!isFlashDealsView && (
                  <button
                    onClick={handleClearFilters}
                    className="bg-orange-500 text-white px-4 sm:px-6 py-1.5 sm:py-2 rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}

            {/* Products Display */}
            {!loading && !error && products.length > 0 && (
              <>
                {/* Grid View */}
                {viewMode === "grid" && (
                  <div className="grid gap-4 sm:gap-6 grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        showCountdown={isFlashDealsView || product.isFlashDeal}
                        showDiscountBadge={isFlashDealsView}
                      />
                    ))}
                  </div>
                )}

                {/* List View */}
                {viewMode === "list" && (
                  <div className="space-y-4">
                    {products.map((product) => (
                      <ProductListCard
                        key={product._id}
                        product={product}
                        showCountdown={isFlashDealsView || product.isFlashDeal}
                        showDiscountBadge={isFlashDealsView}
                      />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {renderPagination()}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
