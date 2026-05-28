import express from 'express';
import { 
  register, 
  login, 
  adminLogin,
  logout, 
  getMe, 
  forgotPassword, 
  resetPassword 
} from '../controllers/authController.js';
import { protect} from '../middleware/authMiddleware.js';
import { authRateLimiter } from '../middleware/rateLimiter.js';
import { registerValidator } from '../middleware/inputValidator.js';
import { updateUserProfile, manageAddresses } from '../controllers/userController.js';
import multer from 'multer';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/register', authRateLimiter, upload.single('avatar'), registerValidator, register);
router.post('/login', authRateLimiter, login);
router.post('/admin/login', authRateLimiter, adminLogin);
router.get('/logout', logout);
router.get('/me', protect, getMe);
router.post('/forgotpassword', forgotPassword);
router.put('/resetpassword/:resettoken', resetPassword);
router.put('/profile', protect, upload.single('avatar'), updateUserProfile);
router.post('/addresses', protect, manageAddresses);


export default router;
