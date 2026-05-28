import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, Trash2, ShoppingBag, ArrowRight, Minus, Plus } from 'lucide-react';
import { CartContext } from '../context/CartContext';

const CartDrawer = () => {
  const { isDrawerOpen, setIsDrawerOpen, cartItems, updateQuantity, removeCartItem, cartSubtotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 transition-opacity" onClick={() => setIsDrawerOpen(false)} />

      <div className="absolute inset-y-0 right-0 pl-10 max-w-full flex">
        <div className="w-screen max-w-md bg-white shadow-xl flex flex-col transform transition-transform duration-300">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-primary-600" />
              Cart ({cartItems.length})
            </h2>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500 font-medium">Your cart is empty</p>
              </div>
            ) : (
              cartItems.map((item) => {
                const product = item.product;
                const pId = product._id || product;
                return (
                  <div key={pId} className="flex gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <img
                      src={product.images?.[0] || 'https://placehold.co/64x64?text=Product'}
                      alt={product.name}
                      className="h-16 w-16 object-cover rounded-lg border border-white bg-white"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                      <p className="text-sm font-semibold text-primary-600 mt-1">₹{product.price}</p>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border border-gray-200 rounded bg-white">
                          <button
                            onClick={() => updateQuantity(pId, item.qty - 1)}
                            className="p-1 text-gray-500 hover:text-gray-900"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-medium text-gray-900 min-w-[20px] text-center">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(pId, item.qty + 1)}
                            className="p-1 text-gray-500 hover:text-gray-900"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeCartItem(pId)}
                          className="p-1 text-gray-400 hover:text-danger-600"
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
            <div className="p-4 border-t border-gray-200 bg-gray-50 space-y-4">
              <div className="flex justify-between text-sm font-medium">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 font-semibold">₹{cartSubtotal}</span>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/cart');
                  }}
                  className="w-full text-center text-sm font-medium border border-gray-300 py-2.5 rounded-lg hover:bg-white transition-colors"
                >
                  View Cart
                </button>
                <button
                  onClick={() => {
                    setIsDrawerOpen(false);
                    navigate('/checkout');
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
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
