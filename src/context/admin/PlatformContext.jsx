import React, { createContext, useContext, useState, useEffect } from "react";
import { message } from "antd";
import { useAuth } from "../AuthContext"; // import your auth context

const PlatformContext = createContext();

export const usePlatform = () => useContext(PlatformContext);

export const PlatformProvider = ({ children }) => {
  const { token } = useAuth(); // get token from auth context
  const [platformSettings, setPlatformSettings] = useState(null);
  const [loading, setLoading] = useState(false);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  const fetchPlatformSettings = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/admin/platform-settings`, {
        headers: {
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      const data = await res.json();
      if (res.ok) {
        setPlatformSettings(data);
      } else {
        message.error(data.message || "Failed to load platform settings");
      }
    } catch (err) {
      console.error("Fetch platform settings error:", err);
      message.error("Network error while fetching platform settings");
    } finally {
      setLoading(false);
    }
  };

  const updatePlatformSettings = async (settings) => {
    setLoading(true);
    try {
      const res = await fetch(`${baseUrl}/admin/platform-settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (res.ok) {
        setPlatformSettings(data);
        message.success("Platform settings updated successfully");
      } else {
        message.error(data.message || "Failed to update settings");
      }
    } catch (err) {
      console.error("Update platform settings error:", err);
      message.error("Network error while updating settings");
    } finally {
      setLoading(false);
    }
  };



  return (
    <PlatformContext.Provider
      value={{ platformSettings, loading, fetchPlatformSettings, updatePlatformSettings }}
    >
      {children}
    </PlatformContext.Provider>
  );
};
