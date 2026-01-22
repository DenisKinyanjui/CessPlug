import React, { useState, useEffect } from "react";
import { Phone, Mail, MapPin, Instagram, Facebook, Twitter } from "lucide-react";
import { Link } from "react-router-dom";
import { getTopCategories } from "../../services/categoryApi";
import { Category } from "../../types/Category";

const Footer: React.FC = () => {
  const [topCategories, setTopCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTopCategories = async () => {
      try {
        setIsLoading(true);
        const response = await getTopCategories(6); // Fetch top 6 categories
        setTopCategories(response.data.categories);
      } catch (error) {
        console.error("Error fetching top categories:", error);
        // Fallback to hardcoded categories in case of error
        setTopCategories([
          { id: "1", name: "Computers", slug: "computers" },
          { id: "2", name: "Accessories", slug: "accessories" },
          { id: "3", name: "TVs", slug: "tvs" },
          { id: "4", name: "Phones", slug: "phones" },
          { id: "5", name: "Gaming", slug: "gaming" },
          { id: "6", name: "Home Appliances", slug: "home-appliances" },
        ] as Category[]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopCategories();
  }, []);

  // const handleBluetechClick = () => {
  //   window.open("https://www.bluetech.co.ke", "_blank", "noopener,noreferrer");
  // };

  const handleSocialClick = (platform: string, url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="p-1 flex flex-row gap-4">
                <img src="/images/logo.svg" alt="logo" className="h-16" />
              </div>
            </div>
            <div className="space-y-2 mb-6">
              <div className="flex items-center space-x-2">
                <Phone size={16} />
                <span>(+254) 757-181-216</span>
              </div>
              <div className="flex items-center space-x-2">
                <Mail size={16} />
                <span>info@cessplug.com</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin size={16} />
                <span>123 Tom Mboya Street, Naiobi, Kenya</span>
              </div>
            </div>

            {/* Social Media Links */}
            <div>
              <h4 className="text-md font-semibold mb-3">Follow Us</h4>
              <div className="flex space-x-4">
                <button
                  onClick={() => handleSocialClick("Instagram", "https://www.instagram.com/cessplug")}
                  className="p-2 bg-gray-800 rounded-full hover:bg-pink-600 transition-colors duration-200"
                  aria-label="Follow us on Instagram"
                >
                  <Instagram size={20} />
                </button>
                <button
                  onClick={() => handleSocialClick("Facebook", "https://www.facebook.com/cessplug")}
                  className="p-2 bg-gray-800 rounded-full hover:bg-blue-600 transition-colors duration-200"
                  aria-label="Follow us on Facebook"
                >
                  <Facebook size={20} />
                </button>
                <button
                  onClick={() => handleSocialClick("Twitter", "https://www.twitter.com/cessplug")}
                  className="p-2 bg-gray-800 rounded-full hover:bg-blue-400 transition-colors duration-200"
                  aria-label="Follow us on Twitter"
                >
                  <Twitter size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Top Categories - Now Dynamic */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Top Categories</h3>
            <ul className="space-y-2">
              {isLoading
                ? // Loading skeleton
                  Array.from({ length: 6 }).map((_, index) => (
                    <li key={index}>
                      <div className="h-4 bg-gray-700 rounded animate-pulse"></div>
                    </li>
                  ))
                : topCategories.map((category) => (
                    <li key={category.id || category._id}>
                      <Link
                        to={`/products?category=${category.slug}`}
                        className="hover:text-orange-400 transition-colors"
                      >
                        {category.name}
                      </Link>
                    </li>
                  ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/products"
                  className="hover:text-orange-400 transition-colors"
                >
                  Shop
                </Link>
              </li>
              {/* <li>
                <Link
                  to="/wishlist"
                  className="hover:text-orange-400 transition-colors"
                >
                  Wishlist
                </Link>
              </li> */}
              <li>
                <Link
                  to="/checkout"
                  className="hover:text-orange-400 transition-colors"
                >
                  Checkout
                </Link>
              </li>
              <li>
                <Link
                  to="/profile?section=orders"
                  className="hover:text-orange-400 transition-colors"
                >
                  Track Order
                </Link>
              </li>
              <li>
                <Link
                  to="/customer-service"
                  className="hover:text-orange-400 transition-colors"
                >
                  Customer Service
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="hover:text-orange-400 transition-colors"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Popular Tags */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Popular Tags</h3>
            <div className="flex flex-wrap gap-2">
              {[
                "iPhone",
                "MacBook",
                "Speaker",
                "Samsung",
                "Smart TV",
                "Headphones",
                "Laptop",
                "Gaming",
                "Smartphone",
                "Tablet",
              ].map((tag) => (
                <span
                  key={tag}
                  className="bg-gray-800 px-3 py-1 rounded-full text-sm hover:bg-orange-500 cursor-pointer transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 px-4 text-center text-gray-400">
          <p className="text-xs sm:text-sm text-gray-500">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-gray-300">CessPlug</span>.
            All rights reserved.
          </p>
        </div>

        {/* <div className="mt-2">
          <button
            onClick={handleBluetechClick}
            className="w-full flex items-center justify-center space-x-2 text-sm  hover:text-blue-600 transition-all duration-200 group"
          >
            <span className="font-medium text-gray-500">Developed by</span>
            <span className="font-bold text-blue-600 group-hover:text-blue-900">
              Bluetech Kenya
            </span>
            <ExternalLink className="w-3 h-3 opacity-60 group-hover:opacity-100 transition-opacity duration-200" />

          </button>
        </div> */}
      </div>
    </footer>
  );
};

export default Footer;