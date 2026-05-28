import crypto from 'crypto';
import nodemailer from 'nodemailer';
import razorpayInstance from '../config/razorpay.js';
import Order from '../models/Order.js';
import Product from '../models/Product.js';

// Helper: Dispatch Transaction Invoice Email Node
const sendInvoiceEmail = async (order, userEmail) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.mailtrap.io',
      port: process.env.SMTP_PORT || 2525,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });

    await transporter.sendMail({
      from: '"ShopFlow Payments" <billing@shopflow.com>',
      to: userEmail,
      subject: `Order Payment Confirmed - #${order._id}`,
      text: `Thank you for your purchase! Total Paid: ₹${order.totalPrice}. Your order status is: ${order.status}.`
    });
  } catch (error) {
    console.error('Invoice dispatch failure trace:', error);
  }
};

export const createRazorpayOrder = async (req, res, next) => {
  try {
    const { orderId } = req.body;
    const order = await Order.findById(orderId);

    if (!order) {
      res.status(404);
      return next(new Error('Order reference target mismatch'));
    }

    if (order.user.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('You are not allowed to initiate payment for this order'));
    }

    if (order.isPaid) {
      res.status(400);
      return next(new Error('This order has already been paid'));
    }

    if (order.status === 'Cancelled') {
      res.status(400);
      return next(new Error('Cancelled orders cannot be paid'));
    }

    // Convert INR directly to sub-unit Paise equivalents
    const amountInPaise = Math.round(order.totalPrice * 100);

    const options = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: order._id.toString(),
      notes: { orderId: order._id.toString() }
    };

    const razorpayOrder = await razorpayInstance.orders.create(options);

    res.status(200).json({
      success: true,
      gatewayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!orderId || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400);
      return next(new Error('Missing Razorpay verification fields'));
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      res.status(500);
      return next(new Error('Razorpay key secret is not configured'));
    }

    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    // Use timingSafeEqual to avoid timing side-channel attacks
    const expectedBuffer = Buffer.from(expectedSignature, 'utf-8');
    const receivedBuffer = Buffer.from(razorpay_signature, 'utf-8');
    if (expectedBuffer.length !== receivedBuffer.length) {
      res.status(400);
      return next(new Error('Cryptographic signature verification failed'));
    }

    const isSignatureValid = crypto.timingSafeEqual(
      expectedBuffer,
      receivedBuffer
    );

    if (!isSignatureValid) {
      res.status(400);
      return next(new Error('Cryptographic signature verification failed'));
    }

    const order = await Order.findById(orderId).populate('user', 'email');
    if (!order) {
      res.status(404);
      return next(new Error('Associated order details missing'));
    }

    if (order.user._id.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403);
      return next(new Error('You are not allowed to verify payment for this order'));
    }

    if (order.isPaid) {
      return res.status(200).json({ success: true, orderId: order._id });
    }

    if (order.status === 'Cancelled') {
      res.status(400);
      return next(new Error('Cancelled order cannot be marked as paid'));
    }

    order.isPaid = true;
    order.paidAt = Date.now();
    order.status = 'Processing';
    order.paymentResult = { id: razorpay_payment_id, status: 'Captured', update_time: String(Date.now()) };

    await order.save();
    await sendInvoiceEmail(order, order.user.email);

    res.status(200).json({ success: true, orderId: order._id });
  } catch (error) {
    next(error);
  }
};

export const razorpayWebhook = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const signature = req.headers['x-razorpay-signature'];

  try {
    const shasum = crypto.createHmac('sha256', secret);
    // Note: requires raw unparsed body parameter mapping
    shasum.update(req.body);
    const digest = shasum.digest('hex');

    if (digest !== signature) {
      return res.status(200).json({ status: 'ignored', reason: 'Signature mismatch' });
    }

    const eventPayload = JSON.parse(req.body.toString());
    const orderId = eventPayload.payload.payment.entity.notes?.orderId || eventPayload.payload.payment.entity.order_id;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(200).json({ status: 'ok', detail: 'Order not found' });
    }

    if (eventPayload.event === 'payment.captured') {
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
        order.status = 'Processing';
        order.paymentResult = { id: eventPayload.payload.payment.entity.id, status: 'Captured', update_time: String(Date.now()) };
        await order.save();
      }
    } else if (eventPayload.event === 'payment.failed') {
      order.status = 'Cancelled';
      await order.save();

      // Restore product stock inventories
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.qty } });
      }
    }

    // Always respond 200 OK to stop Razorpay retry mechanisms
    res.status(200).json({ status: 'ok' });
  } catch (err) {
    res.status(200).json({ status: 'ok', error: err.message });
  }
};
