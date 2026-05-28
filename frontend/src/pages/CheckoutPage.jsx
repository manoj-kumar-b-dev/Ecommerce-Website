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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-3xl shadow-sm border border-gray-100 animate-fade-in">
          <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingBag className="h-10 w-10 text-gray-300" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">Checkout Unavailable</h2>
          <p className="text-gray-600 mb-8">Your cart is empty. Please add some items before proceeding to checkout.</p>
          <Link to="/shop" className="btn btn-primary w-full">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        
        {/* Page Header */}
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/cart"
            className="p-2.5 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm"
            aria-label="Back to cart"
            title="Back to cart"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">Checkout</h1>
        </div>

        <StepIndicator currentStep={currentStep} />

        {validationError && (
          <div className="mb-8 bg-danger-50 border border-danger-200 p-4 sm:p-5 rounded-2xl flex items-start gap-4 shadow-sm animate-fade-in">
            <div className="bg-white p-1.5 rounded-full shadow-sm flex-shrink-0">
              <ShieldAlert className="h-5 w-5 text-danger-500" />
            </div>
            <p className="text-sm md:text-base text-danger-700 font-medium pt-0.5">{validationError}</p>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Step 1: Shipping Address */}
            <div className={`bg-white border ${currentStep === 1 ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-gray-200/80 shadow-sm opacity-60'} rounded-3xl p-6 sm:p-8 transition-all duration-300`}>
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 1 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>1</div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900">Shipping Address</h2>
              </div>
              
              {currentStep === 1 && (
                <div className="space-y-8 animate-fade-in">
                  {/* Saved Addresses Section */}
                  {user && (
                    <div className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3">
                        <p className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                          Saved Addresses
                        </p>
                        <button
                          type="button"
                          onClick={() => setShowAddAddressForm(!showAddAddressForm)}
                          className="text-sm font-bold text-primary-600 hover:text-primary-700 flex items-center justify-center gap-2 bg-primary-50 px-4 py-2.5 rounded-xl transition-all active:scale-95 w-full sm:w-auto"
                        >
                          <Plus className="h-4 w-4" />
                          Add New
                        </button>
                      </div>

                      {loadingAddresses ? (
                        <div className="flex justify-center py-8">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                        </div>
                      ) : userAddresses.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <div className="text-center py-8 bg-white rounded-xl border border-dashed border-gray-200">
                          <MapPin className="h-8 w-8 text-gray-300 mx-auto mb-3" />
                          <p className="text-sm text-gray-500 font-medium">No saved addresses yet.</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Add New Address Form (Inline) */}
                  {showAddAddressForm && (
                    <div className="bg-primary-50/30 p-5 sm:p-6 rounded-2xl border border-primary-100">
                      <p className="text-base font-bold text-gray-900 mb-5">Enter New Address</p>
                      <form onSubmit={handleAddNewAddress} className="space-y-5">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                            <input
                              type="text"
                              name="name"
                              value={newAddress.name}
                              onChange={handleNewAddressChange}
                              className="input bg-white"
                              placeholder="John Doe"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                            <input
                              type="tel"
                              name="phone"
                              value={newAddress.phone}
                              onChange={handleNewAddressChange}
                              className="input bg-white"
                              placeholder="+91 98765 43210"
                              required
                            />
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
                            <input
                              type="text"
                              name="street"
                              value={newAddress.street}
                              onChange={handleNewAddressChange}
                              className="input bg-white"
                              placeholder="Flat No, Building, Landmark, Area"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                            <input
                              type="text"
                              name="city"
                              value={newAddress.city}
                              onChange={handleNewAddressChange}
                              className="input bg-white"
                              placeholder="e.g. Bengaluru"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                            <input
                              type="text"
                              name="state"
                              value={newAddress.state}
                              onChange={handleNewAddressChange}
                              className="input bg-white"
                              placeholder="e.g. Karnataka"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                            <input
                              type="text"
                              name="pincode"
                              value={newAddress.pincode}
                              onChange={handleNewAddressChange}
                              className="input bg-white"
                              placeholder="560001"
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                            <input
                              type="text"
                              name="country"
                              value={newAddress.country}
                              onChange={handleNewAddressChange}
                              className="input bg-white"
                              placeholder="India"
                              required
                            />
                          </div>
                        </div>
                        <div className="flex items-center touch-target pt-2">
                          <input
                            type="checkbox"
                            id="newIsDefault"
                            name="isDefault"
                            checked={newAddress.isDefault}
                            onChange={handleNewAddressChange}
                            className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                          />
                          <label htmlFor="newIsDefault" className="ml-3 text-sm font-medium text-gray-700 cursor-pointer">
                            Make this my default address
                          </label>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3 pt-3">
                          <button
                            type="submit"
                            className="w-full sm:w-auto btn btn-primary"
                          >
                            Save Address
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowAddAddressForm(false)}
                            className="w-full sm:w-auto btn bg-white border-2 border-gray-200 text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center" aria-hidden="true">
                      <div className="w-full border-t border-gray-200" />
                    </div>
                    <div className="relative flex justify-center">
                      <span className="bg-white px-4 text-sm font-medium text-gray-500">Or enter manually below</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <input
                        type="text"
                        name="fullName"
                        value={shippingDetails.fullName}
                        onChange={handleShippingChange}
                        className="input"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={shippingDetails.phone}
                        onChange={handleShippingChange}
                        className="input"
                        placeholder="+91 98765 43210"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address</label>
                      <input
                        type="text"
                        name="street"
                        value={shippingDetails.street}
                        onChange={handleShippingChange}
                        className="input"
                        placeholder="Flat No, Building, Area"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">City</label>
                      <input
                        type="text"
                        name="city"
                        value={shippingDetails.city}
                        onChange={handleShippingChange}
                        className="input"
                        placeholder="Bengaluru"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                      <input
                        type="text"
                        name="state"
                        value={shippingDetails.state}
                        onChange={handleShippingChange}
                        className="input"
                        placeholder="Karnataka"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Pincode</label>
                      <input
                        type="text"
                        name="pincode"
                        value={shippingDetails.pincode}
                        onChange={handleShippingChange}
                        className="input"
                        placeholder="560001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                      <input
                        type="text"
                        name="country"
                        value={shippingDetails.country}
                        onChange={handleShippingChange}
                        className="input"
                        placeholder="India"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Step 2: Payment Method */}
            <div className={`bg-white border ${currentStep === 2 ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-gray-200/80 shadow-sm opacity-60'} rounded-3xl p-6 sm:p-8 transition-all duration-300`}>
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 2 ? 'bg-primary-600 text-white' : currentStep > 2 ? 'bg-success-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  {currentStep > 2 ? <CheckCircle2 className="h-5 w-5" /> : '2'}
                </div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900">Payment Method</h2>
              </div>

              {currentStep === 2 && (
                <div className="space-y-4 animate-fade-in">
                  {PAYMENT_METHODS.map((method) => {
                    const IconComponent = method.icon;
                    const isSelected = paymentMethod === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => setPaymentMethod(method.id)}
                        className={`flex flex-col sm:flex-row sm:items-center gap-4 p-5 border-2 rounded-2xl cursor-pointer transition-all ${isSelected
                          ? 'border-primary-600 bg-primary-50/50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                          }`}
                      >
                        <div className={`p-4 rounded-xl flex-shrink-0 w-fit ${isSelected ? 'bg-primary-600 shadow-md shadow-primary-600/20' : 'bg-gray-100'}`}>
                          <IconComponent className={`h-6 w-6 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                        </div>
                        <div className="flex-1">
                          <p className={`text-base font-bold ${isSelected ? 'text-primary-900' : 'text-gray-900'}`}>{method.title}</p>
                          <p className="text-sm text-gray-500 mt-1 leading-relaxed">{method.desc}</p>
                        </div>
                        <div className="hidden sm:flex items-center justify-center w-6 h-6 rounded-full border-2 flex-shrink-0 ml-2" style={{ borderColor: isSelected ? 'var(--color-primary)' : '#e2e8f0' }}>
                          {isSelected && <div className="w-3 h-3 rounded-full bg-primary-600" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 3: Review Order */}
            <div className={`bg-white border ${currentStep === 3 ? 'border-primary-200 shadow-md ring-1 ring-primary-100' : 'border-gray-200/80 shadow-sm opacity-60'} rounded-3xl p-6 sm:p-8 transition-all duration-300`}>
              <div className="flex items-center gap-4 mb-6 border-b border-gray-100 pb-4">
                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold text-sm ${currentStep === 3 ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-500'}`}>3</div>
                <h2 className="text-xl sm:text-2xl font-heading font-bold text-gray-900">Review & Confirm</h2>
              </div>

              {currentStep === 3 && (
                <div className="space-y-8 animate-fade-in">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl relative">
                      <button onClick={regressStep} onClickCapture={() => regressStep()} className="absolute top-4 right-4 text-xs font-bold text-primary-600 hover:text-primary-700">Edit</button>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Truck className="h-4 w-4" />
                        Deliver To
                      </p>
                      <p className="font-bold text-gray-900 text-base">{shippingDetails.fullName}</p>
                      <p className="text-sm text-gray-600 mt-1">{shippingDetails.phone}</p>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                        {shippingDetails.street}, {shippingDetails.city}<br />
                        {shippingDetails.state} {shippingDetails.pincode}<br />
                        {shippingDetails.country}
                      </p>
                    </div>
                    <div className="p-5 bg-gray-50 border border-gray-100 rounded-2xl relative">
                      <button onClick={() => { regressStep(); regressStep(); }} className="absolute top-4 right-4 text-xs font-bold text-primary-600 hover:text-primary-700">Edit</button>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                        <Wallet className="h-4 w-4" />
                        Pay With
                      </p>
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-white rounded-lg border border-gray-200 shadow-sm">
                          {paymentMethod === 'COD' ? <Wallet className="h-5 w-5 text-primary-600" /> : <CreditCard className="h-5 w-5 text-primary-600" />}
                        </div>
                        <p className="text-base font-bold text-gray-900">
                          {PAYMENT_METHODS.find(m => m.id === paymentMethod)?.title}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="border border-gray-100 rounded-2xl overflow-hidden">
                    <div className="bg-gray-50 px-5 py-3 border-b border-gray-100">
                      <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Order Items ({cartItems.length})
                      </p>
                    </div>
                    <div className="divide-y divide-gray-100">
                      {cartItems.map((item) => (
                        <div key={item.product._id || item.product} className="flex items-center gap-4 p-5 bg-white hover:bg-gray-50/50 transition-colors">
                          <img
                            src={item.product.images?.[0] || 'https://placehold.co/80x80?text=Product'}
                            alt={item.product.name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-cover rounded-xl border border-gray-200 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-base font-bold text-gray-900 line-clamp-1">{item.product.name}</p>
                            <p className="text-sm font-medium text-gray-500 mt-1">Qty: {item.qty}</p>
                          </div>
                          <div className="text-right flex-shrink-0 pl-2">
                            <span className="text-lg font-heading font-bold text-gray-900">
                              ₹{(item.product.price * item.qty).toLocaleString('en-IN')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Actions — Sticky Bottom on Mobile */}
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-gray-200 lg:relative lg:p-0 lg:bg-transparent lg:border-t-0 lg:backdrop-blur-none z-40 mt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4">
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={regressStep}
                  className="w-full sm:w-auto inline-flex justify-center items-center gap-2 text-sm font-bold text-gray-600 hover:text-gray-900 bg-white border-2 border-gray-200 hover:border-gray-300 py-3.5 px-6 rounded-xl transition-all"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>
              ) : <div className="hidden sm:block" />}

              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={advanceStep}
                  className="w-full sm:w-auto btn btn-primary px-8 shadow-md"
                >
                  Continue to Next Step
                  <ArrowRight className="h-4.5 w-4.5 ml-2" />
                </button>
              ) : (
                <button
                  type="button"
                  disabled={submitting}
                  onClick={handleCheckoutProcessingPipeline}
                  className="w-full sm:w-auto btn bg-success-600 hover:bg-success-700 text-white px-8 shadow-md disabled:opacity-75"
                >
                  {submitting ? 'Processing...' : 'Place Order Now'}
                  {!submitting && <ArrowRight className="h-4.5 w-4.5 ml-2" />}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm sticky top-28">
              <h3 className="text-xl font-heading font-bold text-gray-900 border-b border-gray-100 pb-5 mb-6">
                Order Summary
              </h3>

              <div className="space-y-4 text-sm md:text-base border-b border-gray-100 pb-6 mb-6">
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Subtotal ({cartItems.length} items)</span>
                  <span className="font-bold text-gray-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Shipping Estimate</span>
                  <span className="font-bold text-gray-900">
                    {estimatedShipping === 0 ? <span className="text-success-600">FREE</span> : `₹${estimatedShipping.toLocaleString('en-IN')}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-gray-600">
                  <span className="font-medium">Tax (18% GST)</span>
                  <span className="font-bold text-gray-900">₹{calculatedTaxPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl text-white shadow-inner">
                <div className="flex justify-between items-end">
                  <span className="text-base font-medium text-gray-300 mb-1">Total to Pay</span>
                  <span className="text-2xl font-heading font-bold text-white">₹{finalizedTotalAmount.toLocaleString('en-IN')}</span>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="mt-8 pt-6 border-t border-gray-100 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-success-50 p-2 rounded-lg flex-shrink-0">
                    <ShieldAlert className="h-5 w-5 text-success-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Secure Checkout</p>
                    <p className="text-xs text-gray-500 mt-0.5">Your payment data is fully encrypted and secure.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="bg-primary-50 p-2 rounded-lg flex-shrink-0">
                    <Landmark className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Buyer Protection</p>
                    <p className="text-xs text-gray-500 mt-0.5">Get what you ordered or your money back.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
