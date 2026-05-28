import express from 'express';
import { getAdminStats, manageAdminProducts, manageAdminUsers, uploadProductImage } from '../controllers/adminController.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect, adminOnly);

router.post('/upload', upload.single('file'), uploadProductImage);

router.get('/stats', getAdminStats);

router.route('/products')
  .post(manageAdminProducts)
  .put(manageAdminProducts)
  .delete(manageAdminProducts);

router.route('/orders')
  .get(getAllOrders);
router.put('/orders/:id/status', updateOrderStatus);

router.route('/users')
  .get(manageAdminUsers)
  .put(manageAdminUsers)
  .delete(manageAdminUsers);

export default router;