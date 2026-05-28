import { useContext, useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Truck, Landmark, Wallet, ShieldAlert, ArrowLeft, ArrowRight, CheckCircle2, CreditCard, ShoppingBag, Plus, MapPin } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { useCheckout } from '../hooks/useCheckout';
import { useRazorpay } from '../hooks/useRazorpay';
import StepIndicator from '../components/StepIndicator';
import AddressCard from '../components/AddressCard';
import axiosInstance from '../utils/axiosInstance';

const PAYMENT_METHODS = [
  { id: 'Razorpay', title: 'Razorpay / UPI', desc: 'Pay securely with UPI, cards, wallets, or netbanking.', icon: CreditCard },
  { id: 'COD', title: 'Cash on Delivery', desc: 'Pay when your order arrives.', icon: Wallet }
];

const CheckoutPage = () => {
  const { cartItems, cartSubtotal, cartTotal, estimatedShipping, clearCart } = useContext(CartContext);
  const { user, refreshUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const { initiatePayment } = useRazorpay();

  // Local state for addresses fetched from API
  const [userAddresses, setUserAddresses] = useState([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    name: '',
    phone: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    country: '',
    isDefault: false
  });

  const {
    currentStep, shippingDetails, paymentMethod, validationError,
    setPaymentMethod, handleShippingChange, selectSavedAddress, advanceStep, regressStep,
    setShippingDetails
  } = useCheckout();

  // Calculate tax
  const calculatedTaxPrice = Math.round(cartSubtotal * 0.18 * 100) / 100;
  const finalizedTotalAmount = cartSubtotal + estimatedShipping + calculatedTaxPrice;

  // Fetch user addresses from API on component mount
  useEffect(() => {
    const fetchUserAddresses = async () => {
      if (!user) return;
      setLoadingAddresses(true);
      try {
        const { data } = await axiosInstance.get('/api/addresses');
        setUserAddresses(data.addresses || []);

        // Auto-select default address if available and no shipping details set
        if (data.addresses && data.addresses.length > 0) {
          const defaultAddress = data.addresses.find(addr => addr.isDefault);
          if (defaultAddress && !shippingDetails.fullName) {
            selectSavedAddress(defaultAddress);
          }
        }
      } catch (err) {
        console.error('Failed to fetch addresses:', err);
      } finally {
        setLoadingAddresses(false);
      }
    };
    fetchUserAddresses();
  }, [user]);

  // Update userAddresses when user data changes (from context)
  useEffect(() => {
    if (user?.addresses) {
      setUserAddresses(user.addresses);
    }
  }, [user]);

  // Handle new address form changes
  const handleNewAddressChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Add new address from checkout
  const handleAddNewAddress = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!newAddress.name || !newAddress.phone || !newAddress.street ||
      !newAddress.city || !newAddress.state || !newAddress.pincode || !newAddress.country) {
      return;
    }

    try {
      const { data } = await axiosInstance.post('/api/addresses', {
        name: newAddress.name,
        phone: newAddress.phone,
        street: newAddress.street,
        city: newAddress.city,
        state: newAddress.state,
        postalCode: newAddress.pincode,
        country: newAddress.country,
        isDefault: newAddress.isDefault
      });

      setUserAddresses(data.addresses);
      await refreshUser();

      // If this is set as default, select it
      if (newAddress.isDefault) {
        const addedAddress = data.addresses.find(addr =>
          addr.name === newAddress.name &&
          addr.street === newAddress.street
        );
        if (addedAddress) {
          selectSavedAddress(addedAddress);
        }
      }

      // Reset form and hide it
      setNewAddress({
        name: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        pincode: '',
        country: '',
        isDefault: false
      });
      setShowAddAddressForm(false);
    } catch (err) {
      console.error('Failed to add address:', err);
    }
  };

  const buildOrderPayload = (method) => ({
    items: cartItems.map((item) => ({
      product: item.product._id || item.product,
      name: item.product.name,
      qty: item.qty,
      image: item.product.images?.[0],
      price: item.product.price
    })),
    shippingAddress: {
      fullName: shippingDetails.fullName,
      phone: shippingDetails.phone,
      street: shippingDetails.street,
      city: shippingDetails.city,
      state: shippingDetails.state,
      postalCode: shippingDetails.pincode,
      country: shippingDetails.country
    },
    paymentMethod: method,
    itemsPrice: cartSubtotal,
    taxPrice: calculatedTaxPrice,
    shippingPrice: estimatedShipping,
    totalPrice: finalizedTotalAmount
  });

  if (!cartItems || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Your cart is empty. Add items before checkout.</p>
          <Link to="/shop" className="inline-block mt-4 text-primary-600 font-medium hover:underline">
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  const handleCheckoutProcessingPipeline = async () => {
    setSubmitting(true);
    try {
      const payload = buildOrderPayload(paymentMethod);
      const { data } = await axiosInstance.post('/api/orders', payload);

      if (paymentMethod === 'COD') {
        await clearCart();
        navigate('/order-confirmation', { state: { orderId: data.order._id, totalPaid: data.order.totalPrice, paymentMethod: 'COD' } });
        return;
      }

      initiatePayment(
        data.order._id,
        data.order.totalPrice,
        { name: shippingDetails.fullName, email: user.email, phone: shippingDetails.phone },
        async (verifiedId, transactionRef) => {
          await clearCart();
          navigate('/order-confirmation', { state: { orderId: verifiedId, totalPaid: data.order.totalPrice, transactionRef, paymentMethod: 'Razorpay' } });
        },
        async (errorMsg) => {
          try {
            await axiosInstance.put(`/api/orders/${data.order._id}/cancel`);
          } catch (cancelError) {
            // Order may already be restored
          }
          navigate('/payment-failed', { state: { error: errorMsg, orderId: data.order._id } });
        }
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <StepIndicator currentStep={currentStep} />

        {validationError && (
          <div className="mb-6 bg-danger-50 border-l-4 border-danger-500 p-4 rounded-lg flex items-start gap-3">
            <ShieldAlert className="h-5 w-5 text-danger-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-danger-700 font-medium">{validationError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Step 1: Shipping Address */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Shipping Address</h2>
                  <p className="text-sm text-gray-500 mt-1">Enter your delivery details</p>
                </div>

                {/* Saved Addresses Section */}
                {user && (
                  <div className="bg-gray-50 p-4 rounded-lg border">
                    <div className="flex items-center justify-between mb-3">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                        Saved Addresses
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                        className="text-xs font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1"
                      >
                        <Plus className="h-3 w-3" />
                        Add New
                      </button>
                    </div>

                    {loadingAddresses ? (
                      <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
                      </div>
                    ) : userAddresses.length > 0 ? (
                      <div className="space-y-2">
                        {userAddresses.map((addr) => (
                          <AddressCard
                            key={addr._id}
                            address={addr}
                            isSelected={shippingDetails.fullName === addr.name && shippingDetails.street === addr.street}
                            onSelect={selectSavedAddress}
                          />
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 py-2">No saved addresses. Add one below.</p>
                    )}
                  </div>
                )}

                {/* Add New Address Form (Inline) */}
                {showAddAddressForm && (
                  <div className="bg-primary-50 p-4 rounded-lg border border-primary-200">
                    <p className="text-sm font-medium text-gray-900 mb-3">Add New Address</p>
                    <form onSubmit={handleAddNewAddress} className="space-y-3">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={newAddress.name}
                            onChange={handleNewAddressChange}
                            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="John Doe"
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={newAddress.phone}
                            onChange={handleNewAddressChange}
                            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                          <input
                            type="text"
                            name="street"
                            value={newAddress.street}
                            onChange={handleNewAddressChange}
                            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="Flat No, Landmark, Area"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">City</label>
                          <input
                            type="text"
                            name="city"
                            value={newAddress.city}
                            onChange={handleNewAddressChange}
                            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="eg. Bengaluru"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">State</label>
                          <input
                            type="text"
                            name="state"
                            value={newAddress.state}
                            onChange={handleNewAddressChange}
                            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="eg. Karnataka"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Pincode</label>
                          <input
                            type="text"
                            name="pincode"
                            value={newAddress.pincode}
                            onChange={handleNewAddressChange}
                            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="10001"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Country</label>
                          <input
                            type="text"
                            name="country"
                            value={newAddress.country}
                            onChange={handleNewAddressChange}
                            className="w-full text-sm p-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                            placeholder="India"
                            required
                          />
                        </div>
                      </div>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="newIsDefault"
                          name="isDefault"
                          checked={newAddress.isDefault}
                          onChange={handleNewAddressChange}
                          className="h-3.5 w-3.5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor="newIsDefault" className="ml-2 text-xs text-gray-700">
                          Set as default address
                        </label>
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button
                          type="submit"
                          className="bg-primary-600 hover:bg-primary-700 text-white text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
                        >
                          Save Address
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowAddAddressForm(false)}
                          className="bg-white border border-gray-200 text-gray-700 text-xs font-medium py-1.5 px-3 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={shippingDetails.fullName}
                      onChange={handleShippingChange}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      placeholder="John Doe"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={shippingDetails.phone}
                      onChange={handleShippingChange}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      name="street"
                      value={shippingDetails.street}
                      onChange={handleShippingChange}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      placeholder="123 Main Street"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={shippingDetails.city}
                      onChange={handleShippingChange}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      placeholder="New York"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      State / Province
                    </label>
                    <input
                      type="text"
                      name="state"
                      value={shippingDetails.state}
                      onChange={handleShippingChange}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      placeholder="NY"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Postal Code
                    </label>
                    <input
                      type="text"
                      name="pincode"
                      value={shippingDetails.pincode}
                      onChange={handleShippingChange}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      placeholder="10001"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={shippingDetails.country}
                      onChange={handleShippingChange}
                      className="w-full text-sm p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none bg-white"
                      placeholder="United States"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Payment Method */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                  <p className="text-sm text-gray-500 mt-1">Select your preferred payment option</p>
                </div>

                <div className="space-y-3">
                  {PAYMENT_METHODS.map((method) => {
                    const IconComponent = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex items-start gap-4 p-4 border rounded-xl cursor-pointer transition-all ${isSelected
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                      >
                        <div className={`p-3 rounded-lg ${isSelected ? 'bg-primary-600' : 'bg-gray-100'}`}>
                          <IconComponent className={`h-5 w-5 ${isSelected ? 'text-white' : 'text-gray-600'}`} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{method.title}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{method.desc}</p>
                        </div>
                        <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'border-primary-600' : 'border-gray-300'
                          }`}>
                          {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-primary-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Review Order */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Review Your Order</h2>
                  <p className="text-sm text-gray-500 mt-1">Confirm your order details</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Truck className="h-4 w-4" />
                      Shipping Address
                    </p>
                    <p className="font-semibold text-gray-900">{shippingDetails.fullName}</p>
                    <p className="text-sm text-gray-600">{shippingDetails.phone}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {shippingDetails.street}, {shippingDetails.city}, {shippingDetails.state} {shippingDetails.pincode}
                    </p>
                    <p className="text-sm text-gray-600">{shippingDetails.country}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                      Payment Method
                    </p>
                    <p className="text-sm font-bold text-primary-600">
                      {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.title}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Order Items
                  </p>
                  <div className="space-y-3">
                    {cartItems.map((item) => (
                      <div key={item.product._id || item.product} className="flex items-center justify-between py-2">
                        <div className="flex items-center gap-3">
                          <img
                            src={item.product.images?.[0] || 'https://placehold.co/40x40?text=Product'}
                            alt={item.product.name}
                            className="w-12 h-12 object-cover rounded-lg border border-gray-200"
                          />
                          <div>
                            <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                            <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                          </div>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">
                          ₹{(item.product.price * item.qty).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-gray-200 flex items-center justify-between">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={regressStep}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : <div />}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={advanceStep}
                  className="inline-flex items-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-colors shadow-sm"
                >
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCheckoutProcessingPipeline}
                  className="inline-flex items-center gap-1.5 bg-success-600 hover:bg-success-700 text-white font-medium text-sm py-2.5 px-6 rounded-lg transition-colors shadow-sm disabled:opacity-50"
                >
                  {submitting ? 'Processing...' : 'Place Order'}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm h-fit">
            <h3 className="text-lg font-bold text-gray-900 border-b border-gray-200 pb-4 mb-4">
              Order Summary
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-medium text-gray-900">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-medium text-gray-900">
                  {estimatedShipping === 0 ? 'FREE' : `₹${estimatedShipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (18%)</span>
                <span className="font-medium text-gray-900">₹{calculatedTaxPrice.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary-600">₹{finalizedTotalAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
