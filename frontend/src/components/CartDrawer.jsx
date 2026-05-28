import { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const CartDrawer = () => {
  const { isDrawerOpen, setIsDrawerOpen, cartItems, updateQuantity, removeCartItem, cartSubtotal } = useContext(CartContext);
  const navigate = useNavigate();
  const [isAnimating, setIsAnimating] = useState(false);

  // Handle open/close animation
  useEffect(() => {
    if (isDrawerOpen) {
      setIsAnimating(true);
      document.body.classList.add('scroll-locked');
    }
    return () => {
      document.body.classList.remove('scroll-locked');
    };
  }, [isDrawerOpen]);

  const handleClose = () => {
    document.body.classList.remove('scroll-locked');
    setIsDrawerOpen(false);
  };

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-backdrop-in"
        onClick={handleClose}
      />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-lg font-heading font-bold text-gray-900 flex items-center gap-2.5">
              <div className="w-8 h-8 bg-primary-50 rounded-lg flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 text-primary-600" />
              </div>
              Cart ({cartItems.length})
            </h2>
            <button
              onClick={handleClose}
              className="p-2.5 hover:bg-gray-100 rounded-xl transition-colors"
              aria-label="Close cart"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
            {cartItems.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <ShoppingBag className="h-8 w-8 text-gray-300" />
                </div>
                <p className="text-sm text-gray-500 font-medium">Your cart is empty</p>
                <p className="text-xs text-gray-400 mt-1">Add items to get started</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const product = item.product;
                const pId = product._id || product;
                return (
                  <div key={pId} className="flex gap-3 p-3 border border-gray-100 rounded-xl bg-gray-50/50 hover:bg-gray-50 transition-colors">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/64x64?text=Product'}
                      alt={product.name}
                      className="h-18 w-18 object-cover rounded-xl border border-gray-100 bg-white flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm font-bold text-primary-600 mt-0.5">₹{product.price?.toLocaleString('en-IN')}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                          <button
                            onClick={() => updateQuantity(pId, item.qty - 1)}
                            className="p-2 text-gray-500 hover:text-gray-900 transition-colors touch-target"
                            aria-label="Decrease quantity"
                          >
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="px-3 text-sm font-bold text-gray-900 min-w-[28px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(pId, item.qty + 1)}
                            className="p-2 text-gray-500 hover:text-gray-900 transition-colors touch-target"
                            aria-label="Increase quantity"
                          >
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeCartItem(pId)}
                          className="p-2 text-gray-400 hover:text-danger-600 hover:bg-danger-50 rounded-lg transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Summary & Actions */}
          {cartItems.length > 0 && (
            <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="text-gray-900 font-bold text-base">₹{cartSubtotal?.toLocaleString('en-IN')}</span>
              </div>

              <div className="space-y-2.5">
                <button
                  onClick={() => {
                    handleClose();
                    navigate('/cart');
                  }}
                  className="w-full text-center text-sm font-semibold border border-gray-300 py-3 rounded-xl hover:bg-white transition-colors"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    handleClose();
                    navigate('/checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-xl transition-all shadow-sm hover:shadow-md active:scale-[0.98]"
                >
                  Checkout <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
