import express from 'express';
import { getAdminStats, manageAdminProducts, manageAdminUsers, uploadProductImage } from '../controllers/adminController.js';
import { getAllOrders, updateOrderStatus } from '../controllers/orderController.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import multer from 'multer';

const router = express.Router();
const MAX_UPLOAD_SIZE_MB = 25;

// ─── Multer Configuration ──────────────────────────────────────────────────────
// Android cameras can produce HEIC, WebP, and large JPEG files.
// fileFilter validates MIME type early so we reject garbage before it hits Cloudinary.
// 15MB limit covers high-res camera photos (modern Android cameras can produce 10-12MB JPEGs).
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
]);
const GENERIC_ANDROID_MIME_TYPES = new Set(['', 'application/octet-stream']);
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|heic|heif)$/i;

const imageFileFilter = (req, file, cb) => {
  const mimeType = file.mimetype?.toLowerCase() || '';
  const originalName = file.originalname?.toLowerCase() || '';

  // Accept if MIME type is in the allow-list
  if (ALLOWED_MIME_TYPES.has(mimeType)) {
    console.log(`[UPLOAD] Accepted file: ${file.originalname} (${mimeType})`);
    return cb(null, true);
  }

  // Some Android/Samsung browsers send image files with no MIME type or
  // a generic "application/octet-stream" MIME type. In that case, fall back
  // to checking the file extension before rejecting.
  if (GENERIC_ANDROID_MIME_TYPES.has(mimeType) && IMAGE_EXT_RE.test(originalName)) {
    console.log(`[UPLOAD] Accepted by extension fallback: ${file.originalname} (${mimeType})`);
    return cb(null, true);
  }

  console.warn(`[UPLOAD] Rejected file: ${file.originalname} — unsupported type: ${mimeType}`);
  cb(new Error(`Unsupported file type: ${mimeType || 'unknown'}. Please upload a JPG, PNG, WebP, or HEIC image.`));
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_UPLOAD_SIZE_MB * 1024 * 1024,
  },
  fileFilter: imageFileFilter,
});

// ─── Auth guard for all admin routes ──────────────────────────────────────────
router.use(protect, adminOnly);

// ─── Image Upload ─────────────────────────────────────────────────────────────
// Multer errors are caught explicitly here so they return structured 400 JSON
// instead of a silent req.file = undefined or an unhandled 500.
router.post('/upload', (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const isMulterError = err instanceof multer.MulterError;
      const status = isMulterError || err.message?.startsWith('Unsupported file type') ? 400 : 500;
      const message = err.code === 'LIMIT_FILE_SIZE'
        ? `Image is too large. Maximum upload size is ${MAX_UPLOAD_SIZE_MB} MB.`
        : isMulterError
          ? `Upload error: ${err.message}`
          : err.message || 'Server error during upload.';
      console.error('[UPLOAD] Multer error:', err.message);
      return res.status(status).json({ success: false, message });
    }
    next();
  });
}, uploadProductImage);

// ─── Admin Routes ─────────────────────────────────────────────────────────────
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
