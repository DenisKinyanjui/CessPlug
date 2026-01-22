import React from "react";
import { Link } from "react-router-dom";
import { Phone } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";

const TopStrip: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <div className="bg-gray-900 text-white py-2 px-4">
      <div className="container mx-auto flex justify-between items-center text-sm">
        <span className="truncate max-w-[220px] sm:max-w-none">
          {isAuthenticated && user
            ? `Welcome ${user.name}`
            : "Welcome to CessPlug"}
        </span>
        <div className="flex items-center space-x-4 sm:space-x-6">
          <div className="w-px h-5 bg-gray-300 " />
          <Link
            to="/profile?section=orders"
            className="hover:text-orange-400 transition-colors whitespace-nowrap"
          >
            Track Order
          </Link>
          <div className="w-px h-5 bg-gray-300" />

          <Link
            to="/products?deals=flash"
            className="hover:text-orange-400 transition-colors whitespace-nowrap hidden sm:block"
          >
            All Offers
          </Link>
          <div className="w-px h-5 bg-gray-300 hidden sm:block" />

          <div className="hidden sm:flex items-center space-x-2 text-white whitespace-nowrap">
            <span className="text-sm">Need Help?</span>
            <Phone className="h-4 w-4" />
            <span className="text-sm text-orange-300 hover:text-orange-500">
              0757-181-216
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopStrip;