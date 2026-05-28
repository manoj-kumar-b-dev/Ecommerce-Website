import { useState, useEffect, useContext } from 'react';
import { User, ShoppingBag, Heart, MapPin, Key, Upload, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Check, Edit, Trash2, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';
import axiosInstance from '../utils/axiosInstance';
import TrackingTimeline from '../components/TrackingTimeline';
import ReviewModal from '../components/ReviewModal';
import AddressCard from '../components/AddressCard';

const TABS = [
  { id: 'profile', name: 'Profile', icon: User },
  { id: 'orders', name: 'Orders', icon: ShoppingBag },
  { id: 'wishlist', name: 'Wishlist', icon: Heart },
  { id: 'addresses', name: 'Addresses', icon: MapPin }
];

const DashboardPage = () => {
  const { user, login, refreshUser } = useContext(AuthContext);
  const { wishlist, toggleWishlist, addItemToCart } = useContext(CartContext);
  const [activeTab, setActiveTab] = useState('profile');

  // Profile states
  const [profileName, setProfileName] = useState(user?.name || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [toastMessage, setToastMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  // Orders states
  const [myOrders, setMyOrders] = useState([]);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Review modal
  const [activeReviewProductId, setActiveReviewProductId] = useState(null);

  // Address states
  const [addresses, setAddresses] = useState(user?.addresses || []);
  const [addressName, setAddressName] = useState('');
  const [addressPhone, setAddressPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [country, setCountry] = useState('');
  const [isDefault, setIsDefault] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  // Fetch orders when orders tab is active
  useEffect(() => {
    if (activeTab === 'orders') {
      const fetchOrders = async () => {
        try {
          const { data } = await axiosInstance.get('/api/orders/myorders');
          setMyOrders(data.orders || []);
        } catch (err) {
          console.error(err);
        }
      };
      fetchOrders();
    }
  }, [activeTab]);

  // Fetch addresses when addresses tab is active
  useEffect(() => {
    if (activeTab === 'addresses') {
      fetchAddresses();
    }
  }, [activeTab]);

  // Update addresses when user data changes
  useEffect(() => {
    if (user?.addresses) {
      setAddresses(user.addresses);
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setAvatarFile(file);
    setAvatarUrl(URL.createObjectURL(file));
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('name', profileName);
      if (avatarFile) {
        formData.append('avatar', avatarFile);
      } else if (avatarUrl && avatarUrl !== user?.avatar) {
        formData.append('avatar', avatarUrl);
      }

      await axiosInstance.put('/api/auth/profile', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      await refreshUser();
      setAvatarFile(null);
      showToast('Profile updated successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to update profile');
    } finally {
      setUploading(false);
    }
  };

  // Fetch addresses from API
  const fetchAddresses = async () => {
    setLoadingAddresses(true);
    try {
      const { data } = await axiosInstance.get('/api/addresses');
      setAddresses(data.addresses || []);
    } catch (err) {
      console.error('Failed to fetch addresses:', err);
      showToast('Failed to load addresses');
    } finally {
      setLoadingAddresses(false);
    }
  };

  // Add a new address
  const addAddress = async (e) => {
    e.preventDefault();
    // Validate required fields
    if (!addressName || !addressPhone || !street || !city || !state || !pincode || !country) {
      showToast('All address fields are required');
      return;
    }

    try {
      const { data } = await axiosInstance.post('/api/addresses', {
        name: addressName,
        phone: addressPhone,
        street,
        city,
        state,
        postalCode: pincode,
        country,
        isDefault
      });
      setAddresses(data.addresses);
      // Refresh user data to update addresses in context
      await refreshUser();
      setAddressName('');
      setAddressPhone('');
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setCountry('');
      setIsDefault(false);
      showToast('Address added successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to add address');
    }
  };

  // Update an existing address
  const updateAddress = async (e) => {
    e.preventDefault();
    if (!editingAddress) return;

    // Validate required fields
    if (!addressName || !addressPhone || !street || !city || !state || !pincode || !country) {
      showToast('All address fields are required');
      return;
    }

    try {
      const { data } = await axiosInstance.put(`/api/addresses/${editingAddress._id}`, {
        name: addressName,
        phone: addressPhone,
        street,
        city,
        state,
        postalCode: pincode,
        country,
        isDefault
      });
      setAddresses(data.addresses);
      await refreshUser();
      setEditingAddress(null);
      setAddressName('');
      setAddressPhone('');
      setStreet('');
      setCity('');
      setState('');
      setPincode('');
      setCountry('');
      setIsDefault(false);
      showToast('Address updated successfully');
    } catch (err) {
      console.error(err);
      showToast('Failed to update address');
    }
  };

  // Delete an address
  const deleteAddress = async (addrId) => {
    if (!window.confirm('Are you sure you want to delete this address?')) return;
    try {
      const { data } = await axiosInstance.delete(`/api/addresses/${addrId}`);
      setAddresses(data.addresses);
      await refreshUser();
      showToast('Address deleted');
    } catch (err) {
      console.error(err);
      showToast('Failed to delete address');
    }
  };

  // Set an address as default
  const setDefaultAddress = async (addrId) => {
    try {
      const { data } = await axiosInstance.patch(`/api/addresses/${addrId}/set-default`);
      setAddresses(data.addresses);
      await refreshUser();
      showToast('Default address updated');
    } catch (err) {
      console.error(err);
      showToast('Failed to set default address');
    }
  };

  // Start editing an address
  const startEditAddress = (address) => {
    setEditingAddress(address);
    setAddressName(address.name || '');
    setAddressPhone(address.phone || '');
    setStreet(address.street || '');
    setCity(address.city || '');
    setState(address.state || '');
    setPincode(address.postalCode || '');
    setCountry(address.country || '');
    setIsDefault(address.isDefault || false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Cancel editing
  const cancelEdit = () => {
    setEditingAddress(null);
    setAddressName('');
    setAddressPhone('');
    setStreet('');
    setCity('');
    setState('');
    setPincode('');
    setCountry('');
    setIsDefault(false);
  };

  const cancelOrder = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await axiosInstance.put(`/api/orders/${id}/cancel`);
      showToast('Order cancelled');
      const { data } = await axiosInstance.get('/api/orders/myorders');
      setMyOrders(data.orders);
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Delivered': return 'bg-success-100 text-success-700 border-success-200';
      case 'Shipped': return 'bg-primary-100 text-primary-700 border-primary-200';
      case 'Processing': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'Pending': return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'Cancelled': return 'bg-danger-100 text-danger-700 border-danger-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-24 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">My Account</h1>
          <p className="text-sm font-medium text-gray-500 mt-1">Manage your profile, orders, and addresses</p>
        </div>

        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-xl border border-gray-800 animate-slide-up flex items-center gap-2">
            <Check className="h-4 w-4 text-success-500" />
            {toastMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-72 flex-shrink-0 hidden md:block">
            <div className="bg-white border border-gray-200/80 rounded-3xl p-5 shadow-sm sticky top-28">
              <div className="p-4 text-center border-b border-gray-100 mb-5">
                <div className="w-20 h-20 rounded-full mx-auto overflow-hidden border-4 border-gray-50 shadow-sm mb-3">
                  <img
                    src={avatarUrl || 'https://placehold.co/150x150?text=User'}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-lg font-heading font-bold text-gray-900">{user?.name}</p>
                <p className="text-sm font-medium text-gray-500">{user?.email}</p>
              </div>

              <div className="space-y-2">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-5 py-3.5 text-base font-bold rounded-2xl transition-all ${isActive
                        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className={`h-5 w-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 md:p-10 shadow-sm animate-fade-in min-h-[500px]">
              {/* Profile Tab */}
              {activeTab === 'profile' && (
                <div className="space-y-8 max-w-2xl animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">Profile Settings</h2>
                    <p className="text-base text-gray-600 mt-1">Manage your personal information and picture.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-6 bg-gray-50 border border-gray-100 rounded-2xl">
                    <div className="relative group cursor-pointer w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm flex-shrink-0">
                      <img src={avatarUrl || 'https://placehold.co/150x150?text=User'} alt="Avatar" className="h-full w-full object-cover" />
                      <label className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white backdrop-blur-sm">
                        <Upload className="h-5 w-5 mb-1" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">Change</span>
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-gray-900">Profile Picture</p>
                      <p className="text-sm text-gray-500 mt-1 mb-3">JPG, GIF or PNG. Max size of 5MB.</p>
                      <label className="btn btn-outline py-2 px-4 text-sm inline-block cursor-pointer">
                        Upload New Photo
                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                      </label>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                      <input
                        type="text"
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="input py-3.5"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-900 mb-2">Email Address</label>
                      <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full px-4 py-3.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed font-medium"
                      />
                      <p className="text-xs text-gray-500 mt-2 font-medium">Email address cannot be changed.</p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <button
                      onClick={saveProfile}
                      disabled={uploading}
                      className="btn btn-primary w-full sm:w-auto px-8 shadow-md"
                    >
                      {uploading ? 'Saving Changes...' : 'Save Changes'}
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === 'orders' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">Order History</h2>
                    <p className="text-base text-gray-600 mt-1">Track, return or purchase items again.</p>
                  </div>

                  {myOrders.length === 0 ? (
                    <div className="text-center bg-gray-50 border border-dashed border-gray-200 rounded-3xl py-16 px-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <ShoppingBag className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">No orders placed</h3>
                      <p className="text-gray-500 font-medium mb-6">Looks like you haven't made your first purchase yet.</p>
                      <Link to="/shop" className="btn btn-primary inline-flex">
                        Start Shopping
                      </Link>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {myOrders.map((order) => {
                        const isExpanded = expandedOrderId === order._id;
                        return (
                          <div key={order._id} className="border border-gray-200/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                            {/* Order Header */}
                            <div
                              onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                              className="p-5 sm:p-6 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex flex-wrap gap-x-8 gap-y-2">
                                <div>
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order Number</p>
                                  <p className="font-bold text-gray-900">#{order._id.slice(-8).toUpperCase()}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Date Placed</p>
                                  <p className="font-bold text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                                </div>
                                <div>
                                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Total Amount</p>
                                  <p className="font-bold text-gray-900">₹{order.totalPrice.toLocaleString('en-IN')}</p>
                                </div>
                              </div>
                              <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto border-t sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0 border-gray-200">
                                <span className={`px-3 py-1.5 text-xs font-bold rounded-full border ${getStatusBadgeClass(order.status)}`}>
                                  {order.status}
                                </span>
                                <div className="p-2 bg-white rounded-full border border-gray-200 shadow-sm">
                                  {isExpanded ? <ChevronUp className="h-5 w-5 text-gray-600" /> : <ChevronDown className="h-5 w-5 text-gray-600" />}
                                </div>
                              </div>
                            </div>

                            {/* Expanded Order Content */}
                            {isExpanded && (
                              <div className="p-5 sm:p-6 border-t border-gray-100 bg-white space-y-8 animate-fade-in">
                                <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
                                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6">Delivery Status</h4>
                                  <TrackingTimeline status={order.status} updatedDate={order.updatedAt} />
                                </div>

                                <div>
                                  <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2">Order Items</h4>
                                  <div className="divide-y divide-gray-100">
                                    {order.items.map((item, idx) => (
                                      <div key={idx} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                        <div className="flex items-center gap-4">
                                          <Link to={`/product/${item.product}`}>
                                            <div className="h-16 w-16 sm:h-20 sm:w-20 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden flex-shrink-0">
                                              <img src={item.image || 'https://placehold.co/100x100?text=Product'} alt={item.name} className="h-full w-full object-cover" />
                                            </div>
                                          </Link>
                                          <div>
                                            <Link to={`/product/${item.product}`}>
                                              <p className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2">{item.name}</p>
                                            </Link>
                                            <p className="text-sm text-gray-500 font-medium mt-1">Qty: {item.qty} × ₹{item.price.toLocaleString('en-IN')}</p>
                                          </div>
                                        </div>
                                        <div className="text-left sm:text-right w-full sm:w-auto pl-20 sm:pl-0">
                                          <p className="font-heading font-bold text-lg text-gray-900">₹{(item.price * item.qty).toLocaleString('en-IN')}</p>
                                          {order.status === 'Delivered' && (
                                            <button
                                              onClick={(e) => { e.stopPropagation(); setActiveReviewProductId(item.product); }}
                                              className="text-sm font-bold text-primary-600 hover:text-primary-700 mt-2"
                                            >
                                              Write Review
                                            </button>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Summary within Detail */}
                                <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100 grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div>
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Shipping Address</h4>
                                    <p className="font-bold text-gray-900 text-sm mb-1">{order.shippingAddress.fullName}</p>
                                    <p className="text-sm text-gray-600 leading-relaxed">
                                      {order.shippingAddress.street}<br/>
                                      {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br/>
                                      {order.shippingAddress.country}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">Ph: {order.shippingAddress.phone}</p>
                                  </div>
                                  <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Subtotal</span>
                                      <span className="font-medium">₹{order.itemsPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Shipping</span>
                                      <span className="font-medium">₹{order.shippingPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                      <span className="text-gray-600">Tax</span>
                                      <span className="font-medium">₹{order.taxPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                    <div className="border-t border-gray-200 pt-2 flex justify-between">
                                      <span className="font-bold text-gray-900">Total</span>
                                      <span className="font-bold text-primary-600 text-lg">₹{order.totalPrice.toLocaleString('en-IN')}</span>
                                    </div>
                                  </div>
                                </div>

                                {order.status === 'Pending' && (
                                  <div className="pt-4 border-t border-gray-100 flex justify-end">
                                    <button
                                      onClick={() => cancelOrder(order._id)}
                                      className="btn bg-white border-2 border-danger-200 text-danger-600 hover:bg-danger-50"
                                    >
                                      Cancel Order
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === 'addresses' && (
                <div className="space-y-8 animate-fade-in">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h2 className="text-2xl font-heading font-bold text-gray-900">Address Book</h2>
                      <p className="text-base text-gray-600 mt-1">Manage your shipping addresses.</p>
                    </div>
                    {!editingAddress && (
                      <button
                        onClick={() => {
                          setEditingAddress(false); // trigger add mode, form scrolling
                          cancelEdit(); // clear fields
                        }}
                        className="btn btn-primary hidden md:inline-flex"
                      >
                        Add New Address
                      </button>
                    )}
                  </div>

                  {loadingAddresses ? (
                    <div className="flex justify-center py-12">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600"></div>
                    </div>
                  ) : addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      {addresses.map((addr) => (
                        <AddressCard
                          key={addr._id}
                          address={addr}
                          onEdit={startEditAddress}
                          onDelete={deleteAddress}
                          onSetDefault={setDefaultAddress}
                        />
                      ))}
                      {!editingAddress && (
                        <div 
                          onClick={() => cancelEdit()} // triggers form view
                          className="border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-8 cursor-pointer hover:border-primary-400 hover:bg-primary-50/30 transition-all text-gray-500 hover:text-primary-600 min-h-[200px]"
                        >
                          <div className="h-12 w-12 bg-gray-50 rounded-full flex items-center justify-center mb-3">
                            <MapPin className="h-6 w-6" />
                          </div>
                          <p className="font-bold">Add New Address</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center bg-gray-50 border border-dashed border-gray-200 rounded-3xl py-12 px-4 mb-8">
                      <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                      <p className="text-xl font-heading font-bold text-gray-900 mb-1">No addresses saved</p>
                      <p className="text-gray-500 font-medium">Add your first shipping address below.</p>
                    </div>
                  )}

                  {/* Add/Edit Address Form */}
                  <form onSubmit={editingAddress ? updateAddress : addAddress} className="bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-200 mt-8 space-y-6">
                    <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                      <h3 className="text-xl font-bold text-gray-900">
                        {editingAddress ? 'Edit Address' : 'Add New Address'}
                      </h3>
                      {editingAddress && (
                        <button
                          type="button"
                          onClick={cancelEdit}
                          className="text-sm font-bold text-gray-500 hover:text-gray-700"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Full Name</label>
                        <input
                          type="text"
                          value={addressName}
                          onChange={(e) => setAddressName(e.target.value)}
                          className="input bg-white py-3.5"
                          placeholder="John Doe"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Phone Number</label>
                        <input
                          type="tel"
                          value={addressPhone}
                          onChange={(e) => setAddressPhone(e.target.value)}
                          className="input bg-white py-3.5"
                          placeholder="+91 8610776382"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-sm font-bold text-gray-900 mb-2">Street Address</label>
                        <input
                          type="text"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          className="input bg-white py-3.5"
                          placeholder="Flat No, Building, Landmark, Area"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">City</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="input bg-white py-3.5"
                          placeholder="eg. Bengaluru"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">State</label>
                        <input
                          type="text"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="input bg-white py-3.5"
                          placeholder="eg. Karnataka"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Pincode</label>
                        <input
                          type="text"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="input bg-white py-3.5"
                          placeholder="560001"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Country</label>
                        <input
                          type="text"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="input bg-white py-3.5"
                          placeholder="India"
                          required
                        />
                      </div>
                    </div>

                    <div className="flex items-center pt-2">
                      <input
                        type="checkbox"
                        id="isDefault"
                        checked={isDefault}
                        onChange={(e) => setIsDefault(e.target.checked)}
                        className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="isDefault" className="ml-3 text-sm font-bold text-gray-700 cursor-pointer">
                        Set as default shipping address
                      </label>
                    </div>

                    <div className="pt-2">
                      <button type="submit" className="btn btn-primary w-full sm:w-auto px-8 shadow-md">
                        {editingAddress ? 'Update Address' : 'Save Address'}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Wishlist Tab */}
              {activeTab === 'wishlist' && (
                <div className="space-y-8 animate-fade-in">
                  <div>
                    <h2 className="text-2xl font-heading font-bold text-gray-900">Wishlist</h2>
                    <p className="text-base text-gray-600 mt-1">Items you've saved for later.</p>
                  </div>

                  {wishlist.length === 0 ? (
                    <div className="text-center bg-gray-50 border border-dashed border-gray-200 rounded-3xl py-16 px-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-gray-100">
                        <Heart className="h-10 w-10 text-gray-300" />
                      </div>
                      <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Your wishlist is empty</h3>
                      <p className="text-gray-500 font-medium mb-6">Explore products and click the heart icon to save them here.</p>
                      <Link to="/shop" className="btn btn-primary inline-flex">
                        Browse Products
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {wishlist.map((item) => (
                        <div key={item._id} className="border border-gray-200/80 bg-white rounded-3xl p-4 flex flex-col shadow-sm hover:shadow-xl transition-shadow">
                          <div className="aspect-[4/5] w-full rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 relative mb-4 group">
                            <Link to={`/product/${item.slug || item._id}`}>
                              <img
                                src={item.images?.[0] || 'https://placehold.co/400x500?text=Product'}
                                alt={item.name}
                                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                              />
                            </Link>
                            <button
                              onClick={() => toggleWishlist(item._id)}
                              className="absolute top-3 right-3 bg-white/90 backdrop-blur-md hover:bg-white text-gray-400 hover:text-danger-500 p-2.5 rounded-xl shadow-sm transition-all active:scale-95"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          <div className="space-y-1 mb-4">
                            <p className="font-bold text-gray-900 truncate"><Link to={`/product/${item.slug || item._id}`} className="hover:text-primary-600">{item.name}</Link></p>
                            <p className="font-heading font-bold text-lg text-gray-900">₹{item.price.toLocaleString('en-IN')}</p>
                          </div>
                          <button
                            onClick={() => {
                              addItemToCart(item, 1);
                              toggleWishlist(item._id);
                              showToast('Added to cart');
                            }}
                            className="mt-auto w-full btn btn-primary py-3 text-sm shadow-md"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* Floating Mobile Dock Navigation */}
      <nav className="fixed bottom-4 inset-x-4 bg-gray-900/95 backdrop-blur-lg rounded-2xl py-3 px-6 flex items-center justify-between md:hidden z-50 shadow-2xl border border-gray-800">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`flex flex-col items-center gap-1.5 transition-all p-1 ${isActive ? 'text-primary-400 scale-110' : 'text-gray-400 hover:text-gray-200'
                }`}
            >
              <div className={`relative ${isActive ? 'bg-primary-500/20 p-2 rounded-xl' : 'p-2'}`}>
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-400' : 'text-gray-400'}`} />
                {isActive && <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary-400" />}
              </div>
            </button>
          );
        })}
      </nav>

      {/* Review Modal */}
      {activeReviewProductId && (
        <ReviewModal
          productId={activeReviewProductId}
          onClose={() => setActiveReviewProductId(null)}
          onSuccess={() => showToast('Review submitted successfully!')}
        />
      )}
    </div>
  );
};

export default DashboardPage;