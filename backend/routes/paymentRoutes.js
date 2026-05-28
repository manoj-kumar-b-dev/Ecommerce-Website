import express from 'express';
import {
  createRazorpayOrder,
  razorpayWebhook,
  verifyPayment
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/razorpay/create-order', protect, createRazorpayOrder);
router.post('/razorpay/verify', protect, verifyPayment);
router.post('/razorpay/webhook', razorpayWebhook);

export default router;
