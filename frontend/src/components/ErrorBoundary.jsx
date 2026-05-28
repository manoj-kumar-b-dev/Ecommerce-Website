import React, { Component } from 'react';
import { AlertOctagon } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an unhandled runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-xl shadow-sm border">
            <div className="mx-auto h-12 w-12 bg-red-50 rounded-full flex items-center justify-center text-red-500">
              <AlertOctagon className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-gray-900">Application Error Encountered</h1>
            <p className="text-xs text-gray-500 leading-relaxed">
              An unexpected validation exception occurred inside the client view lifecycle. Try resetting your application cache memory parameters.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-primary hover:bg-primary-dark text-white text-xs font-semibold py-2 px-4 rounded transition-colors focus:outline-none"
            >
              Refresh View Instance
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;