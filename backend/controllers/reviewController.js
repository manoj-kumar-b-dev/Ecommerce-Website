import Review from '../models/Review.js';
import Product from '../models/Product.js';

export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Target product collection mismatch'));
    }

    const alreadyReviewed = await Review.findOne({ product: productId, user: req.user.id });
    if (alreadyReviewed) {
      res.status(400);
      return next(new Error('Product review metrics entry already logged for this account'));
    }

    const review = new Review({
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user.id,
      product: productId
    });

    await review.save();
    res.status(201).json({ success: true, message: 'Review committed and aggregated metrics recalculated safely' });
  } catch (error) {
    next(error);
  }
};