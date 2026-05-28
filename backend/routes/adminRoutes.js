import express from 'express';
import { getAdminStats, manageAdminProducts, manageAdminUsers, uploadProductImage } from '../controllers/adminController.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.use(protect, adminOnly);

// Handle multer errors explicitly so they return 400 (not a silent req.file = undefined)
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      return res.status(400).json({ success: false, message: `File error: ${err.message}` });
    }
    next();
  });
}, uploadProductImage);

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