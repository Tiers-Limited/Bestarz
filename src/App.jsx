import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ConfigProvider, theme } from "antd";
import "./App.css";

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
import ProviderSettings from "./pages/provider/Settings";
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

const App = () => {
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
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignIn />} />

            <Route path="/signup" element={<SignUp />} />

            <Route path="/client/booking" element={<ClientBooking />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />
            <Route path="/client/providers" element={<ClientProviders />} />
            <Route path="/client/payments" element={<ClientPayments />} />
            <Route path="/client/docs" element={<ClientDocumentation />} />
            <Route path="/client/settings" element={<ClientProfileSettings />} />
            <Route path="/client/support" element={<ClientMessages />} />

            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route
              path="/provider/subscription"
              element={<ProviderSubscription />}
            />
            <Route path="/provider/customers" element={<ProviderCustomers />} />
            <Route path="/provider/docs" element={<ProviderHelpandDocs />} />

            <Route path="/provider/earnings" element={<ProviderEarnings />} />

            <Route path="/provider/notifications" element={<ProviderNotifications />} />

            <Route path="/provider/bookings" element={<ProviderBookings />} />
            <Route path="/provider/settings" element={<ProviderSettings />} />
            <Route path="/provider/services-rates" element={<ProviderRateCards />} />
            <Route path="/provider/messages" element={<ProviderMessages />} />


            <Route
              path="/provider/:providerId/book"
              element={<PublicProviderPage />}
            />

            <Route path="/admin/dashboard" element={<AdminDashboard />} />

            <Route path="/admin/clients" element={<AdminClients />} />
            <Route path="/admin/providers" element={<AdminProviders />} />
            <Route path="/admin/security" element={<AdminSecurity />} />
            <Route path="/admin/analytics" element={<AdminAnalytics />} />

            <Route path="/admin/profile" element={<AdminProfileSettings />} />

            <Route path="/admin/messages" element={<AdminMessages />} />

            <Route
              path="/admin/notifications"
              element={<AdminNotifications />}
            />

            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/docs" element={<AdminDocumentation />} />
            <Route
              path="/admin/platform-settings"
              element={<AdminPlatformSettings />}
            />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;
