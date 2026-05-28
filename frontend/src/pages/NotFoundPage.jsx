import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Compass } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="mx-auto h-16 w-16 bg-indigo-50 text-primary rounded-full flex items-center justify-center animate-bounce">
          <Compass className="h-8 w-8 stroke-[1.5]" />
        </div>
        <div className="space-y-2">
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">404</h1>
          <h2 className="text-lg font-bold text-gray-900">Resource Matrix Mismatch</h2>
          <p className="text-xs text-gray-400 max-w-xs mx-auto leading-relaxed">
            The explicit pointer context location variables requested do not map to an established routing entry path.
          </p>
        </div>
        <Link
          to="/"
          className="inline-flex items-center gap-2 bg-primary hover:bg-primary-dark text-white font-bold text-xs px-6 py-2.5 rounded-md shadow-sm transition-colors focus:outline-none"
        >
          <ArrowLeft className="h-4 w-4" /> Return to Secure Portal Home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
