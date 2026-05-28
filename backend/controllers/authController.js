import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
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

// Helper: Generate JWT and attach cookie option
const sendTokenResponse = (user, statusCode, res) => {
  const token = user.generateToken();

  const cookieOptions = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 Days
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  };

  res
    .status(statusCode)
    .cookie('token', token, cookieOptions)
    .json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar
      }
    });
};

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      res.status(400);
      return next(new Error('A user account with this email already exists'));
    }

    let avatarData = {};
    if (req.file) {
      const uploadResult = await streamUpload(req.file.buffer, 'shopflow/avatars');
      avatarData.avatar = uploadResult.secure_url;
      avatarData.cloudinary_id = uploadResult.public_id;
    }

    const user = await User.create({ name, email, password, ...avatarData });
    sendTokenResponse(user, 201, res);
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide both an email and password'));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Invalid credentials provided'));
    }

    // SECURITY: Prevent admin accounts from logging in through user login
    if (user.role === 'admin') {
      res.status(403);
      return next(new Error('Admin accounts must login through the admin portal'));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      return next(new Error('Please provide both an email and password'));
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      return next(new Error('Invalid admin credentials provided'));
    }

    if (user.role !== 'admin') {
      res.status(403);
      return next(new Error('This account does not have admin access'));
    }

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  res.cookie('token', 'none', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true
  });

  res.status(200).json({ success: true, message: 'Logged out successfully' });
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      res.status(404);
      return next(new Error('No account found with that email address'));
    }

    // Generate ephemeral reset token (Valid for 10 minutes)
    const resetToken = crypto.randomBytes(20).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Dynamically patch user model for temporary verification properties
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${req.protocol}://${req.get('host')}/api/auth/resetpassword/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });

    const message = {
      from: `"ShopFlow Security" <noreply@shopflow.com>`,
      to: user.email,
      subject: 'ShopFlow Account Password Recovery Link',
      text: `You requested a password reset. Please complete the process by clicking: \n\n ${resetUrl}`
    };

    await transporter.sendMail(message);
    res.status(200).json({ success: true, message: 'Recovery email dispatched successfully' });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (req, res, next) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    // Access un-exported models queries fields dynamically 
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      res.status(400);
      return next(new Error('Password reset token is invalid or has expired'));
    }

    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    sendTokenResponse(user, 200, res);
  } catch (error) {
    next(error);
  }
};
