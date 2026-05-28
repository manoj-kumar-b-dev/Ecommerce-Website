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
      <div className="max-w-lg w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-center animate-fade-in relative overflow-hidden">
        {/* Confetti Background Element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-success-50 to-transparent pointer-events-none" />

        {/* Success Icon */}
        <div className="flex justify-center relative z-10">
          <div className="w-24 h-24 bg-success-100 rounded-full flex items-center justify-center text-success-600 border-4 border-white shadow-md">
            <CheckCircle className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">
            Order Confirmed!
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            Thank you for your purchase. We've received your order and will begin processing it right away.
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 text-left space-y-4 relative z-10">
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Order ID</span>
            <span className="text-base font-bold text-gray-900">#{stateData.orderId.slice(-8).toUpperCase()}</span>
          </div>
          {stateData.transactionRef && (
            <div className="flex justify-between items-center border-b border-gray-200 pb-3">
              <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Transaction ID</span>
              <span className="text-sm font-bold font-mono text-gray-900">{stateData.transactionRef}</span>
            </div>
          )}
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Payment Method</span>
            <span className="text-sm font-bold text-gray-900">
              {stateData.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment'}
            </span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-200 pb-3">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Total Amount</span>
            <span className="text-xl font-heading font-bold text-primary-600">₹{stateData.totalPaid.toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between items-center pt-1">
            <span className="text-sm font-bold text-gray-500 uppercase tracking-wider">Estimated Delivery</span>
            <span className="text-base font-bold text-gray-900">{deliveryDate}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
          <Link
            to="/"
            className="w-full flex justify-center items-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition-all"
          >
            <ShoppingBag className="h-5 w-5" />
            Continue Shopping
          </Link>
          <Link
            to="/dashboard"
            className="w-full flex justify-center items-center gap-2 btn btn-primary py-3.5 px-6"
          >
            <Package className="h-5 w-5" />
            Track Order
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmationPage;