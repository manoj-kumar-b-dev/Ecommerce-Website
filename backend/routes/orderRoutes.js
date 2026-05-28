import express from 'express';
import { 
  createOrder, 
  getOrderById, 
  getMyOrders, 
  getAllOrders, 
  updateOrderStatus, 
  cancelOrder 
} from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

// SECURITY: All order routes require authentication
router.use(protect);

// User order endpoints (available to all authenticated users)
router.post('/', createOrder);
router.get('/myorders', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

// Admin-only order management endpoints
// SECURITY: These routes are restricted to admin users only
router.get('/', adminOnly, getAllOrders);
router.put('/:id/status', adminOnly, updateOrderStatus);

export default router;