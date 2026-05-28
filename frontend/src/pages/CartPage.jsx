import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, ShoppingBag, ArrowLeft, ShieldCheck, Minus, Plus, AlertCircle, ArrowRight } from 'lucide-react';
import { CartContext } from '../context/CartContext';
import { CartSkeleton } from '../components/SkeletonLoaders';

const CartPage = () => {
  const { cartItems, updateQuantity, removeCartItem, cartSubtotal, estimatedShipping, estimatedTax, cartTotal } = useContext(CartContext);
  const navigate = useNavigate();

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-md animate-fade-in">
          <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-md border border-gray-100">
            <ShoppingBag className="h-12 w-12 text-gray-300" />
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 mb-4">Your cart is empty</h1>
          <p className="text-gray-600 text-base mb-8 leading-relaxed">
            Looks like you haven't added anything to your cart yet. Start shopping to discover our premium collection.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 bg-primary-600 text-white font-bold text-lg px-8 py-4 rounded-xl hover:bg-primary-700 active:scale-95 transition-all shadow-md hover:shadow-lg hover:shadow-primary-600/20"
          >
            <ArrowLeft className="h-5 w-5" />
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 sm:mb-10 animate-fade-in">
          <div className="flex items-center gap-3">
            <Link
              to="/shop"
              className="p-3 text-gray-500 hover:text-gray-900 bg-white hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 shadow-sm"
              aria-label="Back to shopping"
              title="Back to shopping"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">Shopping Cart</h1>
              <p className="text-sm font-medium text-gray-500 mt-1">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Cart Items Section */}
          <div className="lg:col-span-2 space-y-6 animate-fade-in">
            {/* Disclaimer */}
            <div className="p-4 bg-warning-50 border border-warning-200 rounded-xl flex items-start gap-3 shadow-sm">
              <AlertCircle className="h-5 w-5 text-warning-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium text-warning-800 leading-relaxed">Prices and availability are subject to change. Final total will be confirmed at checkout.</p>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              {cartItems.map((item, idx) => {
                const product = item.product;
                const pId = product._id || product;
                return (
                  <div
                    key={pId}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 p-4 sm:p-5 bg-white border border-gray-200/80 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300"
                    style={{ animationDelay: `${idx * 40}ms` }}
                  >
                    {/* Product Image & Info */}
                    <div className="flex items-start sm:items-center gap-4 sm:gap-5 flex-1 min-w-0 w-full">
                      <Link
                        to={`/product/${product.slug}`}
                        className="block flex-shrink-0"
                      >
                        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gray-50 rounded-xl overflow-hidden border border-gray-100">
                          <img
                            src={product.images?.[0] || 'https://placehold.co/150x150?text=Product'}
                            alt={product.name}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://placehold.co/150x150?text=Product';
                            }}
                          />
                        </div>
                      </Link>

                      <div className="min-w-0 flex-1 flex flex-col justify-between h-full py-1">
                        <div>
                          <p className="text-xs font-bold text-primary-600 uppercase tracking-wider mb-1">{product.brand}</p>
                          <Link
                            to={`/product/${product.slug}`}
                            className="text-base sm:text-lg font-heading font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-2 leading-snug"
                          >
                            {product.name}
                          </Link>
                        </div>
                        
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md ${product.stock > 0 ? 'bg-success-50 text-success-700 border border-success-100' : 'bg-danger-50 text-danger-700 border border-danger-100'}`}>
                            {product.stock > 0 ? (
                              <><div className="w-1.5 h-1.5 rounded-full bg-success-500"></div> In stock</>
                            ) : (
                              <><div className="w-1.5 h-1.5 rounded-full bg-danger-500"></div> Out of stock</>
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full sm:w-full h-px bg-gray-100 sm:hidden my-1"></div>

                    {/* Quantity, Price, and Remove Button */}
                    <div className="flex items-center justify-between gap-4 w-full sm:w-auto">
                      {/* Quantity Controls */}
                      <div className="flex items-center border-2 border-gray-200 rounded-xl bg-gray-50">
                        <button
                          onClick={() => updateQuantity(pId, item.qty - 1)}
                          className="p-2 sm:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors rounded-l-lg touch-target"
                          disabled={item.qty <= 1}
                          aria-label="Decrease quantity"
                        >
                          <Minus className="h-4 w-4" />
                        </button>
                        <span className="px-3 sm:px-4 py-1 text-base font-bold text-gray-900 min-w-[40px] text-center bg-white border-x-2 border-gray-200 h-full flex items-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQuantity(pId, item.qty + 1)}
                          className="p-2 sm:p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-200 transition-colors rounded-r-lg touch-target"
                          disabled={item.qty >= product.stock}
                          aria-label="Increase quantity"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price Details */}
                      <div className="text-right flex-1 sm:flex-none">
                        <p className="text-lg sm:text-xl font-heading font-bold text-gray-900">
                          ₹{(product.price * item.qty).toLocaleString('en-IN')}
                        </p>
                        {item.qty > 1 && (
                          <p className="text-xs font-medium text-gray-500 mt-0.5">₹{product.price.toLocaleString('en-IN')} each</p>
                        )}
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => removeCartItem(pId)}
                        className="p-3 text-gray-400 hover:text-danger-600 hover:bg-danger-50 transition-all duration-200 rounded-xl"
                        aria-label="Remove item from cart"
                        title="Remove from cart"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Order Summary Sidebar */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-sm sticky top-28 lg:animate-slide-in-right">
            <h2 className="text-xl font-heading font-bold text-gray-900 border-b border-gray-100 pb-5 mb-6">
              Order Summary
            </h2>

            <div className="space-y-4 mb-6 pb-6 border-b border-gray-100">
              <div className="flex justify-between items-center text-base">
                <span className="text-gray-600 font-medium">Subtotal</span>
                <span className="font-bold text-gray-900">₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>

              <div className="flex justify-between items-center text-base">
                <span className="text-gray-600 font-medium">Estimated Shipping</span>
                <span className="font-bold">
                  {estimatedShipping === 0 ? (
                    <span className="text-success-600">Free</span>
                  ) : (
                    `₹${estimatedShipping.toLocaleString('en-IN')}`
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center text-base">
                <span className="text-gray-600 font-medium">Tax (18%)</span>
                <span className="font-bold text-gray-900">₹{estimatedTax.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="mb-8 p-5 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-inner text-white">
              <div className="flex justify-between items-end">
                <span className="text-base font-medium text-gray-300 mb-1">Total Amount</span>
                <span className="text-3xl font-heading font-bold text-white">
                  ₹{cartTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold text-lg py-4 rounded-xl hover:bg-primary-700 active:scale-95 transition-all duration-200 shadow-md hover:shadow-xl hover:shadow-primary-600/20"
            >
              Checkout <ArrowRight className="h-5 w-5" />
            </button>

            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-gray-500 bg-gray-50 px-4 py-2 rounded-lg w-full">
                <ShieldCheck className="h-4 w-4 text-success-600" />
                Secure & encrypted checkout
              </div>
              <Link
                to="/shop"
                className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
              >
                Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
