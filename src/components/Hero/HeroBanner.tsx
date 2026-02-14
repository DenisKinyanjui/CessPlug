import React, { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getHeroBanners } from "../../services/bannerApi";

interface ApiBanner {
  _id: string;
  title: string;
  subtitle?: string;
  image: string;
  link?: string;
  buttonText: string;
  position: "hero" | "category" | "promotion" | "footer";
  isActive: boolean;
  startDate: string;
  endDate?: string;
  priority: number;
}

const HeroBanner: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [banners, setBanners] = useState<ApiBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoading(true);
        const response = await getHeroBanners();
        setBanners(response.data.banners);
      } catch (err) {
        setError("Failed to load banners");
        console.error("Error fetching banners:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % banners.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [banners.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  if (loading || error || banners.length === 0) {
    return (
      <div className="relative h-64 md:h-80 lg:h-96 overflow-hidden flex items-center justify-center">
        <div className={`text-${error ? "red" : "gray"}-500`}>
          {error || "Loading..."}
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[350px] overflow-hidden">
      {banners.map((banner, index) => (
        <div
          key={banner._id}
          className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
            index === currentSlide
              ? "translate-x-0"
              : index < currentSlide
              ? "-translate-x-full"
              : "translate-x-full"
          }`}
        >
          <div className="h-full w-full bg-gradient-to-r from-green-600 to-green-900 flex items-center">
           <div className="container mx-auto px-3 sm:px-4 md:px-6 lg:ml-8 lg:mr-8 flex flex-col-reverse md:flex-row items-center justify-between gap-4 h-full">
              {/* Text Section */}
              <div className="text-white z-10 flex-1 text-center md:text-left">
                <h2 className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold mb-3">
                  {banner.title}
                </h2>
                {banner.subtitle && (
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg mb-2">
                    {banner.subtitle}
                  </p>
                )}
                {banner.buttonText && (
                  <a
                    href={banner.link || "#"}
                    className="inline-block bg-white text-blue-600 px-4 sm:px-6 py-2 rounded-lg font-semibold mt-4 hover:bg-gray-100 transition-colors"
                  >
                    {banner.buttonText}
                  </a>
                )}
              </div>

              {/* Image Section */}
              <div className="flex-1 flex justify-center md:justify-end">
                <img
                  src={banner.image}
                  alt={banner.title}
                  className="max-h-32 sm:max-h-40 md:max-h-64 lg:max-h-80 object-contain rounded-md drop-shadow-xl mt-4 sm:mt-0"
                />
              </div>
            </div>

            {/* Decorative Circles */}
            <div className="absolute top-0 right-0 w-24 sm:w-32 lg:w-48 h-24 sm:h-32 lg:h-48 bg-orange-400 rounded-full opacity-20 transform translate-x-12 -translate-y-12" />
            <div className="absolute bottom-0 right-0 w-16 sm:w-24 lg:w-32 h-16 sm:h-24 lg:h-32 bg-orange-500 rounded-full opacity-30 transform translate-x-4 translate-y-4" />
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prevSlide}
        className=" absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-10"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={nextSlide}
        className=" absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full transition-colors z-10"
      >
        <ChevronRight size={20} />
      </button>

      {/* Slide Indicators */}
      <div className="hidden lg:block absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`w-3 h-3 rounded-full transition-colors ${
              index === currentSlide ? "bg-white" : "bg-white/50"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBanner;
