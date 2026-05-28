import User from '../models/User.js';
import cloudinary from '../config/cloudinary.js';

// Helper: Stream upload to cloudinary
const streamUpload = (buffer, folder) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, allowed_formats: ['jpg', 'jpeg', 'png', 'webp'], max_file_size: 5 * 1024 * 1024 },
      (error, result) => {
        if (result) {
          resolve(result);
        } else {
          reject(error);
        }
      }
    );
    stream.end(buffer);
  });
};
// Helper to build user response with addresses
const buildUserResponse = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar: user.avatar,
  addresses: user.addresses
});

// Get all user addresses
export const getUserAddresses = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User account not found'));
    }
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Add a new address
export const addAddress = async (req, res, next) => {
  try {
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    // Validate required fields
    if (!name || !phone || !street || !city || !state || !postalCode || !country) {
      res.status(400);
      return next(new Error('All address fields are required'));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User account not found'));
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses.push({ name, phone, street, city, state, postalCode, country, isDefault });
    
    // Clean up any corrupted legacy addresses that lack required fields to prevent validation errors on save
    user.addresses = user.addresses.filter(addr => addr.name && addr.phone);
    
    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Update an existing address
export const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;
    const { name, phone, street, city, state, postalCode, country, isDefault } = req.body;

    // Validate required fields
    if (!name || !phone || !street || !city || !state || !postalCode || !country) {
      res.status(400);
      return next(new Error('All address fields are required'));
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User account not found'));
    }

    const addrIdx = user.addresses.findIndex(a => a._id.toString() === addressId);
    if (addrIdx === -1) {
      res.status(404);
      return next(new Error('Address not found'));
    }

    // If setting as default, unset other defaults
    if (isDefault) {
      user.addresses.forEach(addr => addr.isDefault = false);
    }

    user.addresses[addrIdx] = {
      ...user.addresses[addrIdx],
      name,
      phone,
      street,
      city,
      state,
      postalCode,
      country,
      isDefault
    };

    // Clean up any corrupted legacy addresses that lack required fields to prevent validation errors on save
    user.addresses = user.addresses.filter(addr => addr.name && addr.phone);

    await user.save();
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Delete an address
export const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User account not found'));
    }

    user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
    
    // Clean up any corrupted legacy addresses that lack required fields to prevent validation errors on save
    user.addresses = user.addresses.filter(addr => addr.name && addr.phone);
    
    await user.save();

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

// Set an address as default
export const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404);
      return next(new Error('User account not found'));
    }

    const addressExists = user.addresses.some(a => a._id.toString() === addressId);
    if (!addressExists) {
      res.status(404);
      return next(new Error('Address not found'));
    }

    // Unset all defaults and set the selected one as default
    user.addresses.forEach(addr => {
      addr.isDefault = addr._id.toString() === addressId;
    });

    // Clean up any corrupted legacy addresses that lack required fields to prevent validation errors on save
    user.addresses = user.addresses.filter(addr => addr.name && addr.phone);

    await user.save();
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};

export const updateUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      return next(new Error('User account mapping missing'));
    }

    user.name = req.body.name || user.name;
    
    // Legacy support for plain URL if passed (though we use file upload now)
    if (req.body.avatar && typeof req.body.avatar === 'string') {
      user.avatar = req.body.avatar;
    }

    if (req.file) {
      // Optional: Delete old avatar from cloudinary if cloudinary_id exists
      if (user.cloudinary_id) {
        await cloudinary.uploader.destroy(user.cloudinary_id).catch(() => {});
      }
      
      const uploadResult = await streamUpload(req.file.buffer, 'shopflow/avatars');
      user.avatar = uploadResult.secure_url;
      user.cloudinary_id = uploadResult.public_id;
    }

    // Dynamic fallback patch for phone tracking if mapped in business logic extensions
    if (req.body.phone) user.phone = req.body.phone;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.status(200).json({
      success: true,
      user: buildUserResponse(updatedUser)
    });
  } catch (error) {
    next(error);
  }
};

// Legacy function for backward compatibility
export const manageAddresses = async (req, res, next) => {
  try {
    const { action, addressId, name, phone, street, city, state, postalCode, country, isDefault } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) {
      res.status(404);
      return next(new Error('User collection target missing'));
    }

    if (action === 'ADD') {
      if (isDefault) {
        user.addresses.forEach(addr => addr.isDefault = false);
      }
      user.addresses.push({ name, phone, street, city, state, postalCode, country, isDefault });
    }
    else if (action === 'EDIT') {
      const addrIdx = user.addresses.findIndex(a => a._id.toString() === addressId);
      if (addrIdx > -1) {
        if (isDefault) {
          user.addresses.forEach(addr => addr.isDefault = false);
        }
        user.addresses[addrIdx] = { ...user.addresses[addrIdx], name, phone, street, city, state, postalCode, country, isDefault };
      }
    }
    else if (action === 'DELETE') {
      user.addresses = user.addresses.filter(a => a._id.toString() !== addressId);
    }

    // Clean up any corrupted legacy addresses that lack required fields to prevent validation errors on save
    user.addresses = user.addresses.filter(addr => addr.name && addr.phone);

    await user.save();
    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    next(error);
  }
};