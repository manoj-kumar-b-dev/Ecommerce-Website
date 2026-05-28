import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

const getCloudinaryPublicId = (imageUrl) => {
  try {
    const url = new URL(imageUrl);
    const uploadMarker = '/upload/';
    const uploadIndex = url.pathname.indexOf(uploadMarker);
    if (uploadIndex === -1) return null;

    const pathAfterUpload = url.pathname.slice(uploadIndex + uploadMarker.length);
    const withoutVersion = pathAfterUpload.replace(/^v\d+\//, '');
    return withoutVersion.replace(/\.[^/.]+$/, '');
  } catch (error) {
    return null;
  }
};

const deleteCloudinaryImages = async (products) => {
  const publicIds = products
    .flatMap((product) => product.images || [])
    .map(getCloudinaryPublicId)
    .filter(Boolean);

  if (publicIds.length === 0 || !process.env.CLOUDINARY_API_SECRET) return;
  await Promise.allSettled(publicIds.map((publicId) => cloudinary.uploader.destroy(publicId)));
};

export const getAdminStats = async (req, res, next) => {
  try {
    // 1. Calculate Core Financial & Architectural Metrics Indexes
    const totalOrders = await Order.countDocuments({ status: { $ne: 'Cancelled' } });
    const totalProducts = await Product.countDocuments({});
    const totalUsers = await User.countDocuments({});

    const revenueResult = await Order.aggregate([
      { $match: { isPaid: true, status: { $ne: 'Cancelled' } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalPrice' } } }
    ]);
    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // 2. Fetch Recent Orders Grid Stream Matrix
    const recentOrders = await Order.find({})
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);

    // 3. Top Selling Products Aggregation Algorithm Lookups
    const topProducts = await Order.aggregate([
      { $match: { status: { $ne: 'Cancelled' } } },
      { $unwind: '$items' },
      {
        $group: {
          _id: '$items.product',
          name: { $first: '$items.name' },
          image: { $first: '$items.image' },
          totalQtySold: { $sum: '$items.qty' },
          totalGenerated: { $sum: { $multiply: ['$items.price', '$items.qty'] } }
        }
      },
      { $sort: { totalQtySold: -1 } },
      { $limit: 5 }
    ]);

    // 4. Generate 7-Day Revenue Historical Graph Sequence Time-series Matrices
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const revenueTimeline = await Order.aggregate([
      { $match: { isPaid: true, createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } },
      {
        $group: {
          _id: { $dateToString: { format: '%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: { totalRevenue, totalOrders, totalProducts, totalUsers },
      recentOrders,
      topProducts,
      revenueTimeline
    });
  } catch (error) {
    next(error);
  }
};

export const manageAdminProducts = async (req, res, next) => {
  const { id } = req.query;

  try {
    if (req.method === 'POST') {
      const product = new Product(req.body);
      const saved = await product.save();
      return res.status(201).json({ success: true, product: saved });
    }

    if (req.method === 'PUT') {
      const updated = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
      if (!updated) return res.status(404).json({ success: false, message: 'Item trace missed' });
      return res.status(200).json({ success: true, product: updated });
    }

    if (req.method === 'DELETE') {
      const { bulkIds } = req.body;
      if (bulkIds && Array.isArray(bulkIds)) {
        const products = await Product.find({ _id: { $in: bulkIds } });
        await deleteCloudinaryImages(products);
        await Product.deleteMany({ _id: { $in: bulkIds } });
        return res.status(200).json({ success: true, message: 'Bulk deletion sequence resolved' });
      }
      const product = await Product.findById(id);
      if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
      await deleteCloudinaryImages([product]);
      await product.deleteOne();
      return res.status(200).json({ success: true, message: 'Item evicted' });
    }
  } catch (error) {
    next(error);
  }
};

export const manageAdminUsers = async (req, res, next) => {
  const { id } = req.query;
  try {
    if (req.method === 'GET') {
      const users = await User.find({}).sort({ createdAt: -1 });
      return res.status(200).json({ success: true, users });
    }
    if (req.method === 'PUT') {
      const user = await User.findById(id);
      if (!user) return res.status(404).json({ success: false, message: 'Target profile lost' });
      user.role = user.role === 'admin' ? 'user' : 'admin';
      await user.save();
      return res.status(200).json({ success: true, user });
    }
    if (req.method === 'DELETE') {
      await User.findByIdAndDelete(id);
      return res.status(200).json({ success: true, message: 'Identity structure disengaged' });
    }
  } catch (error) {
    next(error);
  }
};

export const uploadProductImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file provided. Make sure field name is "file".' });
    }

    // Wrap upload_stream in a Promise so errors propagate correctly
    const uploadResult = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'shopflow/products',
          allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          max_file_size: 10 * 1024 * 1024 // 10MB
        },
        (error, result) => {
          if (error) return reject(error);
          resolve(result);
        }
      );
      stream.end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      image_url: uploadResult.secure_url,
      public_id: uploadResult.public_id
    });
  } catch (error) {
    next(error);
  }
};

