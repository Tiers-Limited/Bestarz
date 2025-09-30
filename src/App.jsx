import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import "./App.css";
import { AuthProvider } from "./context/AuthContext";
import { ProviderProvider } from "./context/provider/ProviderContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Import components
import LandingPage from "./pages/LandingPage";
import ClientBooking from "./pages/client/Booking";
import ProviderDashboard from "./pages/provider/Dashboard";
import ProviderProfile from "./pages/provider/Profile";
import ProviderSubscription from "./pages/provider/Subscription";

import PublicProviderPage from "./pages/public/ProviderPage";
import AdminDashboard from "./pages/admin/Dashboard";
import ProviderCustomers from "./pages/provider/Customer";

import SignUp from "./pages/auth/SignUp";
import SignIn from "./pages/auth/SignIn";
import ProviderHelpandDocs from "./pages/provider/HelpandDocs";
import ClientDashboard from "./pages/client/Dashboard";
import AdminPayments from "./pages/admin/Payments";
import AdminDocumentation from "./pages/admin/Documentation";
import AdminClients from "./pages/admin/Clients";
import AdminProviders from "./pages/admin/Providers";
import AdminSecurity from "./pages/admin/Security";
import AdminAnalytics from "./pages/admin/Analytics";
import ProviderEarnings from "./pages/provider/Earnings";
import ProviderBookings from "./pages/provider/Bookings";
import AdminPlatformSettings from "./pages/admin/PlatformSettings";
import AdminProfileSettings from "./pages/admin/ProfileSettings";
import AdminNotifications from "./pages/admin/Notifications";
import ProviderNotifications from "./pages/provider/Notifications";
import ProviderRateCards from "./pages/provider/RateCards";
import ClientDocumentation from "./pages/client/Documentation";
import ClientProfileSettings from "./pages/client/ProfileSettings";
import ClientProviders from "./pages/client/Providers";
import ClientPayments from "./pages/client/Payments";
import ClientMessages from "./pages/client/Messages";
import ProviderMessages from "./pages/provider/Messages";
import AdminMessages from "./pages/admin/Messages";
import { ServiceRateProvider } from "./context/provider/ServiceRateContext";
import { CustomerProvider } from "./context/provider/CustomerContext";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import Success from "./pages/Success";
import Cancel from "./pages/Cancel";
import { ClientProvider } from "./context/client/ClientContext";
import { BookingProvider } from "./context/booking/BookingContext";
import { AdminProvider } from "./context/admin/AdminContext";
import ClientBookings from "./pages/client/Bookings";
import { MessageProvider } from "./context/messages/MessageContext";
import { PaymentProvider } from "./context/payment/PaymentContext";

const App = () => {
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permission) => {
        console.log("Notification permission:", permission);
      });
    }
  }, []);

  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#3B82F6",
          colorSuccess: "#22C55E",
          colorBgBase: "#000000",
          colorBgContainer: "#111111",
          colorBgElevated: "#222222",
          colorText: "#FFFFFF",
          colorTextSecondary: "#B3B3B3",
          fontFamily: "Poppins, -apple-system, BlinkMacSystemFont, sans-serif",
          borderRadius: 8,
        },
      }}
    >
      <AuthProvider>
        <PaymentProvider>
          <MessageProvider>
            <AdminProvider>
              <ClientProvider>
                <BookingProvider>
                  <ProviderProvider>
                    <CustomerProvider>
                      <ServiceRateProvider>
                        <Router>
                          <div className="App">
                            <Routes>
                              {/* Public routes */}
                              <Route path="/" element={<LandingPage />} />
                              <Route path="/signin" element={<SignIn />} />
                              <Route path="/signup" element={<SignUp />} />
                              <Route
                                path="/forgot-password"
                                element={<ForgotPassword />}
                              />
                              <Route
                                path="/reset-password"
                                element={<ResetPassword />}
                              />
                              <Route path="/success" element={<Success />} />
                              <Route path="/cancel" element={<Cancel />} />

                              <Route
                                path="/provider/:slug"
                                element={<PublicProviderPage />}
                              />

                              {/* Client routes */}
                              <Route
                                path="/client/booking"
                                element={<ClientBooking />}
                              />

                              <Route
                                path="/client/bookings"
                                element={<ClientBookings />}
                              />
                              <Route
                                path="/client/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <ClientDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/client/providers"
                                element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <ClientProviders />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/client/payments"
                                element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <ClientPayments />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/client/docs"
                                element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <ClientDocumentation />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/client/settings"
                                element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <ClientProfileSettings />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/client/messages"
                                element={
                                  <ProtectedRoute allowedRoles={["client"]}>
                                    <ClientMessages />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Provider routes */}
                              <Route
                                path="/provider/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/profile"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderProfile />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/subscription"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderSubscription />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/customers"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderCustomers />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/docs"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderHelpandDocs />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/earnings"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderEarnings />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/notifications"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderNotifications />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/bookings"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderBookings />
                                  </ProtectedRoute>
                                }
                              />

                              <Route
                                path="/provider/services-rates"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderRateCards />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/provider/messages"
                                element={
                                  <ProtectedRoute allowedRoles={["provider"]}>
                                    <ProviderMessages />
                                  </ProtectedRoute>
                                }
                              />

                              {/* Admin routes */}
                              <Route
                                path="/admin/dashboard"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminDashboard />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/clients"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminClients />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/providers"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminProviders />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/security"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminSecurity />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/analytics"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminAnalytics />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/profile"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminProfileSettings />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/messages"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminMessages />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/notifications"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminNotifications />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/payments"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminPayments />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/docs"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminDocumentation />
                                  </ProtectedRoute>
                                }
                              />
                              <Route
                                path="/admin/platform-settings"
                                element={
                                  <ProtectedRoute allowedRoles={["admin"]}>
                                    <AdminPlatformSettings />
                                  </ProtectedRoute>
                                }
                              />
                            </Routes>
                          </div>
                        </Router>
                      </ServiceRateProvider>
                    </CustomerProvider>
                  </ProviderProvider>
                </BookingProvider>
              </ClientProvider>
            </AdminProvider>
          </MessageProvider>
        </PaymentProvider>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
