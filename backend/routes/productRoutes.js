import express from 'express';
import {
  getProducts,
  getCategories,
  getProductBySlug,
  getProductById,
  getFeaturedProducts,
  getRelatedProducts
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import { createProductReview } from '../controllers/reviewController.js';

const router = express.Router();

router.get('/', getProducts);
router.get('/categories', getCategories);
router.get('/featured', getFeaturedProducts);
router.get('/slug/:slug', getProductBySlug);
router.get('/related/:productId', getRelatedProducts);
router.get('/:id', getProductById);
router.post('/:id/reviews', protect, createProductReview);

export default router;
