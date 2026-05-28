import axiosInstance from '../utils/axiosInstance';

export const useRazorpay = () => {
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        return resolve(true);
      }
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const initiatePayment = async (orderId, totalAmount, userInfo, onSuccess, onFailure) => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      onFailure('Razorpay engine connection timeout error. Check network state components.');
      return;
    }

    try {
      // 1. Fetch Gateway Instance Order Parameters from API
      const { data } = await axiosInstance.post('/api/payment/razorpay/create-order', { orderId });
      
      // 2. Map Payment Modal Properties
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: data.amount,
        currency: data.currency,
        name: 'ShopFlow E-Commerce',
        description: `Settlement Pipeline - ID #${orderId}`,
        order_id: data.gatewayOrderId,
        prefill: {
          name: userInfo.name,
          email: userInfo.email,
          contact: userInfo.phone || '9999999999'
        },
        theme: { color: '#4f46e5' }, // ShopFlow Primary Brand Palette mapping color
        handler: async (response) => {
          try {
            const verificationPayload = {
              orderId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            };
            const verifyRes = await axiosInstance.post('/api/payment/razorpay/verify', verificationPayload);
            if (verifyRes.data.success) {
              onSuccess(verifyRes.data.orderId, response.razorpay_payment_id);
            }
          } catch (err) {
            onFailure(err.response?.data?.message || 'Verification token analysis failed.');
          }
        },
        modal: {
          ondismiss: () => {
            onFailure('Payment checkout gateway window closed by user constraint.');
          }
        }
      };

      const razorpayInstanceWindow = new window.Razorpay(options);
      razorpayInstanceWindow.open();
    } catch (error) {
      onFailure(error.response?.data?.message || 'Failed initializing payment transaction order payload.');
    }
  };

  return { initiatePayment };
};