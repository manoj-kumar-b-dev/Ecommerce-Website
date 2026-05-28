import { useState } from 'react';
import { X, Star } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';

const ReviewModal = ({ productId, onClose, onSuccess }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axiosInstance.post(`/api/products/${productId}/reviews`, { rating, comment });
      onSuccess();
      onClose();
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing appraisal entry logs');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border relative animate-scale-up">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-700">
          <X className="h-5 w-5" />
        </button>

        <h3 className="text-base font-bold text-gray-900 mb-4">Write Verified Product Review</h3>

        <form onSubmit={handleSubmitReview} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-2">Item Score Allocation</label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((starNum) => (
                <button
                  key={starNum}
                  type="button"
                  onClick={() => setRating(starNum)}
                  onMouseEnter={() => setHoverRating(starNum)}
                  onMouseLeave={() => setHoverRating(0)}
                  className="text-amber-400 focus:outline-none"
                >
                  <Star className={`h-6 w-6 ${starNum <= (hoverRating || rating) ? 'fill-amber-400' : 'text-gray-200'}`} />
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Feedback Evaluation Commentary</label>
            <textarea
              required
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Detail your firsthand experiential evaluation parameters safely..."
              className="w-full text-xs p-2.5 border border-gray-300 rounded focus:ring-1 focus:ring-primary focus:outline-none bg-gray-50/50 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !comment.trim()}
            className="w-full bg-primary hover:bg-primary-dark text-white font-bold text-xs py-2.5 rounded transition-colors disabled:opacity-40"
          >
            {submitting ? 'Submitting Log Entry...' : 'Post Evaluation Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ReviewModal;