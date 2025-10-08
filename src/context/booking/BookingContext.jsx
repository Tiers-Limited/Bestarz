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

  // Keep bookings shape consistent
  const [bookingsData, setBookingsData] = useState({
    bookings: [],
    pagination: {},
  });

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // --- Confirm booking (provider) ---
  const confirmBooking = async (bookingId, amount) => {
    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/bookings/${bookingId}/confirm`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({ amount }),
      });

      const data = await response.json();

      if (response.ok) {
        // Refresh bookings after confirmation
        await fetchBookings();
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || "Failed to confirm booking",
        };
      }
    } catch (error) {
      console.error("Booking confirm error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // --- Create anonymous booking (for public pages) ---
  const createAnonymousBooking = async (bookingData) => {
    try {
      setLoading(true);

      const response = await fetch(`${baseUrl}/bookings/anonymous`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
      console.error("Anonymous booking create error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

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

  // --- Fetch bookings (with filters/pagination) ---
  const fetchBookings = async ({ status, page = 1, limit = 10, startDate, endDate } = {}) => {
    try {
      setLoading(true);

      const query = new URLSearchParams();
      if (status && status !== 'all') query.append('status', status);
      if (page) query.append('page', String(page));
      if (limit) query.append('limit', String(limit));
      if (startDate) query.append('startDate', startDate);
      if (endDate) query.append('endDate', endDate);
      
      console.log("Fetching bookings with query:", query.toString());

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

  // --- Update booking status ---
  const updateBookingStatus = async (bookingId, status, notes = "", amount) => {
    try {
      setLoading(true);

      const payload = { status, notes };
      if (amount != null) payload.amount = amount;

      const response = await fetch(
        `${baseUrl}/bookings/${bookingId}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await response.json();

      if (response.ok) {
        // Refresh bookings after update (keeps state in sync)
        await fetchBookings();
        return { success: true, data };
      } else {
        return {
          success: false,
          error: data.message || "Failed to update booking status",
        };
      }
    } catch (error) {
      console.error("Booking status update error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    loading,
    bookingsData,
    createBooking,
    fetchBookings,
    updateBookingStatus,
    confirmBooking,
    createAnonymousBooking,
  };

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  );
};
