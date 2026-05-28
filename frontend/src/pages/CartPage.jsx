import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, Minus, Plus } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { CartSkeleton } from '../components/SkeletonLoaders';

const CartPage = () => {
  const { cartItems, updateQuantity, removeCartItem, cartSubtotal, estimatedShipping, estimatedTax, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <ShoppingBag className="h-10 w-10 text-gray-300" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h1>
          <p className="text-gray-600 mb-6">
            Looks like you haven't added anything to your cart yet.
            Start shopping to fill it up!
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <Link
            to="/shop"
            className="p-2 text-gray-600 hover:text-gray-900 rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Shopping Cart</h1>
          <span className="text-sm text-gray-500">({cartItems.length} items)</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              const product = item.product;
              const pId = product._id || product;
              return (
                <div
                  key={pId}
                  className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-24 h-24 bg-gray-50 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={product.images?.[0] || 'https://placehold.co/100x100?text=Product'}
                        alt={product.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = 'https://placehold.co/100x100?text=Product';
                        }}
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={`/product/${product.slug}`}
                        className="text-sm font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                      >
                        {product.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-1">{product.brand}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto">
                    {/* Quantity Controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg bg-white">
                      <button
                        onClick={() => updateQuantity(pId, item.qty - 1)}
                        className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                        disabled={item.qty <= 1}
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="px-3 text-sm font-semibold text-gray-900 min-w-[30px] text-center">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(pId, item.qty + 1)}
                        className="p-2 text-gray-500 hover:text-gray-900 transition-colors"
                        disabled={item.qty >= product.stock}
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>

                    <p className="text-sm font-bold text-gray-900 w-20 text-right">
                      ₹{(product.price * item.qty).toFixed(2)}
                    </p>

                    <button
                      onClick={() => removeCartItem(pId)}
                      className="p-2 text-gray-400 hover:text-danger-600 transition-colors rounded-lg hover:bg-danger-50"
                      aria-label="Remove item"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-6">
            <h2 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-4">
              Order Summary
            </h2>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span className="font-semibold text-gray-900">₹{cartSubtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span className="font-semibold text-gray-900">
                  {estimatedShipping === 0 ? 'FREE' : `₹${estimatedShipping.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax</span>
                <span className="font-semibold text-gray-900">₹{estimatedTax.toFixed(2)}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-base font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-primary-600">₹{cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3.5 rounded-lg transition-all transform hover:scale-105 shadow-sm"
            >
              Proceed to Checkout
            </button>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500 pt-2">
              <ShieldCheck className="h-4 w-4 text-success-600" />
              Secure checkout guaranteed
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
