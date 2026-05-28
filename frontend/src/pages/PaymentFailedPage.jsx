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
      <div className="max-w-md w-full space-y-8 bg-white p-6 sm:p-10 rounded-3xl shadow-sm border border-gray-100 text-center animate-fade-in relative overflow-hidden">
        {/* Danger Background Element */}
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-danger-50 to-transparent pointer-events-none" />

        {/* Error Icon */}
        <div className="flex justify-center relative z-10">
          <div className="w-24 h-24 bg-danger-100 rounded-full flex items-center justify-center text-danger-600 border-4 border-white shadow-md">
            <XCircle className="h-12 w-12" />
          </div>
        </div>

        <div className="space-y-3 relative z-10">
          <h1 className="text-3xl md:text-4xl font-heading font-bold text-gray-900 leading-tight">
            Payment Failed
          </h1>
          <p className="text-base text-gray-600 leading-relaxed">
            We couldn't process your payment. Your account has not been charged.
          </p>
        </div>

        {/* Error Details */}
        <div className="bg-danger-50 border border-danger-200 p-5 rounded-2xl text-left relative z-10">
          <div className="flex items-start gap-3">
            <div className="bg-white p-1 rounded-full flex-shrink-0 mt-0.5">
              <AlertCircle className="h-5 w-5 text-danger-600" />
            </div>
            <div>
              <p className="text-sm font-bold text-danger-900 uppercase tracking-wider mb-1">Error Details</p>
              <p className="text-sm font-medium text-danger-800 leading-relaxed">
                {errorState.error || 'An error occurred while processing your payment. Please check your payment details and try again.'}
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4 relative z-10">
          <Link
            to="/cart"
            className="w-full flex justify-center items-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3.5 px-6 rounded-xl transition-all"
          >
            <RefreshCw className="h-5 w-5" />
            Try Again
          </Link>
          <a
            href="mailto:support@shopflow.com"
            className="w-full flex justify-center items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold py-3.5 px-6 rounded-xl transition-all shadow-md active:scale-95"
          >
            <HelpCircle className="h-5 w-5" />
            Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};

export default PaymentFailedPage;