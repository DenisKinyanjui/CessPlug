// src/components/Products/FilterSidebar.tsx
import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import { ChevronDown, ChevronUp, X } from "lucide-react";
import { Product } from "../../types/Product";
import { FilterOptions } from "../../hooks/useFilterOptions";
import { getPriceRange } from "../../services/productApi";

interface FilterSidebarProps {
  className?: string;
  onFilterChange: () => void;
  filteredProducts: Product[]; // Current filtered products (for displaying current counts)
  filterOptions: FilterOptions; // Pre-computed filter options from initial products
  currentCategory?: string;
  loading?: boolean;
}

interface PriceRange {
  min: number;
  max: number;
}

const FilterSidebar: React.FC<FilterSidebarProps> = ({
  className,
  onFilterChange,
  filteredProducts,
  filterOptions,
  currentCategory,
  loading = false
}) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [expandedSections, setExpandedSections] = useState<
    Record<string, boolean>
  >({
    brands: true,
    price: true, // Auto-expand price section
  });

  // Price filter state
  const [priceRange, setPriceRange] = useState<PriceRange>({
    min: 0,
    max: 1000000,
  });
  const [localMinPrice, setLocalMinPrice] = useState<string>("");
  const [localMaxPrice, setLocalMaxPrice] = useState<string>("");
  // NEW: Temporary slider values that don't immediately apply
  const [tempMinPrice, setTempMinPrice] = useState<number>(0);
  const [tempMaxPrice, setTempMaxPrice] = useState<number>(1000000);
  const [priceLoading, setPriceLoading] = useState(false);
  const [priceRangeInitialized, setPriceRangeInitialized] = useState(false);
  // NEW: Loading state for filter options
  const [filtersLoading, setFiltersLoading] = useState(false);

  // FIXED: Get currently selected filters from URL with proper decoding
  const selectedFilters = useMemo(() => {
    // FIXED: Properly decode the brand parameter and split by comma
    const brandParam = searchParams.get("brand");
    let selectedBrands: string[] = [];

    if (brandParam) {
      try {
        // First decode the entire parameter, then split by comma
        const decodedBrandParam = decodeURIComponent(brandParam);
        selectedBrands = decodedBrandParam.split(",").filter(Boolean);
      } catch (error) {
        console.warn(`Failed to decode brand parameter:`, brandParam, error);
        // Fallback: try splitting the original parameter
        selectedBrands = brandParam.split(",").filter(Boolean);
      }
    }

    const selectedSpecs: Record<string, string> = {};

    // Extract selected specs from URL params - decode URI components properly
    searchParams.forEach((value, key) => {
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
        ].includes(key)
      ) {
        try {
          // FIXED: Decode the URL-encoded value to get the original string
          selectedSpecs[key] = decodeURIComponent(value);
        } catch (error) {
          console.warn(`Failed to decode spec value for ${key}:`, value, error);
          // Fallback to original value if decoding fails
          selectedSpecs[key] = value;
        }
      }
    });

    // Get price filters from URL
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");

    return {
      brands: selectedBrands,
      specs: selectedSpecs,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    };
  }, [searchParams]);

  // FIXED: Fetch price range when category changes - use category parameter from URL
  const fetchPriceRange = useCallback(async () => {
    setPriceLoading(true);
    try {
      const params: any = { activeOnly: true };

      // FIXED: Get category from URL params (this is the slug/id that was passed in URL)
      const categoryFromUrl = searchParams.get("category");
      
      if (categoryFromUrl) {
        params.category = categoryFromUrl; // Use the category slug/id from URL
      }

      // Add selected brands to price range query if any are selected
      if (selectedFilters.brands.length > 0) {
        params.brand = selectedFilters.brands.join(",");
      }

      const response = await getPriceRange(params);

      if (response.success) {
        const { minPrice, maxPrice } = response.data;
        const newRange = {
          min: Math.floor(minPrice || 0),
          max: Math.ceil(maxPrice || 1000000),
        };
        
        // FIXED: Ensure we have a valid range
        if (newRange.min >= newRange.max) {
          newRange.max = newRange.min + 1000;
        }
        
        setPriceRange(newRange);
        setPriceRangeInitialized(true);

        // NEW: Set temp values to current range if no URL params exist
        if (!selectedFilters.minPrice && !selectedFilters.maxPrice) {
          setTempMinPrice(newRange.min);
          setTempMaxPrice(newRange.max);
          if (!localMinPrice || localMinPrice === "") {
            setLocalMinPrice(newRange.min.toString());
          }
          if (!localMaxPrice || localMaxPrice === "") {
            setLocalMaxPrice(newRange.max.toString());
          }
        } else {
          // Set temp values to current URL values
          setTempMinPrice(selectedFilters.minPrice !== undefined ? selectedFilters.minPrice : newRange.min);
          setTempMaxPrice(selectedFilters.maxPrice !== undefined ? selectedFilters.maxPrice : newRange.max);
        }
      }
    } catch (error) {
      console.error("Failed to fetch price range:", error);
    } finally {
      setPriceLoading(false);
    }
  }, [searchParams, selectedFilters.brands, selectedFilters.minPrice, selectedFilters.maxPrice, localMinPrice, localMaxPrice]);

  // FIXED: Initialize price inputs from URL params only when they change
  useEffect(() => {
    if (selectedFilters.minPrice !== undefined) {
      setLocalMinPrice(selectedFilters.minPrice.toString());
      setTempMinPrice(selectedFilters.minPrice);
    } else if (priceRangeInitialized) {
      setTempMinPrice(priceRange.min);
    }
    
    if (selectedFilters.maxPrice !== undefined) {
      setLocalMaxPrice(selectedFilters.maxPrice.toString());
      setTempMaxPrice(selectedFilters.maxPrice);
    } else if (priceRangeInitialized) {
      setTempMaxPrice(priceRange.max);
    }
  }, [selectedFilters.minPrice, selectedFilters.maxPrice, priceRange.min, priceRange.max, priceRangeInitialized]);

  // FIXED: Clear price filters and reset range when category changes
  useEffect(() => {
    const categoryFromUrl = searchParams.get("category");
    
    if (categoryFromUrl) {
      
      // Clear local price state
      setLocalMinPrice("");
      setLocalMaxPrice("");
      
      // Reset price range initialization
      setPriceRangeInitialized(false);
      
      // Clear URL price params when category changes
      const params = new URLSearchParams(searchParams);
      params.delete("minPrice");
      params.delete("maxPrice");
      
      if (params.toString() !== searchParams.toString()) {
        setSearchParams(params);
      }
      
      // Fetch new price range for this category
      setTimeout(() => {
        fetchPriceRange();
      }, 100); // Small delay to ensure state is updated
    }
  }, [searchParams.get("category")]); // Watch category changes in URL

  // FIXED: Initial price range fetch on mount
  useEffect(() => {
    if (!priceRangeInitialized) {
      const categoryFromUrl = searchParams.get("category");
      fetchPriceRange();
    }
  }, []); // Only run on mount

  // FIXED: Separate effect for brand changes - only refetch if already initialized
  useEffect(() => {
    if (priceRangeInitialized && selectedFilters.brands.length > 0) {
      // Debounce the price range fetch when brands change
      const timeoutId = setTimeout(() => {
        fetchPriceRange();
      }, 300);
      
      return () => clearTimeout(timeoutId);
    }
  }, [selectedFilters.brands, priceRangeInitialized]);

  // NEW: Check if filters are still loading
