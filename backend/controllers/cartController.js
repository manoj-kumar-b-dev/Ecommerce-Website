import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

export const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.product', 'name price images stock slug');
    
    if (!cart) {
      cart = await Cart.create({ user: req.user.id, items: [] });
    }

    res.status(200).json({ success: true, cart });
  } catch (error) {
    next(error);
  }
};

export const addToCart = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    const quantity = Number(qty) || 1;

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404);
      return next(new Error('Product not found'));
    }

    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }

    const itemIdx = cart.items.findIndex(item => item.product.toString() === productId);

    if (itemIdx > -1) {
      const targetQty = cart.items[itemIdx].qty + quantity;
      if (targetQty > product.stock) {
        res.status(400);
        return next(new Error(`Requested allocation exceeds max available stock (${product.stock})`));
      }
      cart.items[itemIdx].qty = targetQty;
    } else {
      if (quantity > product.stock) {
        res.status(400);
        return next(new Error(`Requested allocation exceeds max available stock (${product.stock})`));
      }
      cart.items.push({ product: productId, qty: quantity });
    }

    await cart.save();
    const updatedCart = await cart.populate('items.product', 'name price images stock slug');
    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const updateCartItem = async (req, res, next) => {
  try {
    const { productId, qty } = req.body;
    const quantity = Number(qty);

    if (quantity < 1) {
      res.status(400);
      return next(new Error('Quantity cannot be less than 1 unit'));
    }

    const product = await Product.findById(productId);
    if (quantity > product?.stock) {
      res.status(400);
      return next(new Error(`Insufficient system inventory. Max capacity is ${product.stock}`));
    }

    const cart = await Cart.findOne({ user: req.user.id });
    const itemIdx = cart?.items.findIndex(item => item.product.toString() === productId);

    if (!cart || itemIdx === -1) {
      res.status(404);
      return next(new Error('Item not found in matching reference cart'));
    }

    cart.items[itemIdx].qty = quantity;
    await cart.save();
    const updatedCart = await cart.populate('items.product', 'name price images stock slug');
    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const cart = await Cart.findOne({ user: req.user.id });

    if (!cart) {
      res.status(404);
      return next(new Error('Active cart collection target missing'));
    }

    cart.items = cart.items.filter(item => item.product.toString() !== productId);
    await cart.save();
    const updatedCart = await cart.populate('items.product', 'name price images stock slug');
    res.status(200).json({ success: true, cart: updatedCart });
  } catch (error) {
    next(error);
  }
};

export const clearCart = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }

    res.status(200).json({ success: true, message: 'Cart context data wiped successfully' });
  } catch (error) {
    next(error);
  }
};
