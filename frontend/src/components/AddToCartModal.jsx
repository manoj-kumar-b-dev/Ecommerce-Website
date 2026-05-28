import React, { useContext, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const AddToCartModal = () => {
  const { cartModal, closeCartModal } = useContext(CartContext);
  const navigate = useNavigate();

  useEffect(() => {
    let timer;
    if (cartModal.isOpen && cartModal.type === 'success') {
      timer = setTimeout(() => {
        closeCartModal();
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [cartModal.isOpen, cartModal.type, closeCartModal]);

  // Framer Motion's AnimatePresence works best when it wraps conditional rendering.
  // We'll keep the AnimatePresence always rendered, and conditionally render its children.
  return (
    <AnimatePresence>
      {cartModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCartModal}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
          >
            {/* Close Button */}
            <button
              onClick={closeCartModal}
              className="absolute top-4 right-4 p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {cartModal.type === 'success' ? (
              /* Success Content */
              <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, damping: 15 }}
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 shadow-inner"
                >
                  <CheckCircle2 className="w-10 h-10 text-green-500" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Added to Cart Successfully!</h3>
                <p className="text-sm text-gray-500 mb-6">Your item has been added to the cart</p>

                {cartModal.product && (
                  <div className="w-full flex items-center gap-4 p-4 bg-gray-50 rounded-xl mb-6 shadow-sm border border-gray-100">
                    <img
                      src={cartModal.product.images?.[0] || 'https://placehold.co/100x100?text=Product'}
                      alt={cartModal.product.name}
                      className="w-16 h-16 rounded-lg object-cover bg-white shadow-sm border border-gray-100"
                    />
                    <div className="flex-1 text-left">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2">{cartModal.product.name}</h4>
                      <p className="text-sm font-bold text-primary-600 mt-1">₹{cartModal.product.price}</p>
                    </div>
                  </div>
                )}

                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closeCartModal}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={() => {
                      closeCartModal();
                      navigate('/cart');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-primary-600 to-primary-500 hover:from-primary-700 hover:to-primary-600 text-white text-sm font-semibold shadow-lg shadow-primary-500/30 hover:shadow-xl hover:shadow-primary-500/40 transition-all focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    View Cart
                  </button>
                </div>
              </div>
            ) : (
              /* Error / Warning Content */
              <div className="p-6 sm:p-8 flex flex-col items-center text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', delay: 0.1, damping: 15 }}
                  className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4 shadow-inner"
                >
                  <AlertCircle className="w-10 h-10 text-amber-500" />
                </motion.div>

                <h3 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h3>
                <p className="text-sm text-gray-500 mb-6">Please login to add items to your cart and continue shopping.</p>

                <div className="w-full flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={closeCartModal}
                    className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors focus:ring-2 focus:ring-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      closeCartModal();
                      navigate('/login');
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-600 hover:to-amber-500 text-white text-sm font-semibold shadow-lg shadow-amber-500/30 hover:shadow-xl hover:shadow-amber-500/40 transition-all focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                  >
                    Login
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default AddToCartModal;
