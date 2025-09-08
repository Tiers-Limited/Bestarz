import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import './App.css';

// Import components
import LandingPage from './pages/LandingPage';
import ClientBooking from './pages/client/Booking';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderProfile from './pages/provider/Profile';
import ProviderSubscription from './pages/provider/Subscription';

import PublicProviderPage from './pages/public/ProviderPage';
import AdminDashboard from './pages/admin/Dashboard';
import ProviderCustomers from './pages/provider/Customer';

const App = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3B82F6',
          colorSuccess: '#22C55E',
          colorBgBase: '#000000',
          colorBgContainer: '#111111',
          colorBgElevated: '#222222',
          colorText: '#FFFFFF',
          colorTextSecondary: '#B3B3B3',
          fontFamily: 'Poppins, -apple-system, BlinkMacSystemFont, sans-serif',
          borderRadius: 8,
        },
      }}
    >
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/client/booking" element={<ClientBooking />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/provider/subscription" element={<ProviderSubscription />} />
            <Route path="/provider/customers" element={<ProviderCustomers />} />
            <Route path="/provider/:providerId/book" element={<PublicProviderPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;