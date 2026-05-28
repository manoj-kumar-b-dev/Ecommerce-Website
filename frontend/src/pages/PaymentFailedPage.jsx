import { useLocation, Link, Navigate } from 'react-router-dom';
import { XCircle, AlertCircle, HelpCircle, RefreshCw } from 'lucide-react';

const PaymentFailedPage = () => {
  const location = useLocation();
  const errorState = location.state;

  if (!errorState) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-sm border text-center">
        {/* Error Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 bg-danger-100 rounded-full flex items-center justify-center text-danger-600 border border-danger-200">
            <XCircle className="h-9 w-9" />
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Payment Failed
          </h1>
          <p className="text-sm text-gray-600">
            We couldn't process your payment. Please try again.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-danger-50 border border-danger-200 p-4 rounded-xl text-left">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="h-4 w-4 text-danger-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-danger-900">Error Details</p>
              <p className="text-sm text-danger-700 mt-1">
                {errorState.error || 'An error occurred while processing your payment. Please check your payment details and try again.'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <Link
            to="/cart"
            className="w-full flex items-center justify-center gap-2 border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2.5 rounded-lg transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Link>
          <a
            href="mailto:support@shopflow.com"
            className="w-full flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            <HelpCircle className="h-4 w-4" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;