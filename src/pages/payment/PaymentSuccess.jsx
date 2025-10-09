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
      // Removed duplicate success message - will be shown in verifyPaymentSession
    }
  }, [sessionId]);

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
        // Removed duplicate message - will show single success message below
        
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
              console.log('Reloading page to sync UI with backend...');
              setTimeout(() => {
                window.location.reload();
              }, 2000);
            } else {
              console.log('✅ Context successfully refreshed - subscription is now active in UI!');
              console.log('🎉 Automatically navigating to subscription page...');
              
              // Auto-navigate to subscription page without additional messages
              setTimeout(() => {
                navigate('/provider/subscription');
              }, 3000); // 3 second delay to let user see the success page
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
        
        // Auto-navigate for booking payment without additional messages
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
    <div className="flex items-center justify-center min-h-screen bg-gray-900 px-4">
      <div className="max-w-md w-full text-center">
        {/* Centered Success Icon */}
        <div className="flex justify-center mb-8">
          <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
        </div>
        
        {/* Success Content */}
        <div className="bg-gray-800 rounded-lg p-8 shadow-2xl border border-gray-700">
          <h1 className="text-3xl font-bold text-white mb-4">
            {content.title}
          </h1>
          <p className="text-gray-300 text-base mb-8 leading-relaxed">
            {content.subTitle}
          </p>
          
          {/* Action Button */}
          <Link to={content.buttonLink}>
            <Button 
              type="primary" 
              size="large"
              className="w-full h-12 text-lg font-semibold"
              style={{
                backgroundColor: '#3b82f6',
                borderColor: '#3b82f6',
                borderRadius: '8px'
              }}
            >
              {content.buttonText}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
