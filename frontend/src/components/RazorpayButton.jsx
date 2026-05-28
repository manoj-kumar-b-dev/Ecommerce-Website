import { useState } from 'react';
import { CreditCard, Loader2 } from 'lucide-react';

const RazorpayButton = ({ onClick, amount, disabled }) => {
  const [loading, setLoading] = useState(false);

  const handleActionIntercept = async () => {
    setLoading(true);
    try {
      await onClick();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={handleActionIntercept}
      className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-md shadow-sm transition-all focus:outline-none disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <CreditCard className="h-4 w-4" />
      )}
      <span>Pay With Razorpay Gateway (₹{amount})</span>
    </button>
  );
};

export default RazorpayButton;