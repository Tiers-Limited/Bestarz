import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../AuthContext';

const EarningsContext = createContext();

export const useEarnings = () => {
  const context = useContext(EarningsContext);
  if (!context) {
    throw new Error('useEarnings must be used within an EarningsProvider');
  }
  return context;
};

export const EarningsProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [earningsData, setEarningsData] = useState({
    payments: [],
    stats: {
      totalEarnings: 0,
      thisMonthEarnings: 0,
      upcomingPayout: 0
    },
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    }
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchEarnings = async (params = {}) => {
    try {
      setLoading(true);
      
      const {
        page = 1,
        limit = 10,
        status = null,
        search = ''
      } = params;

      let queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Add optional filters
      if (status && status !== 'all') {
        queryParams.append('status', status);
      }

      if (search && search.trim() !== '') {
        queryParams.append('search', search.trim());
      }

      const response = await fetch(`${baseUrl}/providers/earnings?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const earningsResult = {
          payments: data.payments || [],
          stats: data.stats || {
            totalEarnings: 0,
            thisMonthEarnings: 0,
            upcomingPayout: 0
          },
          pagination: data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 1
          }
        };
        
        setEarningsData(earningsResult);
        return { success: true, data: earningsResult };
      } else {
        return { success: false, error: data.message || 'Failed to fetch earnings' };
      }
    } catch (error) {
      console.error('Earnings fetch error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  // Helper function to transform payment data for display
  const transformPaymentData = (payment) => {
    return {
      key: payment._id,
      id: payment._id,
      date: new Date(payment.createdAt).toLocaleDateString(),
      createdAt: payment.createdAt,
      clientName: `${payment.client.firstName} ${payment.client.lastName}`,
      clientEmail: payment.client.email,
      clientPhone: payment.client.phone,
      clientImage: payment.client.profileImage,
      service: `${payment.booking.eventType} - ${payment.booking.serviceCategory}`,
      eventType: payment.booking.eventType,
      serviceCategory: payment.booking.serviceCategory,
      amount: payment.amount,
      platformFee: payment.platformFee,
      providerEarnings: payment.providerEarnings,
      totalAmount: payment.totalAmount,
      paymentType: payment.paymentType,
      currency: payment.currency,
      status: payment.status,
      paymentMethod: payment.paymentMethod,
      location: payment.booking.location,
      eventDate: payment.booking.dateStart ? new Date(payment.booking.dateStart).toLocaleDateString() : null,
      stripePaymentIntentId: payment.stripePaymentIntentId
    };
  };

  // Get transformed payments data
  const getTransformedPayments = () => {
    return earningsData.payments.map(transformPaymentData);
  };

  // Filter payments by status
  const getPaymentsByStatus = (status) => {
    const transformed = getTransformedPayments();
    if (status === 'all') return transformed;
    return transformed.filter(payment => payment.status === status);
  };

  // Get earnings statistics
  const getEarningsStats = () => {
    return earningsData.stats;
  };

  // Get formatted stats for display
  const getFormattedStats = () => {
    const stats = getEarningsStats();
    return {
      totalEarnings: `$${stats.totalEarnings?.toLocaleString() || 0}`,
      thisMonthEarnings: `$${stats.thisMonthEarnings?.toLocaleString() || 0}`,
      upcomingPayout: `$${stats.upcomingPayout?.toLocaleString() || 0}`
    };
  };

  // Calculate additional stats from payments
  const getCalculatedStats = () => {
    const payments = getTransformedPayments();
    const completedPayments = payments.filter(p => p.status === 'completed' || p.status === 'complete');
    const pendingPayments = payments.filter(p => p.status === 'pending');
    
    return {
      totalPayments: payments.length,
      completedPayments: completedPayments.length,
      pendingPayments: pendingPayments.length,
      averagePayment: completedPayments.length > 0 
        ? Math.round(completedPayments.reduce((sum, p) => sum + p.amount, 0) / completedPayments.length)
        : 0
    };
  };

  const value = {
    earningsData,
    loading,
    fetchEarnings,
    transformPaymentData,
    getTransformedPayments,
    getPaymentsByStatus,
    getEarningsStats,
    getFormattedStats,
    getCalculatedStats,
  };

  return (
    <EarningsContext.Provider value={value}>
      {children}
    </EarningsContext.Provider>
  );
};