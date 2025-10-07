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

  // ✅ Get current subscription
  const getCurrentSubscription = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/current`, {
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

  // ✅ Create subscription (returns Stripe checkout link)
  const createSubscription = async (plan, amount) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/subscription/create`, {
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
        setSubscription(null);
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

  const value = {
    subscription,
    loading,
    createSubscription,
    updateSubscription,
    cancelSubscription,
    getCurrentSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
