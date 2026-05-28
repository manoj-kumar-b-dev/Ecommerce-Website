import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      maxlength: [50, 'Category name cannot exceed 50 characters']
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },
    image: {
      type: String,
      default: 'https://res.cloudinary.com/demo/image/upload/v1/sample.jpg'
    },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null // Enables self-referential infinite sub-categorization
    },
    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
);

// Index to quickly pull down subcategories of a given parent node
categorySchema.index({ parent: 1 });

const Category = mongoose.model('Category', categorySchema);
export default Category;