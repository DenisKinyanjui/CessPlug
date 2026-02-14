import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Package } from "lucide-react";
import { RootState } from "../store/store";
import { clearCart, removeFromCart } from "../store/slices/cartSlice";
import SEOHelmet from "../components/SEO/SEOHelmet";
import { placeOrder } from "../services/orderApi";
import { getCurrentUser, addAddress, updateProfile } from "../services/authApi";
import { useAuth } from "../contexts/AuthContext";
import { initiateSTKPush, checkPaymentStatus } from "../services/mpesaApi";

// Import components
import CheckoutItems from "../components/checkout/CheckoutItems";
import PaymentMethodSelector from "../components/checkout/PaymentMethodSelector";
import DeliveryDetailsForm from "../components/checkout/DeliveryDetailsForm";
import OrderSummary from "../components/checkout/OrderSummary";
import PhoneConfirmationModal from "../components/checkout/PhoneConfirmationModal";
import PaymentStatusModal from "../components/checkout/PaymentStatusModal";

// Import types
import { ChamaCheckoutContext } from "../types/Chama";

interface Address {
  _id: string;
  type: "Home" | "Work" | "Other";
  name: string;
  address: string;
  city: string;
  country: string;
  postalCode?: string;
  phone: string;
  isDefault: boolean;
}

interface ShippingAddress {
  address: string;
  city: string;
  postalCode?: string;
  country: string;
  deliveryMethod: "home_delivery";
}

