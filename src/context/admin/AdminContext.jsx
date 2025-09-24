import React, { createContext, useContext, useState } from "react";
import { useAuth } from "../AuthContext";
import { PlatformProvider } from "./PlatformContext";

const AdminContext = createContext();

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error("useAdmin must be used within an AdminProvider");
  }
  return context;
};

export const AdminProvider = ({ children }) => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [clients, setClients] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [platformSettings, setPlatformSettings] = useState(null);
  const [stats, setStats] = useState(null);
  const [auditLogs, setAuditLogs] = useState(null);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Generic fetch helper
  const apiFetch = async (url, options = {}) => {
    try {
      setLoading(true);
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        ...options,
      });
      const data = await response.json();
      if (response.ok) {
        return { success: true, data };
      }
      return { success: false, error: data.message };
    } catch (error) {
      console.error("Admin API error:", error);
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // Fetch providers
  const fetchProviders = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`${baseUrl}/admin/providers?${query}`);
    if (res.success) setProviders(res.data.providers);
    return res;
  };

  // Fetch AuditLogs
  const fetchAuditLogs = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`${baseUrl}/admin/audit-logs?${query}`);
    if (res.success) setAuditLogs(res.data.logs || []);
    return res;
  };
  // Fetch clients
  const fetchClients = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`${baseUrl}/admin/clients?${query}`);
    if (res.success) setClients(res.data.clients);
    return res;
  };

  // Fetch bookings
  const fetchBookings = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`${baseUrl}/admin/bookings?${query}`);
    if (res.success) setBookings(res.data.bookings);
    return res;
  };

  // Fetch payments
  const fetchPayments = async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const res = await apiFetch(`${baseUrl}/admin/payments?${query}`);
    if (res.success) setPayments(res.data.payments);
    return res;
  };

  // Fetch analytics
  const fetchAnalytics = async () => {
    const res = await apiFetch(`${baseUrl}/admin/analytics`);
    if (res.success) setAnalytics(res.data);
    return res;
  };

  // Fetch platform settings
  const fetchPlatformSettings = async () => {
    const res = await apiFetch(`${baseUrl}/platform-settings`);
    if (res.success) setPlatformSettings(res.data);
    return res;
  };

  // Update platform settings
  const updatePlatformSettings = async (settings) => {
    const res = await apiFetch(`${baseUrl}/platform-settings`, {
      method: "PUT",
      body: JSON.stringify(settings),
    });
    if (res.success) setPlatformSettings(res.data);
    return res;
  };

  // Fetch stats
  const fetchStats = async () => {
    const res = await apiFetch(`${baseUrl}/admin/stats`);
    if (res.success) setStats(res.data);
    return res;
  };

  // Update user status (block/restore/disable)
  const updateUserStatus = async (userId, action, reason) => {
    const res = await apiFetch(`${baseUrl}/admin/users/${userId}/status`, {
      method: "PATCH",
      body: JSON.stringify({
        action,
        reason,
      }),
    });

    if (res.success) {
      // Update local state based on action
      if (action === "block" || action === "disable") {
        // Update providers list if it's a provider
        setProviders((prevProviders) =>
          prevProviders.map((provider) =>
            provider.user._id === userId
              ? { ...provider, isActive: false }
              : provider
          )
        );

        // Update clients list if it's a client
        setClients((prevClients) =>
          prevClients.map((client) =>
            client._id === userId ? { ...client, isActive: false } : client
          )
        );
      } else if (action === "restore" || action === "activate") {
        // Update providers list if it's a provider
        setProviders((prevProviders) =>
          prevProviders.map((provider) =>
            provider.user._id === userId
              ? { ...provider, isActive: true }
              : provider
          )
        );

        // Update clients list if it's a client
        setClients((prevClients) =>
          prevClients.map((client) =>
            client._id === userId ? { ...client, isActive: true } : client
          )
        );
      }
    }

    return res;
  };

  // Block user (for security threats)
  const blockUser = async (
    userId,
    reason = "Violation of terms of service"
  ) => {
    return await updateUserStatus(userId, "block", reason);
  };

  // Disable user (temporary suspension)
  const disableUser = async (userId, reason = "Temporary suspension") => {
    return await updateUserStatus(userId, "disable", reason);
  };

  // Restore/activate user
  const restoreUser = async (userId, reason = "Issue resolved") => {
    return await updateUserStatus(userId, "restore", reason);
  };

  const value = {
    loading,
    providers,
    clients,
    bookings,
    payments,
    analytics,
    platformSettings,
    stats,
    auditLogs,
    fetchProviders,
    fetchClients,
    fetchBookings,
    fetchPayments,
    fetchAnalytics,
    fetchPlatformSettings,
    updatePlatformSettings,
    fetchStats,
    fetchAuditLogs,
    updateUserStatus,
    blockUser,
    disableUser,
    restoreUser,
  };

  return (
    <PlatformProvider>
      <AdminContext.Provider value={value}>{children}</AdminContext.Provider>
    </PlatformProvider>
  );
};
