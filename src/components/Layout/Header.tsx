import React, { useState, useRef, useEffect } from "react";
import {
  ShoppingCart,
  User,
  Menu,
  ChevronDown,
  LogOut,
  UserCircle,
  Gift,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../../store/store";
import { setSearchQuery } from "../../store/slices/productSlice";
import { useAuth } from "../../contexts/AuthContext";
import SearchBar from "./SearchBar";

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const dispatch = useDispatch();
  const { totalQuantity } = useSelector((state: RootState) => state.cart);
  const { isAuthenticated, logout } = useAuth();
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query));
  };

  const handleLogout = () => {
    logout();
    setIsProfileDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setIsProfileDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
  <header className="bg-white sticky top-0 z-50 border-b">
    <div className="container mx-auto px-4 py-4">
      {/* Top Row */}
      <div className="flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <img src="/images/logo.png" alt="logo" className="h-14" />
          {/* <span className="font-montserrat text-lg font-bold">CessPlug</span> */}
        </Link>

        {/* Search - desktop only */}
        <div className="hidden md:flex flex-1 max-w-2xl mx-8">
          <SearchBar
            onSearch={handleSearch}
            placeholder="Search phones, laptops, home appliances and more..."
            className="w-full"
            showAutocomplete={true}
          />
        </div>

        

        {/* Actions */}
        <div className="flex items-center space-x-4">
          {/* Menu icon - mobile only */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden"
          >
            <Menu size={24} />
          </button>

          {/* Authenticated Profile - desktop only */}
          {isAuthenticated ? (
            <div
              className="relative hidden md:block"
              ref={profileDropdownRef}
            >
              <button
                onClick={() =>
                  setIsProfileDropdownOpen(!isProfileDropdownOpen)
                }
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500 transition-colors"
              >
                <User size={20} />
                <span>Profile</span>
                <ChevronDown
                  size={16}
                  className={`transform transition-transform ${
                    isProfileDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 border border-gray-200 z-50">
                  <Link
                    to="/profile"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <UserCircle size={18} />
                    <span>My Profile</span>
                  </Link>
                  <Link
                    to="/chamas"
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsProfileDropdownOpen(false)}
                  >
                    <Gift size={18} />
                    <span>My Chamas</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 text-left"
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="hidden md:flex flex-row gap-2">
              <Link
                to="/auth/signup"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
              >
                <User size={20} />
                <span>Sign Up</span>
              </Link>
              <div className="w-px h-6 bg-gray-300" />
              <Link
                to="/auth/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
              >
                <User size={20} />
                <span>Login</span>
              </Link>
            </div>
          )}

          {/* Cart */}
          <Link
            to="/cart"
            className="relative flex items-center space-x-2 text-gray-700 hover:text-orange-500"
          >
            <ShoppingCart size={20} />
            <span className="hidden md:inline">Cart</span>
            {totalQuantity > 0 && (
              <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {totalQuantity}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Mobile Search */}
      <div className="md:hidden mt-4">
        <SearchBar
          onSearch={handleSearch}
          placeholder="Search products..."
          className="w-full"
          showAutocomplete={true}
        />
      </div>

      {/* Mobile Dropdown Menu */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 bg-white rounded-lg shadow border px-4 py-4 space-y-4">
          <Link
            to="/"
            className="block text-gray-700 hover:text-orange-500"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            to="/cart"
            className="block text-gray-700 hover:text-orange-500"
            onClick={() => setIsMenuOpen(false)}
          >
            Cart
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/profile"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                <span>My Profile</span>
              </Link>
              <Link
                to="/chamas"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <Gift size={20} />
                <span>My Chamas</span>
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth/login"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                <span>Login</span>
              </Link>
              <Link
                to="/auth/signup"
                className="flex items-center space-x-2 text-gray-700 hover:text-orange-500"
                onClick={() => setIsMenuOpen(false)}
              >
                <User size={20} />
                <span>Sign Up</span>
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  </header>
);
};

export default Header;
