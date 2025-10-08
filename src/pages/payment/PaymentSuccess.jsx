import React, { useEffect } from 'react';
import { Result, Button, Spin, App } from 'antd';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';

const PaymentSuccess = () => {
  const { message } = App.useApp(); // Fix for Ant Design static function warning
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      console.log('Payment successful with session ID:', sessionId);
      
      // Optional: Verify session with backend for immediate feedback
      verifyPaymentSession(sessionId);
      
      message.success('Your payment was processed successfully!');
    }
  }, [sessionId, message]);

  const verifyPaymentSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      // Remove trailing /api if it exists to avoid double /api/api/
      const cleanBaseURL = baseURL.replace(/\/api$/, '');
      
      const response = await fetch(`${cleanBaseURL}/api/payments/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('✅ Payment session verified with backend:', data);
      } else {
        console.warn('Payment verification failed with status:', response.status);
      }
    } catch (error) {
      console.warn('Payment verification failed (non-critical):', error);
    }
  };

  if (!sessionId) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <Spin size="large" tip="Verifying payment..." />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Result
        icon={<CheckCircle className="w-16 h-16 text-green-500" />}
        title="Payment Successful!"
        subTitle="Your payment has been processed successfully. You will be notified once the booking is confirmed."
        extra={[
          <Link to="/client/bookings" key="dashboard">
            <Button type="primary">
              Go to My Bookings
            </Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default PaymentSuccess;
