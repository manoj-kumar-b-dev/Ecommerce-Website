import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Cart from '../models/Cart.js';

const ORDER_TAX_RATE = 0.18;
const FREE_SHIPPING_THRESHOLD = 150;
const STANDARD_SHIPPING_PRICE = 15;

const roundMoney = (value) => Math.round(value * 100) / 100;

export const createOrder = async (req, res, next) => {
  try {
    const {
      items,
      shippingAddress,
      paymentMethod
    } = req.body;

    if (!items || items.length === 0) {
      res.status(400);
      return next(new Error('No order items found in execution request payload'));
    }

    const requiredAddressFields = ['fullName', 'phone', 'street', 'city', 'state', 'postalCode', 'country'];
    const hasValidAddress = shippingAddress && requiredAddressFields.every((field) => String(shippingAddress[field] || '').trim());
    if (!hasValidAddress) {
      res.status(400);
      return next(new Error('Complete shipping address is required'));
    }

    if (!['Razorpay', 'COD'].includes(paymentMethod)) {
      res.status(400);
      return next(new Error('Unsupported payment method selected'));
    }

    const orderItems = [];

    // 1. Validate inventory against the database and compute trusted totals server-side.
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        res.status(404);
        return next(new Error(`Product entry ${item.name} no longer exists in inventory system`));
      }
      const quantity = Number(item.qty);
      if (!Number.isInteger(quantity) || quantity < 1) {
        res.status(400);
        return next(new Error(`Invalid quantity requested for ${product.name}`));
      }
      if (product.stock < quantity) {
        res.status(400);
        return next(new Error(`Insufficient inventory buffer allocation for ${product.name}. Available: ${product.stock}, Requested: ${quantity}`));
      }

      orderItems.push({
        product: product._id,
        name: product.name,
        qty: quantity,
        image: product.images?.[0],
        price: product.price
      });
    }

    const trustedItemsPrice = roundMoney(orderItems.reduce((sum, item) => sum + item.price * item.qty, 0));
    const trustedShippingPrice = trustedItemsPrice > FREE_SHIPPING_THRESHOLD || trustedItemsPrice === 0 ? 0 : STANDARD_SHIPPING_PRICE;
    const trustedTaxPrice = roundMoney(trustedItemsPrice * ORDER_TAX_RATE);
    const trustedTotalPrice = roundMoney(trustedItemsPrice + trustedShippingPrice + trustedTaxPrice);

    const decrementedItems = [];
    for (const item of orderItems) {
      const updatedProduct = await Product.findOneAndUpdate(
        { _id: item.product, stock: { $gte: item.qty } },
        { $inc: { stock: -item.qty } },
        { new: true }
      );
      if (!updatedProduct) {
        await Promise.all(
          decrementedItems.map((decrementedItem) => (
            Product.findByIdAndUpdate(decrementedItem.product, { $inc: { stock: decrementedItem.qty } })
          ))
        );
        res.status(409);
        return next(new Error('Inventory changed while placing this order. Please review your cart and try again.'));
      }
      decrementedItems.push(item);
    }

    // 2. Instantiate and commit the structured purchase record
    const order = new Order({
      user: req.user.id,
      items: orderItems,
      shippingAddress,
      paymentMethod,
      itemsPrice: trustedItemsPrice,
      taxPrice: trustedTaxPrice,
      shippingPrice: trustedShippingPrice,
      totalPrice: trustedTotalPrice,
      status: paymentMethod === 'COD' ? 'Processing' : 'Pending'
    });

    const createdOrder = await order.save();

    // 3. Purge the user's relational database shopping cart matching collection
    await Cart.findOneAndUpdate({ user: req.user.id }, { $set: { items: [] } });

    res.status(201).json({ success: true, order: createdOrder });
  } catch (error) {
    next(error);
  }
};

export const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      res.status(404);
      return next(new Error('Requested order registry record could not be located'));
    }

    // Access authorization constraints enforcement: Admin or account owner only
    if (req.user.role !== 'admin' && order.user._id.toString() !== req.user.id) {
      res.status(403);
      return next(new Error('Access denied: Unauthorized file structure extraction attempt'));
    }

    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

export const getAllOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

export const updateOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Target change order record trace mapping missing'));
    }

    order.status = status;
    if (status === 'Delivered') {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
    }

    await order.save();
    res.status(200).json({ success: true, order });
  } catch (error) {
    next(error);
  }
};

export const cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404);
      return next(new Error('Cancellation reference target missing'));
    }

    if (req.user.role !== 'admin' && order.user.toString() !== req.user.id) {
      res.status(403);
      return next(new Error('Unauthorized sequence access termination block'));
    }

    if (order.status === 'Shipped' || order.status === 'Delivered') {
      res.status(400);
      return next(new Error('Cannot terminate records that have already transitioned past processing bounds'));
    }

    if (order.status === 'Cancelled') {
      res.status(400);
      return next(new Error('Order has already been cancelled'));
    }

    // Restore inventory allocation pools values
    for (const item of order.items) {
      await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
    }

    order.status = 'Cancelled';
    await order.save();

    res.status(200).json({ success: true, message: 'Order record cancelled safely, inventory restored' });
  } catch (error) {
    next(error);
  }
};
