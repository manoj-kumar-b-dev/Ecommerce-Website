import { useState } from 'react';

const INITIAL_SHIPPING_STATE = {
  fullName: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  pincode: '',
  country: ''
};

export const useCheckout = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [shippingDetails, setShippingDetails] = useState(INITIAL_SHIPPING_STATE);
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const [validationError, setValidationError] = useState('');

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingDetails(prev => ({ ...prev, [name]: value }));
  };

  const selectSavedAddress = (address) => {
    setShippingDetails({
      fullName: address.name || '',
      phone: address.phone || '',
      street: address.street || '',
      city: address.city || '',
      state: address.state || '',
      pincode: address.postalCode || '',
      country: address.country || ''
    });
  };

  const validateStep = () => {
    setValidationError('');
    if (currentStep === 1) {
      const { fullName, phone, street, city, state, pincode, country } = shippingDetails;
      if (!fullName || !phone || !street || !city || !state || !pincode || !country) {
        setValidationError('Please populate all structural shipping fields before advancing.');
        return false;
      }
      if (phone.length < 8) {
        setValidationError('Please register a valid telephone numeric value parameter string.');
        return false;
      }
    }
    return true;
  };

  const advanceStep = () => {
    if (validateStep()) setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const regressStep = () => {
    setValidationError('');
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return {
    currentStep,
    shippingDetails,
    paymentMethod,
    validationError,
    setPaymentMethod,
    setShippingDetails,
    handleShippingChange,
    selectSavedAddress,
    advanceStep,
    regressStep
  };
};
