import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const ProviderContext = createContext();

export const useProvider = () => {
  const context = useContext(ProviderContext);
  if (!context) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
};

export const ProviderProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/providers/dashboard`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setDashboardData(data);
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to fetch dashboard data' };
      }
    } catch (error) {
      console.error('Dashboard fetch error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status, notes = '', amount = null) => {
    try {
      setLoading(true);
      const payload = { status, notes };
      if (amount !== null) {
        payload.amount = amount;
      }

      const response = await fetch(`${baseUrl}/providers/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh dashboard data after status update
        await fetchDashboardData();
        return { success: true, data };
      } else {
        return { success: false, error: data.message || 'Failed to update booking status' };
      }
    } catch (error) {
      console.error('Booking status update error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/providers/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data.provider);
        return { success: true, data: data.provider };
      } else {
        return { success: false, error: data.message || 'Failed to fetch profile data' };
      }
    } catch (error) {
      console.error('Profile fetch error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      
      // Prepare the data for API submission
      const apiData = {
        ...profileData,
        // Ensure portfolio is an array of URLs for the API
        portfolio: profileData.portfolio ? profileData.portfolio.map(img => 
          typeof img === 'string' ? img : img.url
        ) : []
      };

      console.log('Sending profile data to API:', apiData);

      const response = await fetch(`${baseUrl}/providers/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      const data = await response.json();

      if (response.ok) {
        setProfileData(data.provider);
        return { success: true, data: data.provider };
      } else {
        return { success: false, error: data.message || 'Failed to update profile' };
      }
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    dashboardData,
    profileData,
    loading,
    fetchDashboardData,
    fetchProfileData,
    updateProfile,
    updateBookingStatus,
  };

  return (
    <ProviderContext.Provider value={value}>
      {children}
    </ProviderContext.Provider>
  );
};