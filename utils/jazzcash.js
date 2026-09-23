// backend/utils/jazzcash.js
import CryptoJS from 'crypto-js';

// ==========================================
// ✅ JAZZCASH SANDBOX CONFIGURATION
// ==========================================
const JAZZCASH_CONFIG = {
  API_URL: 'https://sandbox.jazzcash.com.pk/ApplicationAPI/API/Payment/DoTransaction',
  MERCHANT_ID: process.env.JAZZCASH_MERCHANT_ID || 'MC19623',
  PASSWORD: process.env.JAZZCASH_PASSWORD || '8d4c9l2e',
  HASH_KEY: process.env.JAZZCASH_HASH_KEY || '4b6c8d9e0f1a2b3c4d5e6f7a8b9c0d1e',
};

// ==========================================
// ✅ GENERATE SECURE HASH
// ==========================================
const generateSecureHash = (payload) => {
  const hashString = `${JAZZCASH_CONFIG.PASSWORD}&${JAZZCASH_CONFIG.MERCHANT_ID}&${payload.pp_TxnRefNo}&${payload.pp_Amount}&${payload.pp_TxnCurrency}&${payload.pp_TxnDateTime}&${payload.pp_ExpiryDate}&${payload.pp_CustomerID}&${payload.pp_CustomerEmail}&${payload.pp_CustomerMobile}&${JAZZCASH_CONFIG.HASH_KEY}`;
  
  return CryptoJS.SHA256(hashString).toString(CryptoJS.enc.Hex).toUpperCase();
};

// ==========================================
// ✅ PROCESS JAZZCASH PAYMENT
// ==========================================
export const processJazzCashPayment = async (orderDetails) => {
  try {
    const {
      amount,
      orderId,
      customerName,
      customerEmail,
      customerMobile,
      customerAddress,
    } = orderDetails;

    // Generate transaction reference
    const transactionRef = `JC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Current timestamp
    const timeStamp = new Date().toISOString();
    
    // Expiry (30 minutes from now)
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    // Create request payload
    const payload = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY',
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_CONFIG.MERCHANT_ID,
      pp_Password: JAZZCASH_CONFIG.PASSWORD,
      pp_TxnRefNo: transactionRef,
      pp_Amount: Math.round(amount * 100).toString(), // Convert to paisa
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: timeStamp,
      pp_ExpiryDate: expiryTime,
      pp_Description: `Order ${orderId}`,
      pp_BillReference: orderId,
      pp_CustomerID: customerEmail || 'guest@example.com',
      pp_CustomerName: customerName || 'Guest Customer',
      pp_CustomerEmail: customerEmail || 'guest@example.com',
      pp_CustomerMobile: customerMobile || '03001234567',
      pp_CustomerAddress: customerAddress || 'Pakistan',
    };

    // Generate secure hash
    payload.pp_SecureHash = generateSecureHash(payload);

    console.log('📤 JazzCash Request:', payload);

    // Send request to JazzCash Sandbox API
    const response = await fetch(JAZZCASH_CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    console.log('📥 JazzCash Response:', data);

    // Check if payment was successful
    if (data.pp_ResponseCode === '000') {
      return {
        success: true,
        transactionId: data.pp_TxnRefNo || transactionRef,
        message: 'Payment successful!',
        amount: amount,
        orderId: orderId,
        raw: data,
      };
    } else {
      return {
        success: false,
        error: data.pp_ResponseMessage || 'Payment failed',
        raw: data,
      };
    }

  } catch (error) {
    console.error('❌ JazzCash payment error:', error);
    return {
      success: false,
      error: 'Unable to process payment. Please try again.',
    };
  }
};

// ==========================================
// ✅ VERIFY PAYMENT STATUS
// ==========================================
export const verifyJazzCashPayment = async (transactionRef) => {
  try {
    const timeStamp = new Date().toISOString();
    const expiryTime = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    const payload = {
      pp_Version: '1.1',
      pp_TxnType: 'MPAY',
      pp_Language: 'EN',
      pp_MerchantID: JAZZCASH_CONFIG.MERCHANT_ID,
      pp_Password: JAZZCASH_CONFIG.PASSWORD,
      pp_TxnRefNo: transactionRef,
      pp_Amount: '0',
      pp_TxnCurrency: 'PKR',
      pp_TxnDateTime: timeStamp,
      pp_ExpiryDate: expiryTime,
      pp_Description: 'Status Check',
      pp_BillReference: transactionRef,
      pp_CustomerID: 'guest@example.com',
      pp_CustomerName: 'Guest Customer',
      pp_CustomerEmail: 'guest@example.com',
      pp_CustomerMobile: '03001234567',
      pp_CustomerAddress: 'Pakistan',
    };

    payload.pp_SecureHash = generateSecureHash(payload);

    const response = await fetch(JAZZCASH_CONFIG.API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    return data;

  } catch (error) {
    console.error('❌ Verification error:', error);
    return null;
  }
};