const Checkout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, refreshUser } = useAuth();
  const { items, totalAmount, totalQuantity } = useSelector(
    (state: RootState) => state.cart
  );

  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kenya",
  });

  const [originalCustomerInfo, setOriginalCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    country: "Kenya",
  });

  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [isLoadingUserData, setIsLoadingUserData] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);

  // Chama related states
  const [chamaContext, setChamaContext] = useState<ChamaCheckoutContext>({
    useChamaCredit: false,
    isChamaEligible: false,
  });

  // M-Pesa related states
  const [showPhoneConfirmModal, setShowPhoneConfirmModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [mpesaPhoneNumber, setMpesaPhoneNumber] = useState("");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [paymentStatus, setPaymentStatus] = useState<
    "pending" | "completed" | "failed" | null
  >(null);
  const [currentOrderId, setCurrentOrderId] = useState<string>("");

  // Memoized callback functions to prevent unnecessary re-renders
  const handleRemoveItem = useCallback(
    (id: string) => {
      dispatch(removeFromCart(id));
    },
    [dispatch]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setCustomerInfo((prev) => ({ ...prev, [name]: value }));
    },
    []
  );

  const handleSelectPreviousAddress = useCallback((address: Address) => {
    setCustomerInfo((prev) => ({
      ...prev,
      address: address.address,
      city: address.city,
      country: address.country,
    }));
    setShowAddressDropdown(false);
  }, []);

  // Check if delivery details have changed from original
  const hasDeliveryDetailsChanged = useCallback(() => {
    return (
      customerInfo.name !== originalCustomerInfo.name ||
      customerInfo.phone !== originalCustomerInfo.phone ||
      customerInfo.address !== originalCustomerInfo.address ||
      customerInfo.city !== originalCustomerInfo.city ||
      customerInfo.country !== originalCustomerInfo.country
    );
  }, [customerInfo, originalCustomerInfo]);

  // Save delivery details as default address
  const saveDeliveryDetailsAsDefault = useCallback(async () => {
    if (!customerInfo.name || !customerInfo.address || !customerInfo.city) {
      return; // Don't save incomplete addresses
    }

    try {
      // Check if this address already exists
      const existingAddress = addresses.find(
        (addr) =>
          addr.address === customerInfo.address &&
          addr.city === customerInfo.city &&
          addr.country === customerInfo.country
      );

      if (existingAddress && existingAddress.isDefault) {
        // Address already exists and is default, no need to save
        return;
      }

      if (existingAddress && !existingAddress.isDefault) {
        // Address exists but isn't default, update it to be default
        const response = await updateProfile({
          name: customerInfo.name,
          email: customerInfo.email,
          phone: customerInfo.phone,
          address: {
            street: customerInfo.address,
            city: customerInfo.city,
            state: "", // Using empty string for compatibility
            zipCode: "",
            country: customerInfo.country,
          },
        });

        if (response.success && refreshUser) {
          await refreshUser();
        }
        return;
      }

      // New address - add it and set as default
      const addressData = {
        type: "Home" as "Home" | "Work" | "Other",
        name: customerInfo.name,
        address: customerInfo.address,
        city: customerInfo.city,
        country: customerInfo.country,
        postalCode: "",
        phone: customerInfo.phone,
        isDefault: true, // Always set as default
      };

      const response = await addAddress(addressData);

      if (response.success) {
        // Update local addresses list
        setAddresses(response.data.user.addresses || []);

        // Refresh user context
        if (refreshUser) {
          await refreshUser();
        }
      }
    } catch (error: any) {
      console.error("Error saving delivery address:", error);
      // Don't show error to user as this should be seamless
    }
  }, [customerInfo, addresses, refreshUser]);

  // Fetch user data and addresses
  useEffect(() => {
    const fetchUserDataAndAddresses = async () => {
      if (user) {
        try {
          // Get fresh user data including addresses
          const userResponse = await getCurrentUser();
          if (userResponse.success) {
            const userData = userResponse.data.user;

            // Set basic user info
            const userInfo = {
              name: userData.name || "",
              email: userData.email || "",
              phone: userData.phone || "",
              address: "",
              city: "",
              country: "Kenya",
            };

            // Set M-Pesa phone number from user phone
            setMpesaPhoneNumber(userData.phone || "");

            // Set addresses from the user's addresses array
            setAddresses(userData.addresses || []);

            // Check for default address first, then fall back to profile address
            const defaultAddress: Address | undefined = (
              userData.addresses as Address[]
            ).find((addr: Address) => addr.isDefault);

            if (defaultAddress) {
              // Use default address from addresses array
              userInfo.address = defaultAddress.address;
              userInfo.city = defaultAddress.city;
              userInfo.country = defaultAddress.country;
            } else if (userData.address?.street) {
              // Fall back to profile address
              userInfo.address = userData.address.street;
              userInfo.city = userData.address.city || "";
              userInfo.country = userData.address.country || "Kenya";
            }

            setCustomerInfo(userInfo);
            setOriginalCustomerInfo(userInfo); // Store original for comparison
          }
        } catch (error) {
          console.error("Error fetching user data and addresses:", error);
          setError("Failed to load user data and addresses");
        }
      }
      setIsLoadingUserData(false);
    };

    fetchUserDataAndAddresses();
  }, [user]);

  // Poll payment status when we have a checkout request ID
  useEffect(() => {
    let pollInterval: NodeJS.Timeout;
    let timeout: NodeJS.Timeout;

    if (checkoutRequestId && paymentStatus === "pending") {
      pollInterval = setInterval(async () => {
        try {
          const status = await checkPaymentStatus(checkoutRequestId);
          if (status.success && status.data) {
            setPaymentStatus(status.data.status);

            if (status.data.status === "completed") {
              clearInterval(pollInterval);
              clearTimeout(timeout);
              setTimeout(() => {
                setShowPaymentModal(false);
                dispatch(clearCart());
                navigate("/order-success", {
                  state: { orderId: currentOrderId },
                });
              }, 2000);
            } else if (status.data.status === "failed") {
              clearInterval(pollInterval);
              clearTimeout(timeout);
              setError(
                status.data.failureReason || "Payment failed. Please try again."
              );
              setTimeout(() => {
                setShowPaymentModal(false);
                setPaymentStatus(null);
                setCheckoutRequestId("");
              }, 3000);
            }
          }
        } catch (error) {
          console.error("Error checking payment status:", error);
        }
      }, 3000);

      timeout = setTimeout(() => {
        if (paymentStatus === "pending") {
          clearInterval(pollInterval);
          setError(
            "Payment confirmation timed out. Please check your M-Pesa messages."
          );
          setShowPaymentModal(false);
          setPaymentStatus(null);
          setCheckoutRequestId("");
        }
      }, 600000);
    }

    return () => {
      if (pollInterval) clearInterval(pollInterval);
      if (timeout) clearTimeout(timeout);
    };
  }, [checkoutRequestId, paymentStatus, currentOrderId, dispatch, navigate]);

  const formatPhoneNumber = useCallback((phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.startsWith("0")) {
      return "254" + cleanPhone.substring(1);
    } else if (cleanPhone.startsWith("254")) {
      return cleanPhone;
    } else if (cleanPhone.startsWith("+254")) {
      return cleanPhone.substring(1);
    }
    return cleanPhone;
  }, []);

  const isValidPhoneNumber = useCallback(
    (phone: string) => {
      const cleanPhone = formatPhoneNumber(phone);
      return cleanPhone.length === 12 && cleanPhone.startsWith("254");
    },
    [formatPhoneNumber]
  );

