import { useLocation, Link, Navigate } from 'react-router-dom';
import { CheckCircle, ShoppingBag, ArrowRight, Package } from 'lucide-react';

const OrderConfirmationPage = () => {
  const location = useLocation();
  const stateData = location.state;

  if (!stateData || !stateData.orderId) {
    return <Navigate to="/" replace />;
  }

  // Generate estimated delivery date (5 days from now)
  const deliveryDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full space-y-8 bg-white p-8 rounded-2xl shadow-sm border text-center">
        {/* Success Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-success-100 rounded-full flex items-center justify-center text-success-600 border border-success-200">
            <CheckCircle className="h-10 w-10" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Order Placed Successfully!
          </h1>
          <p className="text-sm text-gray-600">
            Thank you for your purchase. We'll send you a confirmation email shortly.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 p-5 rounded-xl border border-gray-200 text-left space-y-3">
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-medium text-gray-600">Order ID</span>
            <span className="text-sm font-bold text-gray-900">#{stateData.orderId.slice(-8)}</span>
          </div>
          {stateData.transactionRef && (
            <div className="flex justify-between border-b border-gray-200 pb-2">
              <span className="text-sm font-medium text-gray-600">Transaction ID</span>
              <span className="text-sm font-mono text-gray-900">{stateData.transactionRef}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-medium text-gray-600">Payment Method</span>
            <span className="text-sm font-bold text-gray-900 uppercase">
              {stateData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Razorpay'}
            </span>
          </div>
          <div className="flex justify-between border-b border-gray-200 pb-2">
            <span className="text-sm font-medium text-gray-600">Total Amount</span>
            <span className="text-lg font-bold text-primary-600">₹{stateData.totalPaid}</span>
          </div>
          <div className="flex justify-between pt-1">
            <span className="text-sm font-medium text-gray-600">Estimated Delivery</span>
            <span className="text-sm font-bold text-gray-900">{deliveryDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
          <Link
            to="/"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
          >
            <ShoppingBag className="h-4 w-4" />
            Continue Shopping
          </Link>
          <Link
            to="/dashboard"
            className="w-full flex items-center justify-center gap-2 bg-primary-600 hover:bg-primary-700 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <Package className="h-4 w-4" />
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;