import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const baseUrl = import.meta.env.VITE_BASE_URL;

  // Check if user is authenticated on app load
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const signIn = async (credentials) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/signin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        return { success: true, user: data.user };
      } else {
        return { success: false, error: data.message || "Sign in failed" };
      }
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (userData) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (response.ok) {
        setToken(data.token);
        setUser(data.user);
        if (data.token) localStorage.setItem("token", data.token);
        if (data.user) localStorage.setItem("user", JSON.stringify(data.user));

        return { success: true, user: data.user, message: data.message };
      } else {
        return { success: false, error: data.message || "Sign up failed" };
      }
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const signOut = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const forgotPassword = async (email) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Reset link sent to your email",
        };
      } else {
        return {
          success: false,
          error: data.message || "Failed to send reset link",
        };
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async ({ id, token, newPassword }) => {
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ id, token, newPassword }), // send id
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          message: data.message || "Password reset successfully",
        };
      } else {
        return {
          success: false,
          error: data.message || "Failed to reset password",
        };
      }
    } catch (error) {
      console.error("Reset password error:", error);
      return { success: false, error: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const getRoleDashboard = (role) => {
    switch (role) {
      case "admin":
        return "/admin/dashboard";
      case "provider":
        return "/provider/dashboard";
      case "client":
        return "/client/dashboard";
      default:
        return "/client/booking";
    }
  };

  // Fetch profile
  const fetchProfile = async () => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (response.ok) {
        const profileData = data.user; // <-- unwrap user
        setUser(profileData);
        localStorage.setItem("user", JSON.stringify(profileData));
        return { success: true, data: profileData };
      }
      return {
        success: false,
        error: data.message || "Failed to fetch profile",
      };
    } catch (err) {
      console.error("Fetch profile error:", err);
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    if (!token) return { success: false, error: "Not authenticated" };
    try {
      setLoading(true);
      const response = await fetch(`${baseUrl}/auth/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileData),
      });
      const data = await response.json();
      if (response.ok) {
        
        const currentUser = JSON.parse(localStorage.getItem("user")) || {};
        const updatedUser = { ...currentUser, ...data.user }; // merge old token
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        
        return { success: true, data: data.user, message: "Profile updated successfully" };
      }
      
      return {
        success: false,
        error: data.message || "Failed to update profile",
      };
    } catch (err) {
      console.error("Update profile error:", err);
      return { success: false, error: "Network error" };
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    fetchProfile,
    updateProfile,
    token,
    loading,
    signIn,
    signUp,
    signOut,
    forgotPassword,
    resetPassword,
    getRoleDashboard,
    isAuthenticated: !!token && !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