const validateOrderForm = useCallback(() => {
  console.log("🔍 Validating order form with:");
  console.log("- User:", user?.email);
  console.log("- Customer Info:", customerInfo);
  console.log("- Payment Method:", paymentMethod);
  console.log("- Chama Context:", chamaContext);

  // Clear previous errors
  setError("");

  if (!user) {
    console.log("❌ Validation failed: No user");
    setError("Please login to complete your order");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  }

  if (!customerInfo.name || !customerInfo.phone) {
    console.log("❌ Validation failed: Missing customer info");
    setError("Please fill in all required fields (name and phone number)");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  }

  // Validate phone number format
  if (!isValidPhoneNumber(customerInfo.phone)) {
    console.log("❌ Validation failed: Invalid phone number");
    setError("Please enter a valid Kenyan phone number (e.g., 0712345678)");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  }

  if (!customerInfo.address || !customerInfo.city) {
    console.log("❌ Validation failed: Missing delivery address");
    setError("Please provide your complete delivery address (street address and city)");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  }

  // Validate payment method
  if (paymentMethod === "mpesa" && !mpesaPhoneNumber) {
    console.log("❌ Validation failed: Missing M-Pesa phone number");
    setError("Please provide your M-Pesa phone number");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  }

  // Validate chama if selected
  if (paymentMethod === "chama" && !chamaContext.isChamaEligible) {
    console.log("❌ Validation failed: Not eligible for chama");
    setError("You are not eligible to use chama credit for this order");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return false;
  }

  console.log("✅ Validation passed");
  return true;
}, [
  user,
  customerInfo,
  paymentMethod,
  mpesaPhoneNumber,
  chamaContext,
  isValidPhoneNumber,
]);

