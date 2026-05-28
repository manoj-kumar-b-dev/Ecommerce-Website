import Product from '../models/Product.js';
import Category from '../models/Category.js';

const DEFAULT_CATEGORIES = [
  { name: 'Electronics', slug: 'electronics' },
  { name: 'Apparel & Fashion', slug: 'apparel-fashion' },
  { name: 'Home Living', slug: 'home-living' }
];

export const getCategories = async (req, res, next) => {
  try {
    let categories = await Category.find({ isActive: true }).sort({ name: 1 });
    if (categories.length === 0) {
      categories = await Category.insertMany(DEFAULT_CATEGORIES);
    }
    res.status(200).json({ success: true, categories });
  } catch (error) {
    next(error);
  }
};

export const getProducts = async (req, res, next) => {
  try {
    const { 
      category, 
      minPrice, 
      maxPrice, 
      rating, 
      brand, 
      search, 
      sort, 
      page = 1, 
      limit = 12 
    } = req.query;

    // 1. Build Query Object
    const query = {};

    if (category) query.category = category;
    if (brand) query.brand = brand;
    
    // Price range filtering
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Minimum rating filter
    if (rating) {
      query.avgRating = { $gte: Number(rating) };
    }

    // Text search by name/tags
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // 2. Setup Sorting Options
    let sortOptions = {};
    if (sort === 'priceAsc') sortOptions.price = 1;
    else if (sort === 'priceDesc') sortOptions.price = -1;
    else if (sort === 'rating') sortOptions.avgRating = -1;
    else if (sort === 'newest') sortOptions.createdAt = -1;
    else sortOptions.isFeatured = -1; // Default "Featured" sort

    // 3. Execution with Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    const products = await Product.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(Number(limit))
      .populate('category', 'name slug');

    const totalProducts = await Product.countDocuments(query);

    res.status(200).json({
      success: true,
      count: products.length,
      pagination: {
        totalProducts,
        totalPages: Math.ceil(totalProducts / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit)
      },
      products
    });
  } catch (error) {
    next(error);
  }
};

export const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('category', 'name slug');
    if (!product) {
      res.status(404);
      return next(new Error('Product not found matching that slug identifier'));
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const getProductById = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id).populate('category', 'name slug');
    if (!product) {
      res.status(404);
      return next(new Error('Product not found matching that structural ID'));
    }
    res.status(200).json({ success: true, product });
  } catch (error) {
    next(error);
  }
};

export const getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ isFeatured: true }).limit(6);
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    next(error);
  }
};

export const getRelatedProducts = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.productId);
    if (!product) {
      res.status(404);
      return next(new Error('Base product item missing'));
    }

    // Fetch up to 4 items in same category, excluding the current product
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    }).limit(4);

    res.status(200).json({ success: true, products: related });
  } catch (error) {
    next(error);
  }
};
