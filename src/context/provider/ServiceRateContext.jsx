import React, { createContext, useContext, useState } from 'react';
import { useAuth } from '../AuthContext';
import { message } from 'antd';

const ServiceRateContext = createContext();

export const useServiceRate = () => {
  const context = useContext(ServiceRateContext);
  if (!context) {
    throw new Error('useServiceRate must be used within a ServiceRateProvider');
  }
  return context;
};

export const ServiceRateProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rateCards, setRateCards] = useState([]);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchRateCards = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/providers/rate-cards`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setRateCards(data.rateCards || []);
        return { success: true, data: data.rateCards || [] };
      } else {
        return { success: false, error: data.message || 'Failed to fetch rate cards' };
      }
    } catch (error) {
      console.error('Rate cards fetch error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const getRateCardById = async (rateCardId) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/providers/rate-cards/${rateCardId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data };
      } else {
        return { success: false, error: data.message || 'Failed to fetch rate card' };
      }
    } catch (error) {
      console.error('Rate card fetch error:', error);
      return { success: false, error: 'Network error. Please try again.' };
    } finally {
      setLoading(false);
    }
  };

  const createRateCard = async (rateCardData) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/providers/rate-cards`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rateCardData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await fetchRateCards();
        message.success("Rate card created successfully!");
        return { success: true, data };
      } else {
        message.error(data.message || "Failed to create rate card");
        return { success: false, error: data.message || "Failed to create rate card" };
      }
    } catch (error) {
      console.error("Rate card creation error:", error);
      message.error("Network error. Please try again.");
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };
  

  const updateRateCard = async (rateCardId, rateCardData) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/providers/rate-cards/${rateCardId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(rateCardData),
      });
  
      const data = await response.json();
  
      if (response.ok) {
        await fetchRateCards();
        message.success("Rate card updated successfully!");
        return { success: true, data };
      } else {
        message.error(data.message || "Failed to update rate card");
        return { success: false, error: data.message || "Failed to update rate card" };
      }
    } catch (error) {
      console.error("Rate card update error:", error);
      message.error("Network error. Please try again.");
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };
  
  const deleteRateCard = async (rateCardId) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/providers/rate-cards/${rateCardId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
  
      if (response.ok) {
        await fetchRateCards();
        message.success("Rate card deleted successfully!");
        return { success: true };
      } else {
        const data = await response.json();
        message.error(data.message || "Failed to delete rate card");
        return { success: false, error: data.message || "Failed to delete rate card" };
      }
    } catch (error) {
      console.error("Rate card deletion error:", error);
      message.error("Network error. Please try again.");
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };
  
  const value = {
    rateCards,
    loading,
    fetchRateCards,
    getRateCardById,
    createRateCard,
    updateRateCard,
    deleteRateCard,
  };

  return (
    <ServiceRateContext.Provider value={value}>
      {children}
    </ServiceRateContext.Provider>
  );
};