const processOrder = useCallback(async () => {
  setIsProcessing(true);
  setError("");

  try {
    const orderItems = items.map((item) => ({
      product: item.id,
      name: item.name,
      quantity: item.quantity,
      price: item.price,
      image: item.image,
    }));

    const shippingCost = 0; // Free delivery
    const taxAmount = 0;
    const discountAmount = 0;
    const giftBoxCost = 0;
    let finalTotal = totalAmount - discountAmount + giftBoxCost + shippingCost;

    // If using chama, reduce final total by chama amount
    let chamaAmount = 0;
    if (paymentMethod === "chama" && chamaContext.chamaMaxAmount) {
      chamaAmount = Math.min(chamaContext.chamaMaxAmount, finalTotal);
      finalTotal = finalTotal - chamaAmount;
    }

    // Prepare shipping address for home delivery
    const shippingAddress: ShippingAddress = {
      address: customerInfo.address,
      city: customerInfo.city,
      postalCode: "00000",
      country: customerInfo.country,
      deliveryMethod: "home_delivery",
    };

    const orderData: any = {
      orderItems,
      shippingAddress,
      paymentMethod: paymentMethod === "chama" ? "mpesa" : paymentMethod,
      itemsPrice: totalAmount,
      taxPrice: taxAmount,
      shippingPrice: shippingCost,
      totalPrice: paymentMethod === "chama" ? finalTotal : totalAmount,
      deliveryMethod: "home_delivery",
    };

    // Add chama data if using chama credit
    if (paymentMethod === "chama") {
      orderData.useChamaCredit = true;
      orderData.chamaGroupId = chamaContext.chamaGroupId;
    }

    console.log("Order data being sent:", orderData);

    const response = await placeOrder(orderData);

    if (response.success) {
      setCurrentOrderId(response.data.order._id);

      if (paymentMethod === "cod") {
        dispatch(clearCart());
        navigate("/order-success", {
          state: { orderId: response.data.order._id },
        });
      } else if (paymentMethod === "mpesa") {
        // Pay full amount via M-Pesa
        await initiateMpesaPayment(response.data.order._id, totalAmount);
      } else if (paymentMethod === "chama") {
        // Pure chama payment, no M-Pesa needed
        dispatch(clearCart());
        navigate("/order-success", {
          state: { orderId: response.data.order._id },
        });
      }
    } else {
      throw new Error("Failed to place order");
    }
  } catch (err: any) {
    console.error("Order error:", err);
    setError(
      err.response?.data?.message ||
        err.message ||
        "Failed to place order. Please try again."
    );
  } finally {
    setIsProcessing(false);
  }
}, [
  items,
  totalAmount,
  customerInfo,
  paymentMethod,
  chamaContext,
  dispatch,
  navigate,
]);

  const handleConfirmOrder = useCallback(async () => {
    if (!validateOrderForm()) {
      return;
    }

    // Auto-save delivery details as default address if they've changed
    if (hasDeliveryDetailsChanged()) {
      await saveDeliveryDetailsAsDefault();
    }

    // If M-Pesa is selected, show phone confirmation modal
    if (paymentMethod === "mpesa") {
      setShowPhoneConfirmModal(true);
      return;
    }

    // Handle Cash on Delivery or Chama
    await processOrder();
  }, [
    validateOrderForm,
    hasDeliveryDetailsChanged,
    saveDeliveryDetailsAsDefault,
    paymentMethod,
    processOrder,
  ]);

  const initiateMpesaPayment = useCallback(
    async (orderId: string, amount: number) => {
      try {
        const formattedPhone = formatPhoneNumber(mpesaPhoneNumber);

        if (!isValidPhoneNumber(formattedPhone)) {
          throw new Error("Please enter a valid Kenyan phone number");
        }

        const stkResponse = await initiateSTKPush({
          phoneNumber: formattedPhone,
          amount: Math.ceil(amount),
          orderId: orderId,
          accountReference: `Order-${orderId.slice(-6)}`,
        });

        if (stkResponse.success && stkResponse.data) {
          setCheckoutRequestId(stkResponse.data.checkoutRequestId);
          setPaymentStatus("pending");
          setShowPhoneConfirmModal(false);
          setShowPaymentModal(true);
        } else {
          throw new Error(
            stkResponse.message || "Failed to initiate M-Pesa payment"
          );
        }
      } catch (error: any) {
        console.error("M-Pesa payment error:", error);
        setError(
          error.message ||
            "Failed to initiate M-Pesa payment. Please try again."
        );
        setShowPhoneConfirmModal(false);
        setPaymentStatus("failed");
        setShowPaymentModal(true);
      }
    },
    [formatPhoneNumber, isValidPhoneNumber, mpesaPhoneNumber]
  );

  const handlePhoneConfirm = useCallback(() => {
    if (!isValidPhoneNumber(mpesaPhoneNumber)) {
      setError("Please enter a valid Kenyan phone number (e.g., 0712345678)");
      return;
    }
    setError("");
    processOrder();
  }, [isValidPhoneNumber, mpesaPhoneNumber, processOrder]);

  // Modal handlers
  const handlePhoneConfirmModalCancel = useCallback(() => {
    setShowPhoneConfirmModal(false);
  }, []);

  const handlePaymentStatusModalCancel = useCallback(() => {
    setShowPaymentModal(false);
    setPaymentStatus(null);
    setCheckoutRequestId("");
  }, []);

  const handlePaymentStatusModalTryAgain = useCallback(() => {
    setShowPaymentModal(false);
    setPaymentStatus(null);
    setCheckoutRequestId("");
  }, []);

  // Form validation
  const isFormValid = (() => {
    if (!customerInfo.name || !customerInfo.phone) {
      return false;
    }

    return !!(customerInfo.address && customerInfo.city);
  })();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex items-center justify-center px-4">
        <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-sm">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package size={36} className="text-orange-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-3">
            Your cart is empty
          </h2>
          <p className="text-gray-600 mb-6">
            Add some products to proceed with checkout
          </p>
          <Link
            to="/"
            className="inline-flex items-center justify-center bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <SEOHelmet
        title="Checkout - VinkyShopping | Complete Your Order"
        description="Complete your purchase securely. Review your order, enter delivery details, and choose payment method."
        keywords="checkout, order, payment, shipping, VinkyShopping"
      />

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors group"
              >
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-all group-hover:bg-gray-50">
                  <ArrowLeft size={20} />
                </div>
                <span className="font-medium hidden sm:inline">Back</span>
              </button>
              <div className="flex flex-col items-center justify-center text-center">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
                  Complete Your Order
                </h1>
                <p className="text-gray-500">
                  Review and confirm your purchase
                </p>
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <CheckoutItems
                items={items}
                totalQuantity={totalQuantity}
                onRemoveItem={handleRemoveItem}
              />

              <PaymentMethodSelector
                paymentMethod={paymentMethod}
                onPaymentMethodChange={setPaymentMethod}
                isChamaEligible={chamaContext.isChamaEligible}
                chamaMaxAmount={chamaContext.chamaMaxAmount}
                chamaGroupName={chamaContext.chamaGroupName}
                ineligibilityReason={chamaContext.ineligibilityReason}
              />

              {/* Delivery Details Form */}
              <DeliveryDetailsForm
                customerInfo={customerInfo}
                addresses={addresses}
                isLoadingUserData={isLoadingUserData}
                showAddressDropdown={showAddressDropdown}
                hasDeliveryDetailsChanged={hasDeliveryDetailsChanged()}
                onInputChange={handleInputChange}
                onToggleAddressDropdown={() =>
                  setShowAddressDropdown(!showAddressDropdown)
                }
                onSelectPreviousAddress={handleSelectPreviousAddress}
              />
            </div>

            <OrderSummary
              totalAmount={totalAmount}
              paymentMethod={paymentMethod}
              isProcessing={isProcessing}
              isFormValid={isFormValid}
              onConfirmOrder={handleConfirmOrder}
            />
          </div>
        </div>
      </div>

      <PhoneConfirmationModal
        isVisible={showPhoneConfirmModal}
        mpesaPhoneNumber={mpesaPhoneNumber}
        onPhoneNumberChange={setMpesaPhoneNumber}
        onConfirm={handlePhoneConfirm}
        onCancel={handlePhoneConfirmModalCancel}
      />

      <PaymentStatusModal
        isVisible={showPaymentModal}
        paymentStatus={paymentStatus}
        mpesaPhoneNumber={mpesaPhoneNumber}
        finalTotal={totalAmount}
        currentOrderId={currentOrderId}
        checkoutRequestId={checkoutRequestId}
        error={error}
        onCancel={handlePaymentStatusModalCancel}
        onTryAgain={handlePaymentStatusModalTryAgain}
      />
    </>
  );
};

export default Checkout;
