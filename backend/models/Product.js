import mongoose from 'mongoose';

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [150, 'Product name cannot exceed 150 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      maxlength: [2000, 'Description cannot exceed 2000 characters']
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative']
    },
    comparePrice: {
      type: Number,
      default: 0,
      min: [0, 'Compare price cannot be negative']
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: [true, 'Product must belong to a category']
    },
    brand: {
      type: String,
      required: [true, 'Product brand is required'],
      trim: true
    },
    images: {
      type: [String],
      validate: [
        (val) => val.length > 0,
        'Product must have at least one image'
      ]
    },
    stock: {
      type: Number,
      required: [true, 'Stock count is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0
    },
    numReviews: {
      type: Number,
      default: 0,
      min: 0
    },
    avgRating: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be less than 0'],
      max: [5, 'Rating cannot be greater than 5'],
      set: (val) => Math.round(val * 10) / 10 // Rounds to 1 decimal place (e.g., 4.34 -> 4.3)
    },
    isFeatured: {
      type: Boolean,
      default: false
    },
    tags: {
      type: [String],
      default: []
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound and Single Compound Indexes for optimized execution
productSchema.index({ name: 'text', description: 'text' });
productSchema.index({ category: 1 });
productSchema.index({ price: 1 });

// Virtual Field: Calculate percentage discount dynamically
productSchema.virtual('discountPercent').get(function () {
  if (this.comparePrice && this.comparePrice > this.price) {
    const savings = this.comparePrice - this.price;
    return Math.round((savings / this.comparePrice) * 100);
  }
  return 0;
});

const Product = mongoose.model('Product', productSchema);
export default Product;