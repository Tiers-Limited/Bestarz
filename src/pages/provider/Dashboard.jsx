import React, { useEffect, useState } from 'react';
import { Layout, Card, Typography, Row, Col, Statistic, List, Button, Tag, Space, Avatar, Tabs, message, Spin } from 'antd';
import { Calendar, DollarSign, Users, Star, Settings, Bell, ExternalLink, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import ProviderLayout from '../../components/ProviderLayout';
import BookingStatusModal from '../../components/BookingStatusModal';
import { useNavigate } from 'react-router-dom';
import { useProvider } from '../../context/provider/ProviderContext';
import { useAuth } from '../../context/AuthContext';

const { Title, Paragraph } = Typography;

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const { dashboardData, loading, fetchDashboardData } = useProvider();
  const { user } = useAuth();
  const [statusModal, setStatusModal] = useState({
    visible: false,
    booking: null,
    currentStatus: 'pending'
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleStatusUpdate = (booking, newStatus = 'confirmed') => {
    setStatusModal({
      visible: true,
      booking: booking,
      currentStatus: newStatus
    });
  };

  const handleModalClose = () => {
    setStatusModal({
      visible: false,
      booking: null,
      currentStatus: 'pending'
    });
  };

  const handleModalSuccess = () => {
    fetchDashboardData(); 
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      case 'completed': return 'blue';
      default: return 'default';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading && !dashboardData) {
    return (
      <ProviderLayout>
        <div className="min-h-screen flex items-center justify-center">
          <Spin size="large" />
        </div>
      </ProviderLayout>
    );
  }


  console.log(dashboardData,"dashboardData")
  const stats = dashboardData?.stats || {};
  const recentBookings = dashboardData?.recentBookings || [];
  const recentInquiries = dashboardData?.recentInquiries || [];

  const tabItems = [
    {
      key: 'bookings',
      label: `Recent Bookings (${recentBookings.length})`,
      children: (
        <List
          dataSource={recentBookings}
          renderItem={(booking) => (
            <List.Item
              actions={[
                <Button 
                  key="view" 
                  type="primary" 
                  size="small" 
                  className="glow-button"
                  onClick={() => navigate(`/provider/bookings?id=${booking._id}`)}
                >
                  View Details
                </Button>,
                <Button 
                  key="message" 
                  size="small" 
                  icon={<MessageCircle size={14} />}
                  onClick={() => navigate(`/provider/messages?client=${booking.client._id}`)}
                >
                  Message
                </Button>,
                booking.status === 'pending' && (
                  <Button 
                    key="confirm" 
                    size="small" 
                    type="primary"
                    onClick={() => handleStatusUpdate(booking, 'confirmed')}
                  >
                    Confirm
                  </Button>
                ),
                booking.status === 'confirmed' && (
                  <Button 
                    key="complete" 
                    size="small" 
                    type="default"
                    onClick={() => handleStatusUpdate(booking, 'completed')}
                  >
                    Mark Complete
                  </Button>
                )
              ].filter(Boolean)}
              className="hover:bg-gray-800/50 rounded-lg px-4 transition-colors glow-border mb-2"
            >
              <List.Item.Meta
                className='p-3'
                avatar={
                  <Avatar style={{ backgroundColor: '#3B82F6' }}>
                    {booking.client?.firstName?.charAt(0) || ''}
                    {booking.client?.lastName?.charAt(0) || ''}
                  </Avatar>
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">
                      {booking.client?.firstName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <Tag color={getStatusColor(booking.status)} className="ml-2">
                        {booking.status.toUpperCase()}
                      </Tag>
                      <span className="text-green-400 font-bold">
                        {booking.amount ? formatCurrency(booking.amount) : 
                         `${formatCurrency(booking.budget)}`}
                      </span>
                    </div>
                  </div>
                }
                description={
                  <div className="text-gray-400">
                    <div className="font-medium text-white mb-1">
                      {booking.serviceCategory} - {booking.eventType}
                    </div>
                    <div className="text-sm flex items-center space-x-4 mb-2">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {formatDate(booking.dateStart)} at {formatTime(booking.dateStart)}
                      </span>
                      <span className="flex items-center">
                        <Users size={12} className="mr-1" />
                        {booking.guests} guests
                      </span>
                    </div>
                    <div className="text-sm mb-2">
                      <strong>Duration:</strong> {booking.duration}
                    </div>
                    <div className="text-xs bg-gray-800 p-2 rounded">
                      <strong>Description:</strong> {booking.description}
                      {booking.notes && (
                        <>
                          <br />
                          <strong>Notes:</strong> {booking.notes}
                        </>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: "No recent bookings"
          }}
        />
      )
    },
    {
      key: 'inquiries',
      label: `New Inquiries (${recentInquiries.length})`,
      children: (
        <List
          dataSource={recentInquiries}
          renderItem={(inquiry) => (
            <List.Item
              actions={[
                <Button 
                  key="respond" 
                  type="primary" 
                  className="glow-button"
                  onClick={() => navigate(`/provider/messages?client=${inquiry.client._id}`)}
                >
                  Message
                </Button>,
                <Button 
                  key="confirm" 
                  size="small"
                  onClick={() => handleStatusUpdate(inquiry, 'confirmed')}
                >
                  Accept
                </Button>
              ]}
              className="hover:bg-gray-800/50 rounded-lg px-4 transition-colors glow-border mb-2"
            >
              <List.Item.Meta
                className='p-3'
                avatar={
                  <Avatar style={{ backgroundColor: '#22C55E' }}>
                    {inquiry.client?.firstName?.charAt(0) || ''}
                    {inquiry.client?.lastName?.charAt(0) || ''}
                  </Avatar>
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">
                      {inquiry.client?.firstName} {inquiry.client?.lastName}
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-bold">
                        {formatCurrency(inquiry.budgetMin)} - {formatCurrency(inquiry.budgetMax)}
                      </span>
                      <span className="text-gray-400 text-sm flex items-center">
                        <Clock size={12} className="mr-1" />
                        {new Date(inquiry.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                }
                description={
                  <div className="text-gray-400">
                    <div className="font-medium text-white mb-1">
                      {inquiry.serviceCategory} - {inquiry.eventType}
                    </div>
                    <div className="text-sm mb-2">
                      <Calendar size={12} className="mr-1 inline" />
                      {formatDate(inquiry.dateStart)} • {inquiry.guests} guests
                    </div>
                    <div className="text-sm bg-gray-800 p-2 rounded">
                      {inquiry.description}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
          locale={{
            emptyText: "No new inquiries"
          }}
        />
      )
    }
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="text-white mb-2">Dashboard</Title>
            <Paragraph className="text-gray-400">
              Welcome back, {user?.firstName}! Here's what's happening with your business.
            </Paragraph>
          </div>
          <Space>
            <Button 
              icon={<Bell size={16} />} 
              className="border-gray-600 hover:border-blue-400 hover:text-blue-400"
              onClick={() => navigate('/provider/messages')}
            >
              Notifications
            </Button>
            <Button 
              type="primary" 
              icon={<ExternalLink size={16} />}
              onClick={() => window.open(`/provider/${user?.slug}`, '_blank')}
              className="glow-button"
            >
              View Public Page
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="This Month's Revenue"
                value={stats.thisMonthRevenue || 0}
                precision={0}
                valueStyle={{ color: '#22C55E' }}
                formatter={(value) => formatCurrency(value)}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Pending Requests"
                value={stats.pendingBookings || 0}
                valueStyle={{ color: '#F59E0B' }}
                prefix={<Calendar size={20} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Total Bookings"
                value={stats.totalBookings || 0}
                valueStyle={{ color: '#3B82F6' }}
                prefix={<Users size={20} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Average Rating"
                value={stats.averageRating || 0}
                precision={1}
                valueStyle={{ color: '#F59E0B' }}
                prefix={<Star size={20} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Bookings & Inquiries */}
          <Col xs={24} lg={16}>
            <Card 
              title="Business Activity" 
              className="h-full glow-border"
              extra={
                <Button type="link" onClick={() => navigate('/provider/bookings')}>
                  View All Bookings
                </Button>
              }
            >
              <Tabs items={tabItems} />
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={8}>
            <Card title="Quick Actions" className="h-full glow-border mb-6">
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  block 
                  size="large"
                  onClick={() => navigate('/provider/profile')}
                  icon={<Settings size={16} />}
                  className="hover-lift"
                >
                  Update Profile
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={() => navigate('/provider/customers')}
                  icon={<Users size={16} />}
                  className="hover-lift"
                >
                  View Customers
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={() => navigate('/provider/earnings')}
                  icon={<DollarSign size={16} />}
                  className="hover-lift"
                >
                  View Earnings
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={() => navigate('/provider/subscription')}
                  icon={<Star size={16} />}
                  className="hover-lift"
                >
                  Subscription
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>

        {/* Booking Status Modal */}
        <BookingStatusModal
          visible={statusModal.visible}
          onClose={handleModalClose}
          booking={statusModal.booking}
          currentStatus={statusModal.currentStatus}
          onSuccess={handleModalSuccess}
        />
      </div>
    </ProviderLayout>
  );
};

export default ProviderDashboard;