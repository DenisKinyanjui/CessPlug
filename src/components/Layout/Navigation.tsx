import React, { useRef, useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useCategories } from '../../hooks/useCategories';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';

const Navigation: React.FC = () => {
  const { categories, loading, error } = useCategories();
  const location = useLocation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const isActive = (slug: string) => {
    return location.pathname.includes(`/products`) && 
           location.search.includes(`category=${slug}`);
  };

  const checkForOverflow = () => {
    if (scrollContainerRef.current) {
      const { scrollWidth, clientWidth, scrollLeft } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth);
    }
  };

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: -200,
        behavior: 'smooth'
      });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: 200,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(checkForOverflow);
    resizeObserver.observe(container);

    container.addEventListener('scroll', checkForOverflow);

    // Initial check
    checkForOverflow();

    return () => {
      resizeObserver.unobserve(container);
      container.removeEventListener('scroll', checkForOverflow);
    };
  }, [categories]);

  if (loading) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-4">
            <div className="text-gray-500">Loading categories...</div>
          </div>
        </div>
      </nav>
    );
  }

  if (error) {
    return (
      <nav className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center py-4">
            <div className="text-red-500">{error}</div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-gray-50 border-b border-gray-200 relative">  
      <div className="container mx-auto px-4 mt-2">
        <div className="flex items-center justify-between">
          {/* Desktop Navigation with Conditional Scroll Arrows */}
          <div className="hidden md:flex items-center w-full">
            {showLeftArrow && (
              <button 
                onClick={scrollLeft}
                className="p-2 rounded-full hover:bg-gray-200 mr-1 focus:outline-none focus:ring-2 focus:ring-[#F86718] transition-opacity duration-200"
                aria-label="Scroll categories left"
              >
                <FiChevronLeft className="w-5 h-5" />
              </button>
            )}
            
            <div 
              ref={scrollContainerRef}
              className="flex overflow-x-hidden space-x-2 flex-1 py-2 scroll-smooth"
            >
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category.slug}`}
                  className={`flex-shrink-0 inline-flex items-center py-2 px-4 transition-colors font-medium rounded-[96px] focus:outline-none focus:ring-2 focus:ring-[#F86718] focus:ring-opacity-50 ${
                    isActive(category.slug)
                      ? 'bg-[#F86718] text-white hover:text-white'
                      : 'text-gray-800 hover:bg-black hover:text-white'
                  }`}
                  aria-label={`View all ${category.name} products`}
                >
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
            
            {showRightArrow && (
              <button 
                onClick={scrollRight}
                className="p-2 rounded-full hover:bg-gray-200 ml-1 focus:outline-none focus:ring-2 focus:ring-[#F86718] transition-opacity duration-200"
                aria-label="Scroll categories right"
              >
                <FiChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
          
          {/* Mobile Navigation - Horizontally Scrollable */}
          <div className="md:hidden w-full py-3">
            <div 
              className="flex overflow-x-auto space-x-2 scrollbar-hide"
              style={{ 
                WebkitOverflowScrolling: 'touch',
                scrollbarWidth: 'none',
                msOverflowStyle: 'none'
              }}
            >
              {categories.map((category) => (
                <Link
                  key={category._id}
                  to={`/products?category=${category.slug}`}
                  className={`flex-shrink-0 inline-flex items-center py-2 px-4 transition-colors font-medium rounded-[96px] focus:outline-none focus:ring-2 focus:ring-[#F86718] focus:ring-opacity-50 whitespace-nowrap ${
                    isActive(category.slug)
                      ? 'bg-[#F86718] text-white hover:text-white'
                      : 'text-gray-800 hover:bg-black hover:text-white'
                  }`}
                  aria-label={`View all ${category.name} products`}
                >
                  <span>{category.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;