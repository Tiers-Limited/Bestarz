import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../AuthContext';

const CustomerContext = createContext();

export const useCustomer = () => {
  const context = useContext(CustomerContext);
  if (!context) {
    throw new Error('useCustomer must be used within a CustomerProvider');
  }
  return context;
};

export const CustomerProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [customersData, setCustomersData] = useState({
    customers: [],
    pagination: {
      page: 1,
      limit: 10,
      total: 0,
      pages: 1
    }
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchCustomers = async (params = {}) => {
    try {
      setLoading(true);
      
      const {
        page = 1,
        limit = 10,
        search = '',
        status = null
      } = params;

      let queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString()
      });

      // Add optional filters
      if (search && search.trim() !== '') {
        queryParams.append('search', search.trim());
      }

      if (status && status !== 'all') {
        queryParams.append('status', status);
      }

      const response = await fetch(`${baseUrl}/providers/customers?${queryParams}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        const customersResult = {
          customers: data.customers || [],
          pagination: data.pagination || {
            page: 1,
            limit: 10,
            total: 0,
            pages: 1
          }
        };
        
        setCustomersData(customersResult);
        return { success: true, data: customersResult };
      } else {
        return { success: false, error: data.message || 'Failed to fetch customers' };
      }
    } catch (error) {
      console.error('Customers fetch error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };



  // Helper function to transform API data to component format
  const transformCustomerData = (apiCustomer) => {
    const lastBooking = apiCustomer.bookingHistory?.[0];
    
    return {
      key: apiCustomer._id,
      id: apiCustomer._id,
      name: apiCustomer.firstName && apiCustomer.lastName 
        ? `${apiCustomer.firstName} ${apiCustomer.lastName}` 
        : 'Unknown Customer',
      firstName: apiCustomer.firstName || '',
      lastName: apiCustomer.lastName || '',
      email: apiCustomer.email,
      phone: apiCustomer.phone,
      profileImage: apiCustomer.profileImage,
      totalBookings: apiCustomer.totalBookings || 0,
      totalSpent: apiCustomer.totalSpent || 0,
      lastBooking: apiCustomer.lastBooking,
      status: apiCustomer.status || 'active',
      joinDate: apiCustomer.createdAt || apiCustomer.bookingHistory?.[0]?.createdAt,
      timeline: apiCustomer.bookingHistory?.map(booking => ({
        date: booking.dateStart ? new Date(booking.dateStart).toLocaleDateString() : '',
        event: `${booking.eventType} - ${booking.serviceCategory}`,
        amount: `$${(booking.amount && !isNaN(booking.amount)) ? booking.amount : 0}`,
        status: booking.status,
        notes: booking.notes || booking.description || '',
        location: booking.location,
        guests: booking.guests,
        duration: booking.duration
      })) || [],
      bookingHistory: apiCustomer.bookingHistory || []
    };
  };

  // Get transformed customers data
  const getTransformedCustomers = () => {
    return customersData.customers.map(transformCustomerData);
  };

  // Filter customers by status
  const getCustomersByStatus = (status) => {
    const transformed = getTransformedCustomers();
    if (status === 'all') return transformed;
    return transformed.filter(customer => customer.status === status);
  };

  // Search customers
  const searchCustomers = async (searchTerm) => {
    return await fetchCustomers({ search: searchTerm });
  };

  // Get customer statistics
  const getCustomerStats = () => {
    const transformed = getTransformedCustomers();
    return {
      total: transformed.length,
      active: transformed.filter(c => c.status === 'active').length,
      new: transformed.filter(c => c.status === 'new').length,
      inactive: transformed.filter(c => c.status === 'inactive').length,
      totalRevenue: transformed.reduce((sum, c) => sum + c.totalSpent, 0),
      averageSpent: transformed.length > 0 
        ? Math.round(transformed.reduce((sum, c) => sum + c.totalSpent, 0) / transformed.length)
        : 0
    };
  };

  const value = {
    customersData,
    loading,
    fetchCustomers,
    transformCustomerData,
    getTransformedCustomers,
    getCustomersByStatus,
    searchCustomers,
    getCustomerStats,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
};