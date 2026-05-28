import express from 'express';
import {
  getUserAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/addresses
 * @desc    Get all addresses for logged-in user
 * @access  Private
 */
router.get('/', protect, getUserAddresses);

/**
 * @route   POST /api/addresses
 * @desc    Add a new address
 * @access  Private
 */
router.post('/', protect, addAddress);

/**
 * @route   PUT /api/addresses/:addressId
 * @desc    Update an existing address
 * @access  Private
 */
router.put('/:addressId', protect, updateAddress);

/**
 * @route   DELETE /api/addresses/:addressId
 * @desc    Delete an address
 * @access  Private
 */
router.delete('/:addressId', protect, deleteAddress);

/**
 * @route   PATCH /api/addresses/:addressId/set-default
 * @desc    Set an address as default
 * @access  Private
 */
router.patch('/:addressId/set-default', protect, setDefaultAddress);

export default router;