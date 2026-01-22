import React, { useState, useEffect } from 'react';
import { Package, Loader2 } from 'lucide-react';
import { getAllCategories } from '../../services/categoryApi';
import { Category } from '../../types/Category';

const TopCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await getAllCategories();
        
        // Filter only parent categories (no parent field) and limit to 7 for display
        const parentCategories = response.data.categories
          .filter(category => !category.parent)
          .slice(0, 7);
          
        setCategories(parentCategories);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleViewAll = () => {
    // Navigate to all categories page
    window.location.href = '/categories';
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="animate-spin h-8 w-8 text-orange-500" />
            <span className="ml-2 text-gray-600">Loading categories...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center py-8">
            <div className="text-center">
              <p className="text-red-500 mb-4">{error}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">
            SHOP FROM <span className="text-orange-500">TOP CATEGORIES</span>
          </h2>
          <button 
            onClick={handleViewAll}
            className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
          >
            VIEW ALL
          </button>
        </div>

        <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-hide">
          {categories.map((category) => (
            <a
              key={category._id}
              href={`/category/${category.slug}`}
              className="flex-shrink-0 w-32 text-center group"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-100 transition-colors overflow-hidden">
                {category.image ? (
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="w-full h-full object-cover rounded-full"
                    onError={(e) => {
                      // Fallback to icon if image fails to load
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      const iconElement = target.nextElementSibling as HTMLElement;
                      if (iconElement) {
                        iconElement.style.display = 'block';
                      }
                    }}
                  />
                ) : null}
                <div 
                  className={`text-gray-600 group-hover:text-orange-500 transition-colors ${category.image ? 'hidden' : 'block'}`}
                  style={{ display: category.image ? 'none' : 'block' }}
                >
                  <Package size={40} />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-800 group-hover:text-orange-500 transition-colors">
                {category.name}
              </span>
            </a>
          ))}
        </div>

        {categories.length === 0 && !loading && !error && (
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-600">No categories available at the moment.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default TopCategories;