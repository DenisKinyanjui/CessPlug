import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import {
  ArrowLeft,
  Star,
  Heart,
  Share2,
  Plus,
  Minus,
  ShoppingCart,
  CreditCard,
  Shield,
  Truck,
  Home,
  Loader2,
  ChevronRight,
  Gift,
  AlertCircle,
} from "lucide-react";
import { addToCart } from "../store/slices/cartSlice";
import SEOHelmet from "../components/SEO/SEOHelmet";
import ProductReviews from "../components/Products/ProductReviews";
import { getProductBySlug } from "../services/productApi";
import { checkChamaEligibility } from "../services/chamaApi";
import { Product } from "../types/Product";
import { ChamaEligibility } from "../types/Chama";

const ProductDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Chama related states
  const [chamaEligibility, setChamaEligibility] = useState<ChamaEligibility | null>(null);
  const [chamaLoading, setChamaLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<"specifications" | "reviews">(
    "specifications"
  );

  // Fetch product data from API
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await getProductBySlug(id as string);

        if (response.success && response.data.product) {
          setProduct(response.data.product);
        } else {
          setError("Product not found");
        }
      } catch (err) {
        setError("Failed to fetch product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  useEffect(() => {
    if (!loading && !product && !error) {
      navigate("/");
    }
  }, [product, loading, error, navigate]);

  // Check chama eligibility - try to fetch from first group if user has any
  useEffect(() => {
    const checkEligibility = async () => {
      try {
        setChamaLoading(true);
        // In a real app, you'd fetch user's chama groups first
        // For now, we'll just mark that chama is potentially available
        // The actual eligibility check happens at checkout
        setChamaLoading(false);
      } catch (err) {
        console.log("Unable to check chama eligibility");
        setChamaLoading(false);
      }
    };

    if (product && !loading) {
      checkEligibility();
    }
  }, [product, loading]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <Loader2 className="animate-spin h-12 w-12 text-orange-600 mb-4" />
          <span className="text-gray-600">Loading product details...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield size={36} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Product Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            The product you're looking for doesn't exist or may have been
            removed.
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            Return to Home
          </Link>
        </div>
      </div>
    );
  }

  // Create product images array from API data
  const productImages =
    product.images?.length > 0
      ? product.images
      : ["https://via.placeholder.com/600x600?text=No+Image+Available"];

  const handleAddToCart = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category.name,
      })
    );
    navigate("/cart");
  };

  const handleBuyNow = () => {
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category.name,
      })
    );
    navigate("/checkout");
  };

  const handleRedeemWithChama = () => {
    // Add to cart first
    dispatch(
      addToCart({
        id: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        category: product.category.name,
      })
    );
    // Navigate to checkout with chama context
    // Note: In production, you'd pass chama group ID via location state
    navigate("/checkout", {
      state: { useChama: true },
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={18}
        className={
          i < Math.floor(rating)
            ? "text-yellow-400 fill-current"
            : "text-gray-300"
        }
      />
    ));
  };

  return (
    <>
      <SEOHelmet
        title={`${product.name} - VinkyShopping`}
        description={`Buy ${product.name} online at best price. ${product.category.name} with ${product.rating} star rating. Free delivery and secure payment.`}
        keywords={`${product.name}, ${product.brand.name}, ${product.category.name}, electronics, online shopping`}
      />

      <div className="min-h-screen bg-gray-50 pb-20 sm:pb-0">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column - Made sticky */}
            <div className="lg:sticky lg:top-20 lg:self-start lg:overflow-y-auto">
              <div className="space-y-4 mb-2">
                {/* Main Image */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden flex items-center justify-center p-4">
                  <img
                    src={productImages[selectedImage]}
                    alt={product.name}
                    className="w-full h-auto max-h-[300px] object-contain"
                  />
                </div>

                {/* Thumbnail Images */}
                <div className="grid grid-cols-4 gap-3">
                  {productImages.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedImage(index)}
                      className={`bg-white rounded-lg overflow-hidden border transition-all aspect-square flex items-center justify-center p-1 max-h-[150px] ${
                        selectedImage === index
                          ? "border-orange-500 shadow-sm ring-2 ring-orange-200"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${product.name} view ${index + 1}`}
                        className="w-full h-full object-contain"
                      />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Product Details (scrollable) */}
            <div className="space-y-6">
              {/* Navigation */}
              <div className="flex flex-col space-y-4 mb-8">
                {/* <button
                  onClick={() => navigate(-1)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group self-start"
                >
                  <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all group-hover:bg-gray-50">
                    <ArrowLeft size={20} />
                  </div>
                  <span className="font-medium hidden sm:inline">Back</span>
                </button> */}

                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-600">
                  <Link
                    to="/"
                    className="hover:text-orange-600 transition-colors flex items-center"
                  >
                    <Home size={16} className="mr-1" />
                    Home
                  </Link>
                  <ChevronRight size={16} className="mx-1 text-gray-400" />
                  <Link
                    to={`/products?category=${product.category.slug}`}
                    className="hover:text-orange-600 transition-colors"
                  >
                    {product.category.name}
                  </Link>
                  <ChevronRight size={16} className="mx-1 text-gray-400" />
                  <span className="text-gray-800 font-medium truncate max-w-[200px]">
                    {product.name}
                  </span>
                </div>
              </div>

              {/* Product Title & Rating */}
              <div className="space-y-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3">
                  <div className="flex items-center space-x-1">
                    {renderStars(product.rating)}
                    <span className="ml-1 text-sm font-medium text-gray-700">
                      {product.rating.toFixed(1)}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    ({product.numReviews.toLocaleString()} reviews)
                  </span>
                  <span className="text-sm text-gray-500">
                    • {product.category.name}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {product.brand.name}
                  </span>
                </div>
              </div>

              {/* Price Section */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="text-3xl font-bold text-orange-600">
                    Ksh {product.price.toLocaleString()}
                  </span>
                  {product.discount > 0 && (
                    <>
                      <span className="text-xl text-gray-500 line-through">
                        Ksh{" "}
                        {Math.round(
                          product.price / (1 - product.discount / 100)
                        ).toLocaleString()}
                      </span>
                      <span className="bg-red-100 text-red-600 px-2.5 py-0.5 rounded-full text-sm font-semibold">
                        {product.discount}% OFF
                      </span>
                    </>
                  )}
                </div>
                {product.discount > 0 && (
                  <p className="text-sm text-green-600">
                    You save Ksh{" "}
                    {Math.round(
                      (product.price * product.discount) /
                        100 /
                        (1 - product.discount / 100)
                    ).toLocaleString()}
                  </p>
                )}
              </div>

              {/* Quantity Control */}
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-lg font-semibold text-gray-800 mb-3">
                  Quantity
                </h3>
                <div className="flex items-center space-x-6">
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                    >
                      <Minus size={16} />
                    </button>
                    <span className="px-4 py-2 font-medium text-lg min-w-[50px] text-center border-x border-gray-300">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-2 hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-800"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      product.stock > 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {product.stock > 0 ? ` available in stock` : "Out of stock"}
                  </span>
                </div>
              </div>

              {/* Action Buttons - Made sticky on mobile */}
              <div className="fixed sm:static bottom-0 left-0 right-0 bg-white sm:bg-transparent border-t border-gray-200 sm:border-t-0 shadow-lg sm:shadow-none p-4 sm:p-0 z-10">
                <div className="container mx-auto px-2 sm:px-0">
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <button
                      onClick={handleAddToCart}
                      disabled={product.stock <= 0}
                      className="flex items-center justify-center space-x-3 py-3 px-6 border-2 border-orange-600 text-orange-600 rounded-lg font-semibold hover:bg-orange-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Add to Cart</span>
                      <span className="sm:hidden text-xs">Cart</span>
                    </button>

                    <button
                      onClick={handleBuyNow}
                      disabled={product.stock <= 0}
                      className="flex items-center justify-center space-x-3 py-3 px-6 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white rounded-lg font-semibold transition-colors shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <CreditCard className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span className="hidden sm:inline">Order Now</span>
                      <span className="sm:hidden text-xs">Order</span>
                    </button>

                    <button
                      onClick={handleRedeemWithChama}
                      disabled={product.stock <= 0}
                      className="hidden sm:flex items-center justify-center space-x-3 py-3 px-6 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Redeem with your chama group credit"
                    >
                      <Gift className="w-4 h-4 sm:w-5 sm:h-5" />
                      <span>Redeem</span>
                    </button>
                  </div>
                  {/* Mobile chama button - shown full width on small screens */}
                  <button
                    onClick={handleRedeemWithChama}
                    disabled={product.stock <= 0}
                    className="sm:hidden w-full flex items-center justify-center space-x-3 mt-3 py-3 px-6 border-2 border-green-600 text-green-600 rounded-lg font-semibold hover:bg-green-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Redeem with your chama group credit"
                  >
                    <Gift className="w-4 h-4" />
                    <span>Redeem with Chama</span>
                  </button>
                </div>
              </div>

              {/* Payment Security - Moved inside sticky container */}
              <div className="bg-orange-50 border border-orange-100 rounded-lg p-4 mt-4 mb-4">
                <div className="flex items-center space-x-3 mb-3">
                  <Shield className="text-orange-600" size={20} />
                  <span className="font-semibold text-orange-800">
                    Secure Payment
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <img
                    src="/images/visamastercardlogo.png"
                    alt="visa mastercard logo"
                    className="h-8"
                  />
                  <img
                    src="/images/mpesaLogo.svg"
                    alt="visa mastercard logo"
                    className="h-12"
                  />
                  <span className="text-sm text-orange-700">
                    256-bit SSL encryption
                  </span>
                </div>
              </div>

              {/* Additional Info */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-gray-200">
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Truck className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Free Delivery</p>
                    <p className="text-sm text-gray-600">Nairobi & environs</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3"></div>
                <div className="flex items-start space-x-3">
                  <div className="bg-orange-100 p-2 rounded-full">
                    <Shield className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Warranty</p>
                    <p className="text-sm text-gray-600">1-year manufacturer</p>
                  </div>
                </div>
              </div>

              {/* Product Description */}
              {product.description && (
                <div className="prose max-w-none text-gray-600 border-t border-gray-200 pt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">
                    Description
                  </h3>
                  <p className="whitespace-pre-line">{product.description}</p>
                </div>
              )}

              {/* Tabbed Section */}
              <div className="mt-16 mx-auto">
                {" "}
                {/* Changed from max-w-[900px] to mx-auto */}
                <div className="bg-white rounded-xl shadow-sm overflow-hidden lg-max-w-[900px] mx-auto">
                  {" "}
                  {/* Added max-w-[900px] and mx-auto here */}
                  {/* Tab Headers */}
                  <div className="flex border-b border-gray-200">
                    <button
                      onClick={() => setActiveTab("specifications")}
                      className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                        activeTab === "specifications"
                          ? "bg-orange-600 text-white"
                          : "bg-white text-black hover:bg-gray-50"
                      }`}
                    >
                      Product Specifications
                    </button>
                    <button
                      onClick={() => setActiveTab("reviews")}
                      className={`flex-1 px-6 py-4 text-center font-semibold transition-colors ${
                        activeTab === "reviews"
                          ? "bg-orange-600 text-white"
                          : "bg-white text-black hover:bg-gray-50"
                      }`}
                    >
                      Product Reviews
                    </button>
                  </div>
                  {/* Tab Content */}
                  <div className="p-6">
                    {activeTab === "specifications" && (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-900 mb-6">
                          Technical Specifications
                        </h3>
                        {product.specifications &&
                        product.specifications.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                            {product.specifications.map((spec, index) => (
                              <div
                                key={index}
                                className="flex flex-col sm:flex-row sm:justify-between p-4 bg-gray-50 rounded-lg"
                              >
                                <span className="font-medium text-gray-700 mb-1 sm:mb-0">
                                  {spec.name}:
                                </span>
                                <span className="text-gray-900 font-semibold">
                                  {spec.value}
                                </span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                              <Shield size={24} className="text-gray-400" />
                            </div>
                            <p className="text-gray-500">
                              No specifications available for this product.
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "reviews" && (
                      <div>
                        <ProductReviews
                          productId={product._id}
                          averageRating={product.rating}
                          totalReviews={product.numReviews}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
