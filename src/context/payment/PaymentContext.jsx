import React, { createContext, useContext, useState } from "react";
import { message } from "antd";
import axios from "axios";
import { useAuth } from "../AuthContext";

const PaymentContext = createContext();

export const usePayment = () => useContext(PaymentContext);

export const PaymentProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);

const apiBaseUrl = import.meta.env.VITE_BASE_URL;

  // Create advance/final payment
  const createPayment = async (bookingId, type, userRole = 'client') => {
    setLoading(true);
    try {
      const endpoint = type === "advance" ? "/payments/advance" : "/payments/final";
      const frontendBaseUrl = window.location.origin;
      const successUrl = userRole === 'provider' 
        ? `${frontendBaseUrl}/provider/payment/success`
        : `${frontendBaseUrl}/client/payment/success`;
      const cancelUrl = userRole === 'provider'
        ? `${frontendBaseUrl}/provider/payment/cancel`
        : `${frontendBaseUrl}/client/payment/cancel`;
        
      const res = await axios.post(
        `${apiBaseUrl}${endpoint}`,
        { 
          bookingId,
          successUrl,
          cancelUrl 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (res.data.paymentLink) {
        // redirect to Stripe
        window.location.href = res.data.paymentLink;
      }
      return { success: true, data: res.data };
    } catch (err) {
      console.error("Payment error:", err);
      message.error(err.response?.data?.message || "Failed to create payment");
      return { success: false, error: err.response?.data?.message };
    } finally {
      setLoading(false);
    }
  };




  return (
    <PaymentContext.Provider
      value={{
        loading,
    
        createPayment,

      }}
    >
      {children}
    </PaymentContext.Provider>
  );
};
