import { createContext, useState, useEffect, useContext } from 'react';
import axiosInstance from '../utils/axiosInstance';
import { AuthContext } from './AuthContext';
import toast from 'react-hot-toast';

export const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
  const { user } = useContext(AuthContext);
  const [cartItems, setCartItems] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [cartModal, setCartModal] = useState({ isOpen: false, type: 'success', product: null });

  const closeCartModal = () => setCartModal(prev => ({ ...prev, isOpen: false }));

  // Computed Context State Properties
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);
  const cartSubtotal = cartItems.reduce((acc, item) => acc + (item.product?.price || 0) * item.qty, 0);
  const estimatedShipping = cartSubtotal > 150 || cartSubtotal === 0 ? 0 : 15;
  const estimatedTax = Math.round(cartSubtotal * 0.08 * 100) / 100;
  const cartTotal = cartSubtotal + estimatedShipping + estimatedTax;

  // Hydrate application state across user presence status alterations
  useEffect(() => {
    const syncAndFetchData = async () => {
      setLoading(true);
      if (user) {
        try {
          // Process any pending cart actions triggered before login
          const pendingAction = localStorage.getItem('pending_cart_action');
          if (pendingAction) {
            const parsedAction = JSON.parse(pendingAction);
            if (parsedAction && parsedAction.product) {
              await axiosInstance.post('/api/cart', { 
                productId: parsedAction.product._id, 
                qty: parsedAction.qty || 1 
              });
              toast.success(`${parsedAction.product.name} added to your cart`);
              localStorage.removeItem('pending_cart_action');
            }
          }

          // Fetch production data from database
          const cartRes = await axiosInstance.get('/api/cart');
          setCartItems(cartRes.data.cart.items || []);
          
          const wishlistRes = await axiosInstance.get('/api/wishlist');
          setWishlist(wishlistRes.data.wishlist || []);
        } catch (err) {
          console.error('Data hydration pipeline error trace');
        }
      } else {
        setCartItems([]);
        setWishlist([]);
      }
      setLoading(false);
    };
    syncAndFetchData();
  }, [user]);

  const addItemToCart = async (product, qty = 1) => {
    if (!user) {
      setCartModal({ isOpen: true, type: 'error', product: null });
      localStorage.setItem('pending_cart_action', JSON.stringify({ product, qty }));
      throw new Error('AUTH_REQUIRED');
    }

    try {
      const { data } = await axiosInstance.post('/api/cart', { productId: product._id, qty });
      setCartItems(data.cart.items);
      setCartModal({ isOpen: true, type: 'success', product });
    } catch (err) {
      const msg = err.response?.data?.message || 'Error processing network transaction';
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const updateQuantity = async (productId, nextQty) => {
    if (!user) {
      toast.error('Please login to modify cart');
      return;
    }

    if (nextQty < 1) return removeCartItem(productId);

    try {
      const { data } = await axiosInstance.put('/api/cart', { productId, qty: nextQty });
      setCartItems(data.cart.items);
    } catch (err) {
      alert(err.response?.data?.message || 'Error scaling volume coordinates');
    }
  };

  const removeCartItem = async (productId) => {
    if (!user) return;
    try {
      const { data } = await axiosInstance.delete(`/api/cart/${productId}`);
      setCartItems(data.cart.items);
    } catch (err) {
      console.error(err);
    }
  };

  const clearShoppingSessionCart = async () => {
    if (!user) return;
    try {
      await axiosInstance.delete('/api/cart');
      setCartItems([]);
    } catch (err) {
      console.error(err);
    }
  };

  const toggleProductWishlist = async (productId) => {
    if (!user) return alert('An active user account is required to manage wishlist contents');
    try {
      const { data } = await axiosInstance.post('/api/wishlist', { productId });
      const wlRes = await axiosInstance.get('/api/wishlist');
      setWishlist(wlRes.data.wishlist || []);
      return data.isWishlisted;
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <CartContext.Provider value={{
      cartItems, wishlist, cartCount, cartSubtotal, estimatedShipping, estimatedTax, cartTotal,
      isDrawerOpen, setIsDrawerOpen, loading, cartModal, closeCartModal,
      addItemToCart, updateQuantity, removeCartItem, clearCart: clearShoppingSessionCart, toggleWishlist: toggleProductWishlist
    }}>
      {children}
    </CartContext.Provider>
  );
};