// NEW: Check if filters are still loading
const areFiltersLoading = useMemo(() => {
  return loading || filtersLoading || priceLoading || 
         (filterOptions.brands.length === 0 && filterOptions.specs.length === 0 && !priceRangeInitialized);
}, [loading, filtersLoading, priceLoading, filterOptions.brands.length, filterOptions.specs.length, priceRangeInitialized]);
  const hasActiveSpecFilters = useMemo(() => {
    return Object.keys(selectedFilters.specs).length > 0;
  }, [selectedFilters.specs]);

  // Check if there are active price filters
  const hasActivePriceFilters = useMemo(() => {
    return (
      selectedFilters.minPrice !== undefined ||
      selectedFilters.maxPrice !== undefined
    );
  }, [selectedFilters.minPrice, selectedFilters.maxPrice]);

  // NEW: Check if temp values differ from applied values
  const hasPendingPriceChanges = useMemo(() => {
    const currentMin = selectedFilters.minPrice;
    const currentMax = selectedFilters.maxPrice;
    
    // If no URL params exist, compare with range defaults
    const appliedMin = currentMin !== undefined ? currentMin : priceRange.min;
    const appliedMax = currentMax !== undefined ? currentMax : priceRange.max;
    
    return tempMinPrice !== appliedMin || tempMaxPrice !== appliedMax;
  }, [tempMinPrice, tempMaxPrice, selectedFilters.minPrice, selectedFilters.maxPrice, priceRange.min, priceRange.max]);

  // NEW: Check if there are any active non-spec filters for a given spec
  const hasActiveNonSpecFilters = useCallback(
    (currentSpecName: string) => {
      // Check if there are any brand filters
      const hasBrandFilters = selectedFilters.brands.length > 0;

      // Check if there are any other spec filters (excluding the current spec)
      const hasOtherSpecFilters = Object.keys(selectedFilters.specs).some(
        (specName) => specName !== currentSpecName
      );

      // Check if there are price filters
      const hasPriceFilters = hasActivePriceFilters;

      return hasBrandFilters || hasOtherSpecFilters || hasPriceFilters;
    },
    [selectedFilters.brands, selectedFilters.specs, hasActivePriceFilters]
  );

  // Calculate actual product counts for selected filters (only for display)
  const actualCounts = useMemo(() => {
    if (filteredProducts.length === 0)
      return { brands: new Map(), specs: new Map() };

    const brandCounts = new Map<string, number>();
    const specCounts = new Map<string, Map<string, number>>();

    filteredProducts.forEach((product) => {
      // Count brands in current filtered results
      if (product.brand) {
        const brandKey =
          typeof product.brand === "string"
            ? product.brand
            : product.brand.slug || product.brand._id;
        brandCounts.set(brandKey, (brandCounts.get(brandKey) || 0) + 1);
      }

      // Count specs in current filtered results - exact string matching
      if (product.specifications && Array.isArray(product.specifications)) {
        product.specifications.forEach((spec) => {
          if (spec.name && spec.value && spec.value.trim() !== "") {
            // FIXED: Use exact string values without any splitting or modification
            const specName = spec.name.trim();
            const specValue = spec.value; // Keep original value exactly as is

            if (!specCounts.has(specName)) {
              specCounts.set(specName, new Map());
            }
            const valueMap = specCounts.get(specName)!;
            valueMap.set(specValue, (valueMap.get(specValue) || 0) + 1);
          }
        });
      }
    });

    return { brands: brandCounts, specs: specCounts };
  }, [filteredProducts]);

  // NEW: Sort specifications with priority for RAM and Storage
  const sortedSpecs = useMemo(() => {
    const prioritySpecs = [
      "RAM",
      "Storage",
      "Battery Life",
      "Front Camera",
      "Rear Camera",
      "Screen Size",
      "Processor",
      "Dimensions",
      "",
    ];

    const sortedSpecsList = [...filterOptions.specs].sort((a, b) => {
      const aIsPriority = prioritySpecs.some((priority) =>
        a.name.toLowerCase().includes(priority.toLowerCase())
      );
      const bIsPriority = prioritySpecs.some((priority) =>
        b.name.toLowerCase().includes(priority.toLowerCase())
      );

      if (aIsPriority && !bIsPriority) return -1;
      if (!aIsPriority && bIsPriority) return 1;

      // If both are priority specs, sort by priority order
      if (aIsPriority && bIsPriority) {
        const aIndex = prioritySpecs.findIndex((priority) =>
          a.name.toLowerCase().includes(priority.toLowerCase())
        );
        const bIndex = prioritySpecs.findIndex((priority) =>
          b.name.toLowerCase().includes(priority.toLowerCase())
        );
        return aIndex - bIndex;
      }

      // For non-priority specs, sort alphabetically
      return a.name.localeCompare(b.name);
    });

    return sortedSpecsList;
  }, [filterOptions.specs]);

  // FIXED: Function to determine which count to show for brands
  const getBrandDisplayCount = useCallback(
    (brand: any) => {
      const currentCount = actualCounts.brands.get(brand.slug) || 0;

      // If there are active spec filters, show the current count
      // If only brand filters are active (or no filters), show the initial productCount
      if (hasActiveSpecFilters || hasActivePriceFilters) {
        return currentCount;
      } else {
        return brand.productCount;
      }
    },
    [actualCounts.brands, hasActiveSpecFilters, hasActivePriceFilters]
  );

  // FIXED: Function to determine if a brand should be disabled
  const isBrandDisabled = useCallback(
    (brand: any, isSelected: boolean) => {
      if (isSelected) return false; // Never disable selected brands

      // If there are active spec filters, disable if current count is 0
      // If only brand filters are active, never disable based on count
      if (hasActiveSpecFilters || hasActivePriceFilters) {
        const currentCount = actualCounts.brands.get(brand.slug) || 0;
        return currentCount === 0;
      } else {
        return false; // Don't disable when only brand filters are active
      }
    },
    [actualCounts.brands, hasActiveSpecFilters, hasActivePriceFilters]
  );

  // NEW: Function to determine which count to show for spec values
  const getSpecDisplayCount = useCallback(
    (specName: string, specValue: string, originalCount: number) => {
      const currentCount =
        actualCounts.specs.get(specName)?.get(specValue) || 0;

      // If there are active filters other than this spec type, show the current count
      // If only this spec type is filtered (or no filters), show the original count
      if (hasActiveNonSpecFilters(specName)) {
        return currentCount;
      } else {
        return originalCount;
      }
    },
    [actualCounts.specs, hasActiveNonSpecFilters]
  );

  // NEW: Function to determine if a spec value should be disabled
  const isSpecValueDisabled = useCallback(
    (specName: string, specValue: string, isSelected: boolean) => {
      if (isSelected) return false; // Never disable selected spec values

      // If there are active filters other than this spec type, disable if current count is 0
      // If only this spec type is filtered, never disable based on count
      if (hasActiveNonSpecFilters(specName)) {
        const currentCount =
          actualCounts.specs.get(specName)?.get(specValue) || 0;
        return currentCount === 0;
      } else {
        return false; // Don't disable when only this spec type is filtered
      }
    },
    [actualCounts.specs, hasActiveNonSpecFilters]
  );

  const toggleSection = useCallback((section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }, []);

  // FIXED: Properly encode URL parameters to handle special characters
  const updateURLParam = useCallback(
    (key: string, value: string | undefined) => {
      const params = new URLSearchParams(searchParams);

      if (value && value.trim() !== "") {
        // FIXED: For brand parameter with multiple values, don't encode the commas
        if (key === "brand" && value.includes(",")) {
          // For multiple brands, encode each brand individually but keep commas as separators
          const brands = value
            .split(",")
            .map((brand) => brand.trim())
            .filter(Boolean);
          const encodedBrands = brands.map((brand) =>
            encodeURIComponent(brand)
          );
          params.set(key, encodedBrands.join(","));
        } else {
          // For other parameters, encode normally
          const encodedValue = encodeURIComponent(value);
          params.set(key, encodedValue);
        }
      } else {
        params.delete(key);
      }
      params.delete("page"); // Reset to first page when filters change

      setSearchParams(params);
      onFilterChange();
    },
    [searchParams, setSearchParams, onFilterChange]
  );

  // Price filter handlers - Updated to work with temp values
  const handleMinPriceChange = useCallback((value: string) => {
    setLocalMinPrice(value);
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setTempMinPrice(numValue);
    }
  }, []);

  const handleMaxPriceChange = useCallback((value: string) => {
    setLocalMaxPrice(value);
    const numValue = Number(value);
    if (!isNaN(numValue)) {
      setTempMaxPrice(numValue);
    }
  }, []);

  // NEW: Apply price filter function
  const applyPriceFilter = useCallback(() => {
    let minVal = tempMinPrice;
    let maxVal = tempMaxPrice;

    // Validation
    if (minVal < 0) minVal = 0;
    if (maxVal < 0) maxVal = 0;
    if (minVal > maxVal) {
      // Swap values if min > max
      [minVal, maxVal] = [maxVal, minVal];
      setTempMinPrice(minVal);
      setTempMaxPrice(maxVal);
      setLocalMinPrice(minVal.toString());
      setLocalMaxPrice(maxVal.toString());
    }

    console.log('Applying price filter:', { minVal, maxVal, tempMinPrice, tempMaxPrice });

    // Apply filters immediately with the current temp values
    const params = new URLSearchParams(searchParams);
    
    // Always set both values
    params.set("minPrice", minVal.toString());
    params.set("maxPrice", maxVal.toString());
    
    // Reset to first page when filters change
    params.delete("page");
    
    setSearchParams(params);
    onFilterChange();
  }, [tempMinPrice, tempMaxPrice, searchParams, setSearchParams, onFilterChange]);

  // Updated slider change handler to work with temp values
  const handleSliderChange = useCallback(
    (min: number, max: number) => {
      // Ensure values are within bounds
      const boundedMin = Math.max(priceRange.min, Math.min(min, priceRange.max));
      const boundedMax = Math.max(priceRange.min, Math.min(max, priceRange.max));
      
      setTempMinPrice(boundedMin);
      setTempMaxPrice(boundedMax);
      setLocalMinPrice(boundedMin.toString());
      setLocalMaxPrice(boundedMax.toString());
    },
    [priceRange.min, priceRange.max]
  );

  const handleBrandChange = useCallback(
    (brandSlug: string, isChecked: boolean) => {
      const newBrands = isChecked
        ? [...selectedFilters.brands, brandSlug]
        : selectedFilters.brands.filter((b) => b !== brandSlug);

      updateURLParam(
        "brand",
        newBrands.length > 0 ? newBrands.join(",") : undefined
      );
    },
    [selectedFilters.brands, updateURLParam]
  );

  // FIXED: Handle spec changes properly - treat entire value as one filter
  const handleSpecChange = useCallback(
    (specName: string, specValue: string, isChecked: boolean) => {
      if (isChecked) {
        // FIXED: Set the spec value directly as a single string - encoding handled by updateURLParam
        updateURLParam(specName, specValue);
      } else {
        // Remove the spec filter entirely
        updateURLParam(specName, undefined);
      }
    },
    [updateURLParam]
  );

  const handleClearAll = useCallback(() => {
    const params = new URLSearchParams();

    // Keep only category and search params
    if (searchParams.get("category"))
      params.set("category", searchParams.get("category")!);
    if (searchParams.get("search"))
      params.set("search", searchParams.get("search")!);

    setSearchParams(params);
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setTempMinPrice(priceRange.min);
    setTempMaxPrice(priceRange.max);
    onFilterChange();
  }, [searchParams, setSearchParams, onFilterChange, priceRange.min, priceRange.max]);

  const clearPriceFilter = useCallback(() => {
    setLocalMinPrice("");
    setLocalMaxPrice("");
    setTempMinPrice(priceRange.min);
    setTempMaxPrice(priceRange.max);
    updateURLParam("minPrice", undefined);
    updateURLParam("maxPrice", undefined);
  }, [updateURLParam, priceRange.min, priceRange.max]);

  const hasActiveFilters =
    selectedFilters.brands.length > 0 ||
    Object.keys(selectedFilters.specs).length > 0 ||
    hasActivePriceFilters;

  // Auto-expand sections that have active filters
  useEffect(() => {
    const newExpanded = { ...expandedSections };

    // Expand brands section if any brands are selected
    if (selectedFilters.brands.length > 0) {
      newExpanded.brands = true;
    }

    // Expand price section if price filters are active
    if (hasActivePriceFilters) {
      newExpanded.price = true;
    }

    // Expand spec sections that have active selections
    Object.keys(selectedFilters.specs).forEach((specName) => {
      if (selectedFilters.specs[specName]) {
        newExpanded[`spec-${specName}`] = true;
      }
    });

    setExpandedSections(newExpanded);
  }, [selectedFilters, hasActivePriceFilters]);

  // FIXED: Helper function to check if a spec value is selected (exact string comparison)
  const isSpecValueSelected = useCallback(
    (specName: string, specValue: string): boolean => {
      const selectedValue = selectedFilters.specs[specName];
      if (!selectedValue) return false;

      // FIXED: Exact string comparison - no trimming or modification
      return selectedValue === specValue;
    },
    [selectedFilters.specs]
  );

  // NEW: Helper function to determine if a spec is priority (RAM/Storage)
  const isPrioritySpec = useCallback((specName: string): boolean => {
    const prioritySpecs = [
      "RAM",
      "Storage",
      "Memory",
      "Hard Drive",
      "SSD",
      "HDD",
    ];
    return prioritySpecs.some((priority) =>
      specName.toLowerCase().includes(priority.toLowerCase())
    );
  }, []);

  return (
    <div className={`bg-white p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Filters</h2>
        {hasActiveFilters && (
          <button
            onClick={handleClearAll}
            className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors"
          >
            <X size={14} />
            Clear all
          </button>
        )}
      </div>

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-orange-50 rounded-md">
          <div className="flex flex-wrap gap-1">
            {selectedFilters.brands.map((brand) => {
              const brandData = filterOptions.brands.find(
                (b) => b.slug === brand
              );
              return (
                <span
                  key={brand}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full"
                >
                  {brandData?.name || brand}
                  <button
                    onClick={() => handleBrandChange(brand, false)}
                    className="hover:bg-orange-200 rounded-full p-0.5"
                  >
                    <X size={10} />
                  </button>
                </span>
              );
            })}

            {/* Price filter tags */}
            {hasActivePriceFilters && (
              <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                Price: Ksh {selectedFilters.minPrice || priceRange.min} - Ksh&nbsp;
                {selectedFilters.maxPrice || priceRange.max}
                <button
                  onClick={clearPriceFilter}
                  className="hover:bg-green-200 rounded-full p-0.5"
                >
                  <X size={10} />
                </button>
              </span>
            )}

            {/* FIXED: Display selected specs with exact values */}
            {Object.entries(selectedFilters.specs).map(([specName, value]) => (
              <span
                key={`${specName}-${value}`}
                className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full max-w-xs"
                title={`${specName}: ${value}`} // Show full value on hover
              >
                <span className="truncate">
                  {specName}:{" "}
                  {value.length > 20 ? `${value.substring(0, 20)}...` : value}
                </span>
                <button
                  onClick={() => handleSpecChange(specName, value, false)}
                  className="hover:bg-blue-200 rounded-full p-0.5 flex-shrink-0"
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Price Filter */}
      <div className="mb-6 border-b pb-4">
        <button
          className="flex justify-between items-center w-full text-left font-medium py-2"
          onClick={() => toggleSection("price")}
        >
          <span className="flex items-center gap-2">
            Price Range
            {hasActivePriceFilters && (
              <span className="bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                Active
              </span>
            )}
            {hasPendingPriceChanges && (
              <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                Pending
              </span>
            )}
          </span>
          {expandedSections["price"] ? (
            <ChevronUp size={18} />
          ) : (
            <ChevronDown size={18} />
          )}
        </button>

        {expandedSections["price"] && (
          <div className="mt-4 space-y-4">
            {priceLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                <span className="ml-2 text-sm text-gray-600">Loading price range...</span>
              </div>
            ) : (
              <>
                {/* Price Range Slider */}
                <div className="px-2">
                  <PriceSlider
                    min={priceRange.min}
                    max={priceRange.max}
                    currentMin={tempMinPrice}
                    currentMax={tempMaxPrice}
                    onChange={handleSliderChange}
                  />
                </div>

                {/* Price Input Fields */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Min Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        Ksh&nbsp;
                      </span>
                      <input
                        type="number"
                        min="0"
                        max={priceRange.max}
                        value={localMinPrice}
                        onChange={(e) => handleMinPriceChange(e.target.value)}
                        placeholder={priceRange.min.toString()}
                        className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Max Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                        Ksh&nbsp;
                      </span>
                      <input
                        type="number"
                        min={priceRange.min}
                        max={priceRange.max}
                        value={localMaxPrice}
                        onChange={(e) => handleMaxPriceChange(e.target.value)}
                        placeholder={priceRange.max.toString()}
                        className="w-full pl-10 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Apply Button - NEW */}
                {hasPendingPriceChanges && (
                  <div className="flex justify-center">
                    <button
                      onClick={applyPriceFilter}
                      className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md font-medium transition-colors flex items-center gap-2"
                    >
                      Apply Price Filter
                    </button>
                  </div>
                )}

                {/* Price Range Display */}
                <div className="text-center text-sm text-gray-600">
                  {searchParams.get("category") ? (
                    <>Available range: Ksh {priceRange.min.toLocaleString()} - Ksh {priceRange.max.toLocaleString()}</>
                  ) : (
                    <>Available range: Ksh {priceRange.min.toLocaleString()} - Ksh {priceRange.max.toLocaleString()}</>
                  )}
                </div>

                {/* Clear Price Filter */}
                {hasActivePriceFilters && (
                  <div className="flex justify-center">
                    <button
                      onClick={clearPriceFilter}
                      className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                    >
                      <X size={12} />
                      Clear Price Filter
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Brands filter */}
      {filterOptions.brands.length > 0 ? (
        <div className="mb-6 border-b pb-4">
          <button
            className="flex justify-between items-center w-full text-left font-medium py-2"
            onClick={() => toggleSection("brands")}
          >
            <span className="flex items-center gap-2">
              Brands
              {selectedFilters.brands.length > 0 && (
                <span className="bg-orange-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                  {selectedFilters.brands.length}
                </span>
              )}
            </span>
            {expandedSections["brands"] ? (
              <ChevronUp size={18} />
            ) : (
              <ChevronDown size={18} />
            )}
          </button>

          {expandedSections["brands"] && (
            <div className="mt-2 space-y-2">
              {filterOptions.brands.map((brand) => {
                const isSelected = selectedFilters.brands.includes(brand.slug);
                const displayCount = getBrandDisplayCount(brand);
                const isDisabled = isBrandDisabled(brand, isSelected);

                return (
                  <div
                    key={brand._id}
                    className={`flex items-center ${
                      isDisabled ? "opacity-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      id={`brand-${brand.slug}`}
                      checked={isSelected}
                      onChange={(e) =>
                        handleBrandChange(brand.slug, e.target.checked)
                      }
                      disabled={isDisabled}
                      className="h-4 w-4 text-orange-500 rounded border-gray-300 focus:ring-orange-500 disabled:cursor-not-allowed"
                    />
                    <label
                      htmlFor={`brand-${brand.slug}`}
                      className={`ml-2 text-sm cursor-pointer ${
                        isDisabled ? "cursor-not-allowed" : "text-gray-700"
                      }`}
                    >
                      {brand.name} ({displayCount})
                    </label>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : areFiltersLoading ? (
        <div className="mb-6 border-b pb-4">
          <div className="flex items-center gap-2 font-medium py-2">
            <span>Brands</span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-sm text-gray-600">Loading brands...</span>
          </div>
        </div>
      ) : null}

      {/* Specifications filters - using sorted specs with priority for RAM and Storage */}
      {sortedSpecs.length > 0 ? (
        sortedSpecs.map((spec) => {
          const selectedSpecValue = selectedFilters.specs[spec.name] || "";
          const isPriority = isPrioritySpec(spec.name);

          return (
            <div
              key={spec.name}
              className={`mb-6 border-b pb-4 ${isPriority ? "" : ""}`}
            >
              <button
                className="flex justify-between items-center w-full text-left font-medium py-2"
                onClick={() => toggleSection(`spec-${spec.name}`)}
              >
                <span className="flex items-center gap-2">
                  {spec.name}
                  {selectedSpecValue && (
                    <span className="bg-blue-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                      1
                    </span>
                  )}
                </span>
                {expandedSections[`spec-${spec.name}`] ? (
                  <ChevronUp size={18} />
                ) : (
                  <ChevronDown size={18} />
                )}
              </button>

              {expandedSections[`spec-${spec.name}`] && (
                <div className="mt-2 space-y-2">
                  {spec.values.map((valueData, index) => {
                    const specValue = valueData.value;
                    const isSelected = isSpecValueSelected(spec.name, specValue);
                    const displayCount = getSpecDisplayCount(
                      spec.name,
                      specValue,
                      valueData.count
                    );
                    const isDisabled = isSpecValueDisabled(
                      spec.name,
                      specValue,
                      isSelected
                    );

                    return (
                      <div
                        key={`${spec.name}-${index}`}
                        className={`flex items-start ${
                          isDisabled ? "opacity-50" : ""
                        }`}
                      >
                        <input
                          type="radio"
                          name={`spec-${spec.name}`}
                          id={`${spec.name}-${index}`}
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) {
                              // FIXED: Pass the exact spec value without any modification
                              handleSpecChange(spec.name, specValue, true);
                            }
                          }}
                          disabled={isDisabled}
                          className="h-4 w-4 text-blue-500 border-gray-300 focus:ring-blue-500 disabled:cursor-not-allowed mt-0.5 flex-shrink-0"
                        />
                        <label
                          htmlFor={`${spec.name}-${index}`}
                          className={`ml-2 text-sm cursor-pointer leading-relaxed ${
                            isDisabled ? "cursor-not-allowed" : "text-gray-700"
                          }`}
                          title={specValue} // Show full value on hover
                        >
                          <span className="block break-words">
                            {specValue} ({displayCount})
                          </span>
                        </label>
                      </div>
                    );
                  })}

                  {/* Clear option for each spec */}
                  {selectedSpecValue && (
                    <div className="flex items-center border-t pt-2 mt-2">
                      <button
                        onClick={() =>
                          handleSpecChange(spec.name, selectedSpecValue, false)
                        }
                        className="text-sm text-red-600 hover:text-red-800 flex items-center gap-1"
                      >
                        <X size={12} />
                        Clear {spec.name}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })
      ) : areFiltersLoading ? (
        <div className="mb-6 border-b pb-4">
          <div className="flex items-center gap-2 font-medium py-2">
            <span>Specifications</span>
          </div>
          <div className="flex items-center justify-center py-4">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
            <span className="ml-2 text-sm text-gray-600">Loading specifications...</span>
          </div>
        </div>
      ) : null}

      {/* Show message when no filters available */}
      {!areFiltersLoading && 
       filterOptions.brands.length === 0 &&
       filterOptions.specs.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <p className="text-sm">
              No filters available for current selection
            </p>
          </div>
        )}
    </div>
  );
};

// FIXED: Improved Price Slider Component with better bounds checking
interface PriceSliderProps {
  min: number;
  max: number;
  currentMin: number;
  currentMax: number;
  onChange: (min: number, max: number) => void;
}

const PriceSlider: React.FC<PriceSliderProps> = ({
  min,
  max,
  currentMin,
  currentMax,
  onChange,
}) => {
  const [isDragging, setIsDragging] = useState<"min" | "max" | null>(null);
  const sliderRef = React.useRef<HTMLDivElement>(null);

  const getPercentage = useCallback(
    (value: number) => {
      if (max <= min) return 0;
      return Math.max(0, Math.min(100, ((value - min) / (max - min)) * 100));
    },
    [min, max]
  );

  const getValue = useCallback(
    (percentage: number) => {
      if (max <= min) return min;
      return Math.round(min + (Math.max(0, Math.min(100, percentage)) / 100) * (max - min));
    },
    [min, max]
  );

  const handleMouseDown = useCallback(
    (handle: "min" | "max") => (e: React.MouseEvent) => {
      e.preventDefault();
      setIsDragging(handle);
    },
    []
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = ((e.clientX - rect.left) / rect.width) * 100;
      const value = getValue(percentage);

      if (isDragging === "min") {
        const newMin = Math.min(value, currentMax - 1);
        const boundedMin = Math.max(min, Math.min(max, newMin));
        onChange(boundedMin, currentMax);
      } else {
        const newMax = Math.max(value, currentMin + 1);
        const boundedMax = Math.max(min, Math.min(max, newMax));
        onChange(currentMin, boundedMax);
      }
    },
    [isDragging, getValue, currentMin, currentMax, min, max, onChange]
  );

  const handleMouseUp = useCallback(() => {
    setIsDragging(null);
  }, []);

  const handleTouchStart = useCallback(
    (handle: "min" | "max") => (e: React.TouchEvent) => {
      e.preventDefault();
      setIsDragging(handle);
    },
    []
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDragging || !sliderRef.current) return;

      const touch = e.touches[0];
      const rect = sliderRef.current.getBoundingClientRect();
      const percentage = ((touch.clientX - rect.left) / rect.width) * 100;
      const value = getValue(percentage);

      if (isDragging === "min") {
        const newMin = Math.min(value, currentMax - 1);
        const boundedMin = Math.max(min, Math.min(max, newMin));
        onChange(boundedMin, currentMax);
      } else {
        const newMax = Math.max(value, currentMin + 1);
        const boundedMax = Math.max(min, Math.min(max, newMax));
        onChange(currentMin, boundedMax);
      }
    },
    [isDragging, getValue, currentMin, currentMax, min, max, onChange]
  );

  const handleTouchEnd = useCallback(() => {
    setIsDragging(null);
  }, []);

  // Add event listeners
  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.addEventListener("touchmove", handleTouchMove, { passive: false });
      document.addEventListener("touchend", handleTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    isDragging,
    handleMouseMove,
    handleMouseUp,
    handleTouchMove,
    handleTouchEnd,
  ]);

  // FIXED: Better bounds checking for percentages
  const minPercentage = getPercentage(currentMin);
  const maxPercentage = getPercentage(currentMax);

  if (max <= min) {
    return (
      <div className="text-sm text-gray-500 text-center py-4">
        Price range not available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div
        ref={sliderRef}
        className="relative h-6 cursor-pointer"
        role="slider"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={currentMin}
        aria-valuetext={`${currentMin} to ${currentMax}`}
        tabIndex={0}
      >
        {/* Slider Track */}
        <div className="absolute top-1/2 transform -translate-y-1/2 w-full h-2 bg-gray-200 rounded-full" />

        {/* Active Range */}
        <div
          className="absolute top-1/2 transform -translate-y-1/2 h-2 bg-orange-500 rounded-full"
          style={{
            left: `${minPercentage}%`,
            width: `${Math.max(0, maxPercentage - minPercentage)}%`,
          }}
        />

        {/* Min Handle */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-orange-500 rounded-full cursor-grab shadow-sm transition-shadow ${
            isDragging === "min"
              ? "shadow-lg cursor-grabbing"
              : "hover:shadow-md"
          }`}
          style={{ left: `${minPercentage}%` }}
          onMouseDown={handleMouseDown("min")}
          onTouchStart={handleTouchStart("min")}
          role="slider"
          aria-valuemin={min}
          aria-valuemax={currentMax - 1}
          aria-valuenow={currentMin}
          aria-label="Minimum price"
          tabIndex={0}
        />

        {/* Max Handle */}
        <div
          className={`absolute top-1/2 transform -translate-y-1/2 -translate-x-1/2 w-5 h-5 bg-white border-2 border-orange-500 rounded-full cursor-grab shadow-sm transition-shadow ${
            isDragging === "max"
              ? "shadow-lg cursor-grabbing"
              : "hover:shadow-md"
          }`}
          style={{ left: `${maxPercentage}%` }}
          onMouseDown={handleMouseDown("max")}
          onTouchStart={handleTouchStart("max")}
          role="slider"
          aria-valuemin={currentMin + 1}
          aria-valuemax={max}
          aria-valuenow={currentMax}
          aria-label="Maximum price"
          tabIndex={0}
        />
      </div>

      {/* Price Display */}
      <div className="flex justify-between text-sm text-gray-600">
        <span>Ksh {currentMin.toLocaleString()}</span>
        <span>Ksh {currentMax.toLocaleString()}</span>
      </div>
    </div>
  );
};

export default FilterSidebar;