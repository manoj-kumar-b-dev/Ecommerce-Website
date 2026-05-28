import { useState, useEffect, useContext } from 'react';
import { User, ShoppingBag, Heart, MapPin, Key, Upload, ChevronDown, ChevronUp, AlertCircle, RefreshCw, Check, Edit, Trash2 } from 'lucide-react';
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
      case 'Delivered': return 'bg-success-100 text-success-700';
      case 'Shipped': return 'bg-primary-100 text-primary-700';
      case 'Processing': return 'bg-amber-100 text-amber-700';
      case 'Pending': return 'bg-gray-100 text-gray-700';
      case 'Cancelled': return 'bg-danger-100 text-danger-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Toast */}
        {toastMessage && (
          <div className="fixed top-5 right-5 z-50 bg-gray-900 text-white text-sm font-medium px-4 py-2.5 rounded-lg shadow-lg border border-gray-800">
            {toastMessage}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-full md:w-64 flex-shrink-0 hidden md:block">
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="p-3 text-center border-b border-gray-100 mb-4">
                <div className="w-14 h-14 rounded-full mx-auto overflow-hidden border border-gray-200 mb-2">
                  <img
                    src={avatarUrl || 'https://placehold.co/150x150?text=User'}
                    alt="Profile"
                    className="h-full w-full object-cover"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                <p className="text-xs text-gray-500">{user?.email}</p>
              </div>

              <div className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeTab === tab.id
                        ? 'bg-primary-600 text-white'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                        }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.name}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1 bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Profile Settings</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your personal information</p>
                </div>

                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  <div className="relative group cursor-pointer w-16 h-16 rounded-full overflow-hidden border border-gray-200">
                    <img src={avatarUrl || 'https://placehold.co/150x150?text=User'} alt="Avatar" className="h-full w-full object-cover" />
                    <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-white">
                      <Upload className="h-5 w-5" />
                      <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                    </label>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Profile Picture</p>
                    <p className="text-xs text-gray-500 mt-0.5">Click to upload a new avatar</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      value={user?.email}
                      disabled
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                </div>

                <button
                  onClick={saveProfile}
                  disabled={uploading}
                  className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors disabled:opacity-50"
                >
                  {uploading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}

            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Order History</h2>
                  <p className="text-sm text-gray-600 mt-1">Track and manage your orders</p>
                </div>

                {myOrders.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No orders found</p>
                ) : (
                  <div className="space-y-4">
                    {myOrders.map((order) => {
                      const isExpanded = expandedOrderId === order._id;
                      return (
                        <div key={order._id} className="border border-gray-200 rounded-xl overflow-hidden">
                          <div
                            onClick={() => setExpandedOrderId(isExpanded ? null : order._id)}
                            className="p-4 bg-gray-50 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-100 transition-colors"
                          >
                            <div>
                              <p className="font-medium text-gray-900">Order #{order._id.slice(-8)}</p>
                              <p className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className="font-semibold text-primary-600">₹{order.totalPrice}</span>
                              <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${getStatusBadgeClass(order.status)}`}>
                                {order.status}
                              </span>
                              {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-4 border-t border-gray-200 space-y-4">
                              <TrackingTimeline status={order.status} updatedDate={order.updatedAt} />

                              <div className="space-y-2">
                                <p className="text-sm font-medium text-gray-700">Items</p>
                                <div className="space-y-2">
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="flex items-center justify-between gap-4">
                                      <div className="flex items-center gap-3">
                                        <img src={item.image} alt={item.name} className="h-10 w-10 object-cover rounded border" />
                                        <div>
                                          <p className="font-medium text-gray-900">{item.name}</p>
                                          <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                                        </div>
                                      </div>
                                      <div className="text-right">
                                        <p className="font-medium">₹{item.price * item.qty}</p>
                                        {order.status === 'Delivered' && (
                                          <button
                                            onClick={() => setActiveReviewProductId(item.product)}
                                            className="text-xs text-primary-600 hover:underline mt-1"
                                          >
                                            Write Review
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              {order.status === 'Pending' && (
                                <div className="pt-2 flex justify-end">
                                  <button
                                    onClick={() => cancelOrder(order._id)}
                                    className="text-sm text-danger-600 hover:text-danger-700 font-medium"
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
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Address Book</h2>
                  <p className="text-sm text-gray-600 mt-1">Manage your shipping addresses</p>
                </div>

                {/* Saved Addresses with AddressCard component */}
                {loadingAddresses ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <AddressCard
                        key={addr._id}
                        address={addr}
                        onEdit={startEditAddress}
                        onDelete={deleteAddress}
                        onSetDefault={setDefaultAddress}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-200">
                    <MapPin className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500 font-medium">No addresses saved yet</p>
                    <p className="text-sm text-gray-400 mt-1">Add your first shipping address below</p>
                  </div>
                )}

                {/* Add/Edit Address Form */}
                <form onSubmit={editingAddress ? updateAddress : addAddress} className="border-t border-gray-200 pt-6 space-y-4 max-w-lg">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900">
                      {editingAddress ? 'Edit Address' : 'Add New Address'}
                    </p>
                    {editingAddress && (
                      <button
                        type="button"
                        onClick={cancelEdit}
                        className="text-sm text-gray-500 hover:text-gray-700"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input
                        type="text"
                        value={addressName}
                        onChange={(e) => setAddressName(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={addressPhone}
                        onChange={(e) => setAddressPhone(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="+91 8610776382"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                      <input
                        type="text"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="Flat No, Landmark, Area"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="eg.Bengaluru"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="eg. Karnataka"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                      <input
                        type="text"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="10001"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                        placeholder="India"
                        required
                      />
                    </div>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isDefault"
                      checked={isDefault}
                      onChange={(e) => setIsDefault(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isDefault" className="ml-2 text-sm text-gray-700">
                      Set as default address
                    </label>
                  </div>

                  <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 px-6 rounded-lg transition-colors">
                    {editingAddress ? 'Update Address' : 'Add Address'}
                  </button>
                </form>
              </div>
            )}

            {/* Wishlist Tab */}
            {activeTab === 'wishlist' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Wishlist</h2>
                  <p className="text-sm text-gray-600 mt-1">Items you've saved for later</p>
                </div>

                {wishlist.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">Your wishlist is empty</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {wishlist.map((item) => (
                      <div key={item._id} className="border border-gray-200 rounded-xl p-3 flex flex-col">
                        <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-50 border relative">
                          <img
                            src={item.images?.[0] || 'https://placehold.co/200x200?text=Product'}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                          <button
                            onClick={() => toggleWishlist(item._id)}
                            className="absolute top-2 right-2 bg-white/80 hover:bg-white text-danger-600 p-1.5 rounded-full shadow-sm"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-3 space-y-1">
                          <p className="font-medium text-gray-900 truncate">{item.name}</p>
                          <p className="text-primary-600 font-semibold">₹{item.price}</p>
                        </div>
                        <button
                          onClick={() => {
                            addItemToCart(item, 1);
                            toggleWishlist(item._id);
                            showToast('Added to cart');
                          }}
                          className="w-full mt-3 bg-primary-600 hover:bg-primary-700 text-white py-2 rounded-lg font-medium text-sm transition-colors"
                        >
                          Add to Cart
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Navigation */}
      <nav className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 py-2 px-4 flex items-center justify-around md:hidden z-40">
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
              className={`flex flex-col items-center gap-1 text-xs font-medium transition-colors ${isActive ? 'text-primary-600' : 'text-gray-500'
                }`}
            >
              <Icon className="h-5 w-5" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </nav>

      {/* Review Modal */}
      {activeReviewProductId && (
        <ReviewModal
          productId={activeReviewProductId}
          onClose={() => setActiveReviewProductId(null)}
          onSuccess={() => showToast('Review submitted')}
        />
      )}
    </div>
  );
};

export default DashboardPage;