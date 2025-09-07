import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ConfigProvider, theme } from 'antd';
import './App.css';

// Import components
import LandingPage from './pages/LandingPage';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import ProviderDashboard from './pages/provider/Dashboard';
import ProviderProfile from './pages/provider/Profile';
import ProviderSubscription from './pages/provider/Subscription';
import ClientBooking from './pages/client/Booking';
import PublicProviderPage from './pages/public/ProviderPage';
import AdminDashboard from './pages/admin/Dashboard';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: '#3B82F6',
          colorSuccess: '#22C55E',
          colorBgBase: '#121212',
          colorBgContainer: '#1A1A1A',
          colorBgElevated: '#2C2C2C',
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
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/provider/dashboard" element={<ProviderDashboard />} />
            <Route path="/provider/profile" element={<ProviderProfile />} />
            <Route path="/provider/subscription" element={<ProviderSubscription />} />
            <Route path="/client/booking" element={<ClientBooking />} />
            <Route path="/provider/:providerId/book" element={<PublicProviderPage />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;