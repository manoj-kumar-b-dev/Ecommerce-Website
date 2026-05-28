import User from '../models/User.js';

export const toggleWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;
    const user = await User.findById(req.user.id);

    const isAdded = user.wishlist.includes(productId);
    if (isAdded) {
      user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    } else {
      user.wishlist.push(productId);
    }

    await user.save();
    res.status(200).json({ success: true, isWishlisted: !isAdded, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};

export const getWishlist = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist', 'name price images stock slug brand discountPercent comparePrice');
    res.status(200).json({ success: true, wishlist: user.wishlist });
  } catch (error) {
    next(error);
  }
};