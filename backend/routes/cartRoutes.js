import express from 'express';
import {
  addToCart,
  clearCart,
  getCart,
  removeFromCart,
  updateCartItem
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getCart)
  .post(addToCart)
  .put(updateCartItem)
  .delete(clearCart);

router.delete('/:productId', removeFromCart);

export default router;
