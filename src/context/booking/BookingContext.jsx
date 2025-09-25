import React, { createContext, useContext, useState } from "react";
import { useAuth } from "../AuthContext";

const BookingContext = createContext();

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};

export const BookingProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [bookingsData, setBookingsData] = useState([]);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Create new booking
  const createBooking = async (bookingData) => {
    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(bookingData),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || "Failed to create booking",
        };
      }
    } catch (error) {
      console.error("Booking create error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // Get bookings for current user (status, page, limit are dynamic)
  const fetchBookings = async ({ status, page = 1, limit = 10 }) => {
    try {
      setLoading(true);

      const query = new URLSearchParams({
        ...(status && { status }),
        page: String(page),
        limit: String(limit),
      });

      const response = await fetch(
        `${baseUrl}/bookings/me?${query.toString()}`,
        {
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        }
      );

      const data = await response.json();

      if (response.ok) {
        setBookingsData({
          bookings: data.bookings || [],
          pagination: data.pagination || {},
        });
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || "Failed to fetch bookings",
        };
      }
    } catch (error) {
      console.error("Fetch bookings error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    createBooking,
    fetchBookings,
    bookingsData,
  };

  return (
    <BookingContext.Provider value={value}>{children}</BookingContext.Provider>
  );
};
