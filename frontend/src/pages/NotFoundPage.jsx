import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass, ShoppingBag } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <div className="max-w-lg w-full text-center space-y-8 bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 animate-fade-in relative overflow-hidden">
        {/* Decorative Grid */}
        <div className="absolute inset-0 bg-grid-gray-100/[0.2] bg-[size:20px_20px] pointer-events-none" />

        {/* Icon */}
        <div className="mx-auto h-24 w-24 bg-primary-50 text-primary-600 rounded-full flex items-center justify-center shadow-inner relative z-10">
          <Compass className="h-12 w-12" />
        </div>

        <div className="space-y-4 relative z-10">
          <h1 className="text-7xl font-heading font-black text-gray-900 tracking-tight">404</h1>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-gray-900">Oops! Page Not Found</h2>
          <p className="text-base text-gray-600 max-w-sm mx-auto leading-relaxed">
            The page you're looking for seems to have gone missing. Don't worry, you can always find your way back.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6 relative z-10">
          <Link
            to="/"
            className="w-full sm:w-auto flex justify-center items-center gap-2 btn btn-primary py-3.5 px-8"
          >
            <ArrowLeft className="h-5 w-5" />
            Back to Home
          </Link>
          <Link
            to="/shop"
            className="w-full sm:w-auto flex justify-center items-center gap-2 bg-white border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-bold py-3.5 px-8 rounded-xl transition-all"
          >
            <ShoppingBag className="h-5 w-5" />
            Go to Shop
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;
