import React, { useEffect } from 'react';
import { Result, Button, Spin, App } from 'antd';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useSubscription } from '../../context/provider/SubscriptionContext';
import { useAuth } from '../../context/AuthContext';

const PaymentSuccess = () => {
  const { message } = App.useApp(); // Fix for Ant Design static function warning
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { getCurrentSubscription, forceRefreshSubscription, updateSubscriptionManually } = useSubscription();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentType, setPaymentType] = React.useState('booking'); // 'booking' or 'subscription'

  useEffect(() => {
    if (sessionId) {
      console.log('Payment successful with session ID:', sessionId);
      verifyPaymentSession(sessionId);
      message.success('Your payment was processed successfully!');
    }
  }, [sessionId, message]);

  const verifyPaymentSession = async (sessionId) => {
    try {
      const token = localStorage.getItem('token');
      const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:5000';
      const cleanBaseURL = baseURL.replace(/\/api$/, '');
      
      // First try subscription verification (for subscription checkouts)
      let response = await fetch(`${cleanBaseURL}/api/subscription/verify-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      });
      
      if (response.ok) {
        // Subscription verified
        const data = await response.json();
        console.log('✅ Subscription session verified with backend:', data);
        setPaymentType('subscription');
        message.success('Your subscription has been activated successfully!');
        
        // IMMEDIATE subscription context refresh after successful backend verification
        if (user?.role === 'provider') {
          console.log('🔄 Starting IMMEDIATE subscription context refresh...');
          console.log('📋 Backend verification successful, data:', data);
          
          // Force immediate refresh of subscription context
          setTimeout(async () => {
            console.log('⏳ Step 1: Forcing immediate subscription context refresh...');
            const refreshResult = await forceRefreshSubscription();
            console.log('📊 Context refresh result:', refreshResult);
            
            // Check current subscription status after refresh
            const currentStatus = refreshResult?.data?.subscription?.subscriptionStatus;
            console.log('📈 Subscription status in context after refresh:', currentStatus);
            
            // Check if context refresh worked, if not force page reload
            if (!refreshResult?.success || currentStatus !== 'active') {
              console.log('⚠️ Context refresh failed or subscription not active in context');
              console.log('💡 Backend says subscription is active, but context shows:', currentStatus);
              console.log('� The backend verification was successful, so forcing page reload to sync UI...');
              
              // Show user message and reload page to force fresh context
              message.success('Subscription activated! Refreshing page to update display...', 3);
              setTimeout(() => {
                window.location.reload();
              }, 1500);
            } else {
              console.log('✅ Context successfully refreshed - subscription is now active in UI!');
              console.log('🎉 Automatically navigating to subscription page...');
              
              // Show success message and auto-navigate to subscription page
              message.success('Subscription activated successfully! Redirecting to your subscription page...', 3);
              setTimeout(() => {
                navigate('/provider/subscription');
              }, 2000); // 2 second delay to let user see the success message
            }
          }, 1000);
          
          // Additional refresh after 3 seconds for webhook processing
          setTimeout(() => {
            forceRefreshSubscription();
          }, 3000);
        }
        return;
      }
      // If subscription verification fails, try booking payment verification
      console.log('Subscription verification failed, trying booking payment verification...');
      response = await fetch(`${cleanBaseURL}/api/payments/verify-session`, {
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
        setPaymentType('booking');
        
        // Show success message and auto-navigate for booking payment
        message.success('Payment successful! Your booking has been processed. Redirecting to your bookings...', 4);
        setTimeout(() => {
          const bookingLink = user?.role === 'provider' ? "/provider/dashboard" : "/client/bookings";
          navigate(bookingLink);
        }, 3000); // 3 second delay for booking success
        
        return;
      }
      
      console.warn('Both subscription and payment verification failed');
      setPaymentType('booking');
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

  // Dynamic content based on payment type
  const getSuccessContent = () => {
    if (paymentType === 'subscription') {
      return {
        title: "Subscription Activated!",
        subTitle: "Your subscription has been activated successfully. You now have access to all premium features.",
        buttonText: user?.role === 'provider' ? "Go to Dashboard" : "Go to Profile",
        buttonLink: user?.role === 'provider' ? "/provider/dashboard" : "/client/profile"
      };
    } else {
      return {
        title: "Payment Successful!",
        subTitle: "Your payment has been processed successfully. You will be notified once the booking is confirmed.",
        buttonText: user?.role === 'provider' ? "Go to Dashboard" : "Go to My Bookings",
        buttonLink: user?.role === 'provider' ? "/provider/dashboard" : "/client/bookings"
      };
    }
  };

  const content = getSuccessContent();

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900">
      <Result
        icon={<CheckCircle className="w-16 h-16 text-green-500" />}
        title={content.title}
        subTitle={content.subTitle}
        extra={[
          <Link to={content.buttonLink} key="dashboard">
            <Button type="primary">
              {content.buttonText}
            </Button>
          </Link>,
        ]}
      />
    </div>
  );
};

export default PaymentSuccess;
