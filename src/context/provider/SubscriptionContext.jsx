import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const { token, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // ✅ Get current subscription status
  const getCurrentSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/status`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setSubscription(data.subscription);
        return { success: true, data: data.subscription };
      } else {
        return { success: false, error: data.message || 'Failed to get subscription' };
      }
    } catch (error) {
      console.error('Get subscription error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Load subscription data when component mounts
  useEffect(() => {
    if (token && user?.role === 'provider') {
      getCurrentSubscription();
    }
  }, [token, user]);

  // ✅ Create subscription checkout session
  const createSubscription = async (planType) => {
    try {
      console.log('🔧 createSubscription called with planType:', planType);
      console.log('🔑 Token available:', !!token);
      console.log('🌐 Base URL:', baseUrl);
      
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/create-checkout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ planType }),
      });

      console.log('📡 Response status:', response.status);
      const data = await response.json();
      console.log('📊 Response data:', data);

      if (response.ok) {
        return { 
          success: true, 
          sessionId: data.sessionId,
          paymentLink: data.paymentLink,
          data 
        };
      } else {
        return { success: false, error: data.message || 'Failed to create subscription' };
      }
    } catch (error) {
      console.error('Subscription create error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Update subscription plan
  const updateSubscription = async (plan, amount) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan, amount }),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.url) {
          window.location.href = data.url; // 🔥 Redirect to Stripe Checkout
        }
        setSubscription(data.subscription || null);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to update subscription' };
      }
    } catch (error) {
      console.error('Subscription update error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Cancel subscription
  const cancelSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/cancel`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        // Update local subscription state with new status
        setSubscription(prev => ({
          ...prev,
          subscriptionStatus: 'canceled_pending',
          cancelAtPeriodEnd: true
        }));
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to cancel subscription' };
      }
    } catch (error) {
      console.error('Subscription cancel error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Verify subscription session after payment
  const verifySubscriptionSession = async (sessionId) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/verify-session`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh subscription data after successful payment
        await getCurrentSubscription();
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to verify subscription' };
      }
    } catch (error) {
      console.error('Subscription verify error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // ✅ Force refresh subscription data (useful after payments)
  const forceRefreshSubscription = async (retries = 3) => {
    console.log('🔄 Force refreshing subscription data...');
    
    for (let i = 0; i < retries; i++) {
      const result = await getCurrentSubscription();
      
      if (result.success) {
        console.log('✅ Subscription data refreshed successfully');
        return result;
      }
      
      if (i < retries - 1) {
        console.log(`⏳ Retry ${i + 1}/${retries} in 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    
    console.warn('⚠️ Failed to refresh subscription data after retries');
    return { success: false, error: 'Failed to refresh after retries' };
  };

  // ✅ Manual subscription update (backup for webhook failures)
  const updateSubscriptionManually = async (sessionId, planType) => {
    console.log('🔧 Manual subscription update:', { sessionId, planType });
    
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/update-manual`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId, planType }),
      });

      const data = await response.json();

      if (response.ok) {
        console.log('✅ Manual subscription update successful:', data);
        
        // Update local subscription state
        setSubscription({
          ...subscription,
          ...data.subscription
        });
        
        return { success: true, data };
      } else {
        console.error('❌ Manual subscription update failed:', data);
        return { success: false, error: data.message || 'Failed to update subscription' };
      }
    } catch (error) {
      console.error('Manual subscription update error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    subscription,
    loading,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    getCurrentSubscription,
    verifySubscriptionSession,
    forceRefreshSubscription,
    updateSubscriptionManually,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
