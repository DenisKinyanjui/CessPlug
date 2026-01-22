import React, { useState, useEffect } from 'react';
import ProductCard from '../Products/ProductCard';
import { useCountdown } from '../../hooks/useCountdown';
import { getFlashDeals } from '../../services/dealApi';
import { FlashDeal } from '../../types/Deal';

const TodaysDeals: React.FC = () => {
  const [flashDeals, setFlashDeals] = useState<FlashDeal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    const fetchFlashDeals = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFlashDeals();
        
        if (response.success) {
          setFlashDeals(response.data.flashDeals.slice(0, 4));
        } else {
          setError('Failed to fetch flash deals');
        }
      } catch (err) {
        console.error('Error fetching flash deals:', err);
        setError('Failed to load flash deals. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchFlashDeals();
  }, []);

  if (loading) {
    return (
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex justify-center items-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Today's Deals of the Day
            </h2>
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (flashDeals.length === 0) {
    return (
      <section className="py-8 md:py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              Today's Deals of the Day
            </h2>
            <div className="bg-orange-500 border border-yellow-400 text-white px-4 py-3 rounded">
              No flash deals available at the moment. Check back later!
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-8 md:py-12 bg-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 md:mb-8 gap-4">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
            Today's Deals of the Day
          </h2>
          
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm md:text-base text-gray-600">Deal ends in</span>
              <div className="flex gap-1 md:gap-2">
                <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                  <span className="font-bold">{days.toString().padStart(2, '0')}</span>
                  <span className="text-xs block">d</span>
                </div>
                <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                  <span className="font-bold">{hours.toString().padStart(2, '0')}</span>
                  <span className="text-xs block">h</span>
                </div>
                <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                  <span className="font-bold">{minutes.toString().padStart(2, '0')}</span>
                  <span className="text-xs block">m</span>
                </div>
                <div className="bg-orange-500 text-white px-2 md:px-3 py-1 rounded flex gap-1 text-sm">
                  <span className="font-bold">{seconds.toString().padStart(2, '0')}</span>
                  <span className="text-xs block">s</span>
                </div>
              </div>
            </div>
            <button 
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 md:px-6 py-2 rounded-lg font-semibold transition-colors text-sm md:text-base"
              onClick={() => console.log('Show all flash deals')}
            >
              VIEW ALL
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {flashDeals.map((flashDeal) => (
            <div key={flashDeal._id} className="w-full">
              <ProductCard 
                product={flashDeal.product} 
                showCountdown 
                showDiscountBadge={true}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TodaysDeals;