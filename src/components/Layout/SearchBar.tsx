import React, { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, TrendingUp, Tag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

interface SearchBarProps {
  onSearch: (query: string) => void;
  placeholder?: string;
  className?: string;
  showAutocomplete?: boolean;
}

interface SearchSuggestion {
  type: 'keyword' | 'category' | 'brand' | 'tag';
  text: string;
  count?: number;
}

interface ProductResult {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  brand?: {
    name: string;
  };
  category?: {
    name: string;
  };
}

type NavigationItem = {
  type: 'suggestion' | 'product';
  index: number;
};

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = "Search phones, laptops, home appliances and more...",
  className = "",
  showAutocomplete = true,
}) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
  const [products, setProducts] = useState<ProductResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeItem, setActiveItem] = useState<NavigationItem>({ type: 'suggestion', index: -1 });

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const navigate = useNavigate();

  // Debounced search function for predictive search
  const debouncedFetchResults = useCallback(
    (searchQuery: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      debounceTimeoutRef.current = setTimeout(() => {
        if (searchQuery.trim() && showAutocomplete) {
          fetchSearchResults(searchQuery.trim());
        }
      }, 400);
    },
    [showAutocomplete]
  );

  // Fetch search suggestions and products from API
  const fetchSearchResults = async (searchQuery: string) => {
    if (!searchQuery.trim() || searchQuery.length < 2) {
      setSuggestions([]);
      setProducts([]);
      setShowDropdown(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    setIsLoading(true);

    try {
      console.log('Fetching search results for:', searchQuery);

      // FIXED: Use status filter instead of activeOnly
      const response = await axiosInstance.get('/products', {
        params: {
          search: searchQuery,
          limit: 6,
          page: 1,
          status: 'active' // Use status instead of activeOnly
        },
        signal: abortControllerRef.current.signal
      });

      console.log('Search API response:', response.data);

      if (response.data.success && response.data.data && response.data.data.products) {
        const productResults = response.data.data.products || [];
        const total = response.data.data.pagination?.total || productResults.length;
        
        console.log(`Found ${productResults.length} products in predictive search`);
        
        // Generate suggestions based on search query and results
        const generatedSuggestions: SearchSuggestion[] = [];
        
        // Add the current query as a suggestion with actual total count
        generatedSuggestions.push({
          type: 'keyword',
          text: searchQuery,
          count: total
        });

        // Extract unique categories and brands from results
        const categories = new Set<string>();
        const brands = new Set<string>();
        
        productResults.forEach((product: ProductResult) => {
          if (product.category?.name) categories.add(product.category.name);
          if (product.brand?.name) brands.add(product.brand.name);
        });

        // Add category suggestions (only if we found products)
        if (productResults.length > 0) {
          categories.forEach(category => {
            const count = productResults.filter((p: { category: { name: string; }; }) => p.category?.name === category).length;
            if (count > 0) {
              generatedSuggestions.push({
                type: 'category',
                text: category,
                count
              });
            }
          });

          // Add brand suggestions (only if we found products)
          brands.forEach(brand => {
            const count = productResults.filter((p: { brand: { name: string; }; }) => p.brand?.name === brand).length;
            if (count > 0) {
              generatedSuggestions.push({
                type: 'brand',
                text: brand,
                count
              });
            }
          });
        }

        // Limit suggestions to prevent overcrowding
        setSuggestions(generatedSuggestions.slice(0, 8));
        setProducts(productResults.slice(0, 6));
        setShowDropdown(true);
        setActiveItem({ type: 'suggestion', index: -1 });
        
        console.log('Set suggestions:', generatedSuggestions.slice(0, 8));
        console.log('Set products:', productResults.slice(0, 6));
      } else {
        console.log('No products found or invalid response structure');
        setSuggestions([]);
        setProducts([]);
        setShowDropdown(false);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        console.error("Error fetching search results:", error);
        console.error("Error details:", {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        // Still show search suggestion even if API fails
        setSuggestions([{
          type: 'keyword',
          text: searchQuery,
          count: undefined
        }]);
        setProducts([]);
        setShowDropdown(true);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim()) {
      debouncedFetchResults(value);
    } else {
      setSuggestions([]);
      setProducts([]);
      setShowDropdown(false);
      setActiveItem({ type: 'suggestion', index: -1 });
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      performSearch(query.trim());
    }
  };

  // Perform search and navigate to products listing page
  const performSearch = (searchTerm: string) => {
    onSearch(searchTerm);
    navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    setShowDropdown(false);
    searchInputRef.current?.blur();
  };

  // FIXED: Handle suggestion click - Navigate to product listing page
  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    let searchTerm = suggestion.text;
    
    if (suggestion.type === 'category') {
      // Navigate to category page
      navigate(`/products?category=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'brand') {
      // Navigate to brand filter
      navigate(`/products?brand=${encodeURIComponent(suggestion.text)}`);
    } else {
      // Regular keyword search - navigate to products page with search query
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
    
    setQuery(searchTerm);
    setShowDropdown(false);
  };

  // FIXED: Handle product click - Navigate to product detail page
  const handleProductClick = (product: ProductResult) => {
    // Navigate to product detail page using slug
    if (product.slug) {
      navigate(`/product/${product.slug}`);
    } else {
      // Fallback to ID if slug doesn't exist
      navigate(`/product/${product._id}`);
    }
    setShowDropdown(false);
  };

  // Calculate total navigable items
  const getTotalItems = () => suggestions.length + products.length;

  // Get current active element
  const getCurrentActiveElement = () => {
    if (activeItem.type === 'suggestion' && activeItem.index >= 0 && activeItem.index < suggestions.length) {
      return { type: 'suggestion', item: suggestions[activeItem.index] };
    } else if (activeItem.type === 'product' && activeItem.index >= 0 && activeItem.index < products.length) {
      return { type: 'product', item: products[activeItem.index] };
    }
    return null;
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown) {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
      return;
    }

    const totalItems = getTotalItems();
    if (totalItems === 0) {
      if (e.key === "Enter") {
        handleSubmit(e);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (activeItem.type === 'suggestion') {
          if (activeItem.index < suggestions.length - 1) {
            setActiveItem({ type: 'suggestion', index: activeItem.index + 1 });
          } else if (products.length > 0) {
            setActiveItem({ type: 'product', index: 0 });
          }
        } else if (activeItem.type === 'product') {
          if (activeItem.index < products.length - 1) {
            setActiveItem({ type: 'product', index: activeItem.index + 1 });
          }
        } else {
          // Start from first suggestion
          if (suggestions.length > 0) {
            setActiveItem({ type: 'suggestion', index: 0 });
          } else if (products.length > 0) {
            setActiveItem({ type: 'product', index: 0 });
          }
        }
        break;

      case "ArrowUp":
        e.preventDefault();
        if (activeItem.type === 'product') {
          if (activeItem.index > 0) {
            setActiveItem({ type: 'product', index: activeItem.index - 1 });
          } else if (suggestions.length > 0) {
            setActiveItem({ type: 'suggestion', index: suggestions.length - 1 });
          }
        } else if (activeItem.type === 'suggestion') {
          if (activeItem.index > 0) {
            setActiveItem({ type: 'suggestion', index: activeItem.index - 1 });
          } else {
            setActiveItem({ type: 'suggestion', index: -1 });
          }
        } else {
          // Go to last item
          if (products.length > 0) {
            setActiveItem({ type: 'product', index: products.length - 1 });
          } else if (suggestions.length > 0) {
            setActiveItem({ type: 'suggestion', index: suggestions.length - 1 });
          }
        }
        break;

      case "Enter":
        e.preventDefault();
        const activeElement = getCurrentActiveElement();
        if (activeElement) {
          if (activeElement.type === 'suggestion') {
            handleSuggestionClick(activeElement.item as SearchSuggestion);
          } else if (activeElement.type === 'product') {
            handleProductClick(activeElement.item as ProductResult);
          }
        } else {
          handleSubmit(e);
        }
        break;

      case "Escape":
        setShowDropdown(false);
        setActiveItem({ type: 'suggestion', index: -1 });
        searchInputRef.current?.blur();
        break;
    }
  };

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        !searchInputRef.current?.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setActiveItem({ type: 'suggestion', index: -1 });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Clear search
  const handleClearSearch = () => {
    setQuery("");
    setSuggestions([]);
    setProducts([]);
    setShowDropdown(false);
    setActiveItem({ type: 'suggestion', index: -1 });
    searchInputRef.current?.focus();
  };

  // Handle input focus
  const handleInputFocus = () => {
    if ((suggestions.length > 0 || products.length > 0) && query.trim()) {
      setShowDropdown(true);
    }
  };

  // Get suggestion icon
  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'category':
        return <Tag size={14} className="text-blue-500" />;
      case 'brand':
        return <TrendingUp size={14} className="text-green-500" />;
      default:
        return <Search size={14} className="text-gray-400" />;
    }
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex w-full">
        <div className="relative w-full">
          {/* Search Icon */}
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>

          {/* Input Field */}
          <input
            ref={searchInputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-2 rounded-[12px] bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all duration-200"
            role="combobox"
            aria-expanded={showDropdown}
            aria-haspopup="listbox"
            aria-label="Search products"
            autoComplete="off"
          />

          {/* Clear Button */}
          {query && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="absolute inset-y-0 right-8 flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            </div>
          )}
        </div>
      </form>

      {/* Predictive Search Dropdown */}
      {showAutocomplete && showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-hidden"
          role="listbox"
          aria-label="Search suggestions"
        >
          {isLoading && suggestions.length === 0 && products.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto mb-2"></div>
              Searching...
            </div>
          ) : (suggestions.length > 0 || products.length > 0) ? (
            <div className="flex flex-col md:flex-row max-h-96">
              {/* Suggestions Column */}
              {suggestions.length > 0 && (
                <div className="md:w-1/2 border-b md:border-b-0 md:border-r border-gray-200">
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Suggestions
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {suggestions.map((suggestion, index) => (
                      <button
                        key={`suggestion-${index}`}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors flex items-center space-x-3 ${
                          activeItem.type === 'suggestion' && activeItem.index === index
                            ? "bg-orange-50 border-orange-200"
                            : ""
                        }`}
                        role="option"
                        aria-selected={activeItem.type === 'suggestion' && activeItem.index === index}
                      >
                        {getSuggestionIcon(suggestion.type)}
                        <div className="flex-1 min-w-0">
                          <span className="text-sm text-gray-900 truncate block">
                            {suggestion.text}
                          </span>
                          {suggestion.count !== undefined && (
                            <span className="text-xs text-gray-500">
                              {suggestion.count} result{suggestion.count !== 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Products Column */}
              {products.length > 0 && (
                <div className="md:w-1/2">
                  <div className="p-3 bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Products
                    </h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {products.map((product, index) => (
                      <button
                        key={`product-${product._id}`}
                        onClick={() => handleProductClick(product)}
                        className={`w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-b-0 transition-colors ${
                          activeItem.type === 'product' && activeItem.index === index
                            ? "bg-orange-50 border-orange-200"
                            : ""
                        }`}
                        role="option"
                        aria-selected={activeItem.type === 'product' && activeItem.index === index}
                      >
                        <div className="flex items-center space-x-3">
                          <img
                            src={product.images?.[0] || "/images/placeholder.png"}
                            alt={product.name}
                            className="w-10 h-10 object-cover rounded flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = "/images/placeholder.png";
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {product.name}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                {product.brand?.name && (
                                  <span>{product.brand.name}</span>
                                )}
                              </div>
                              <div className="text-sm font-medium text-orange-600">
                                KSh {product.price?.toLocaleString() || "0"}
                              </div>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : query.length >= 2 ? (
            <div className="p-6 text-center text-gray-500">
              <Search size={32} className="mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium mb-1">No results found</p>
              <p className="text-sm mb-4">
                No products or suggestions found for "{query}"
              </p>
              <button
                onClick={handleSubmit}
                className="text-orange-500 hover:text-orange-600 text-sm font-medium flex items-center justify-center mx-auto space-x-1"
              >
                <Search size={14} />
                <span>Search anyway</span>
              </button>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;