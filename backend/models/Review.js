import mongoose from 'mongoose';
import Product from './Product.js';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: {
      type: String,
      required: true // Caches reviewer's name so you don't always need to populate users
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating between 1 and 5'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5']
    },
    comment: {
      type: String,
      required: [true, 'Please enter a review comment'],
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    }
  },
  {
    timestamps: true
  }
);

// Prevent a single user from leaving multiple reviews on the exact same product
reviewSchema.index({ product: 1, user: 1 }, { unique: true });

// Static Method: Automatically recalculates and updates Product stats via aggregation
reviewSchema.statics.calculateAverageRating = async function (productId) {
  const stats = await this.aggregate([
    { $match: { product: productId } },
    {
      $group: {
        _id: '$product',
        numReviews: { $sum: 1 },
        avgRating: { $avg: '$rating' }
      }
    }
  ]);

  try {
    if (stats.length > 0) {
      await Product.findByIdAndUpdate(productId, {
        numReviews: stats[0].numReviews,
        avgRating: stats[0].avgRating
      });
    } else {
      await Product.findByIdAndUpdate(productId, {
        numReviews: 0,
        avgRating: 0
      });
    }
  } catch (error) {
    console.error('Error auto-calculating ratings metrics: ', error);
  }
};

// Post-save hook to update average rating metrics when a review is created
reviewSchema.post('save', async function () {
  await this.constructor.calculateAverageRating(this.product);
});

// Post-delete hook to update average rating metrics when a review is removed
reviewSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await doc.constructor.calculateAverageRating(doc.product);
  }
});

const Review = mongoose.model('Review', reviewSchema);
export default Review;