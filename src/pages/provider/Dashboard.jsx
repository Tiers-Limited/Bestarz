import React from 'react';
import { Layout, Card, Typography, Row, Col, Statistic, List, Button, Tag, Space, Avatar, Tabs } from 'antd';
import { Calendar, DollarSign, Users, Star, Settings, Bell, ExternalLink, MessageCircle, Clock, TrendingUp } from 'lucide-react';
import ProviderLayout from '../../components/ProviderLayout';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const ProviderDashboard = () => {
  const navigate = useNavigate();

  const upcomingBookings = [
    {
      id: 1,
      client: 'Sarah Johnson',
      service: 'Wedding DJ',
      date: '2025-01-15',
      time: '6:00 PM',
      status: 'confirmed',
      amount: '$1,200',
      contact: '+1 (555) 234-5678',
      notes: 'Outdoor wedding, backup sound system needed'
    },
    {
      id: 2,
      client: 'Mike Chen',
      service: 'Corporate Event',
      date: '2025-01-18',
      time: '2:00 PM',
      status: 'pending',
      amount: '$800',
      contact: '+1 (555) 987-6543',
      notes: 'Professional setting, jazz/background music preferred'
    },
    {
      id: 3,
      client: 'Emily Davis',
      service: 'Birthday Party',
      date: '2025-01-22',
      time: '4:00 PM',
      status: 'confirmed',
      amount: '$600',
      contact: '+1 (555) 345-6789',
      notes: '18th birthday, pop/hip-hop playlist requested'
    }
  ];

  const recentInquiries = [
    {
      id: 1,
      client: 'Alex Thompson',
      service: 'Anniversary Party',
      date: '2025-02-14',
      budget: '$900',
      message: 'Looking for romantic music for our 10th anniversary celebration...',
      time: '2 hours ago'
    },
    {
      id: 2,
      client: 'Jennifer Liu',
      service: 'Corporate Gala',
      date: '2025-03-15',
      budget: '$1,500',
      message: 'Need professional DJ for annual company gala, 200+ guests...',
      time: '5 hours ago'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  const tabItems = [
    {
      key: 'bookings',
      label: 'Upcoming Bookings',
      children: (
        <List
          dataSource={upcomingBookings}
          renderItem={(booking) => (
            <List.Item
              actions={[
                <Button key="view" type="primary" size="small" className="glow-button">
                  View Details
                </Button>,
                <Button key="message" size="small" icon={<MessageCircle size={14} />}>
                  Message
                </Button>
              ]}
              className="hover:bg-gray-800/50 rounded-lg px-4 transition-colors glow-border mb-2"
            >
              <List.Item.Meta

              className='p-3'
                avatar={
                  <Avatar style={{ backgroundColor: '#3B82F6' }}>
                    {booking.client.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{booking.client}</span>
                    <div className="flex items-center space-x-2">
                      <Tag color={getStatusColor(booking.status)} className="ml-2">
                        {booking.status.toUpperCase()}
                      </Tag>
                      <span className="text-green-400 font-bold">{booking.amount}</span>
                    </div>
                  </div>
                }
                description={
                  <div className="text-gray-400">
                    <div className="font-medium text-white mb-1">{booking.service}</div>
                    <div className="text-sm flex items-center space-x-4 mb-2">
                      <span className="flex items-center">
                        <Calendar size={12} className="mr-1" />
                        {booking.date} at {booking.time}
                      </span>
                      <span className="flex items-center">
                        <Users size={12} className="mr-1" />
                        {booking.contact}
                      </span>
                    </div>
                    <div className="text-xs bg-gray-800 p-2 rounded">
                      <strong>Notes:</strong> {booking.notes}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      )
    },
    {
      key: 'inquiries',
      label: 'New Inquiries',
      children: (
        <List
          dataSource={recentInquiries}
          renderItem={(inquiry) => (
            <List.Item
              actions={[
                <Button key="respond" type="primary" className="glow-button">
                  Respond
                </Button>,
                <Button key="view">View Full</Button>
              ]}
              className="hover:bg-gray-800/50 rounded-lg px-4 transition-colors glow-border mb-2"
            >
              <List.Item.Meta

              className='p-3'
                avatar={
                  <Avatar style={{ backgroundColor: '#22C55E' }}>
                    {inquiry.client.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                }
                title={
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold">{inquiry.client}</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-green-400 font-bold">{inquiry.budget}</span>
                      <span className="text-gray-400 text-sm flex items-center">
                        <Clock size={12} className="mr-1" />
                        {inquiry.time}
                      </span>
                    </div>
                  </div>
                }
                description={
                  <div className="text-gray-400">
                    <div className="font-medium text-white mb-1">{inquiry.service}</div>
                    <div className="text-sm mb-2">
                      <Calendar size={12} className="mr-1 inline" />
                      {inquiry.date}
                    </div>
                    <div className="text-sm bg-gray-800 p-2 rounded">
                      {inquiry.message}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
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
              Welcome back! Here's what's happening with your business.
            </Paragraph>
          </div>
          <Space>
            <Button 
              icon={<Bell size={16} />} 
              className="border-gray-600 hover:border-blue-400 hover:text-blue-400"
              onClick={()=>{
                  navigate('/provider/notifications')
              }}
            >
              Notifications
            </Button>
            <Button 
              type="primary" 
              icon={<ExternalLink size={16} />}
              onClick={() => window.open('/provider/dj-master/book', '_blank')}
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
                value={5280}
                precision={0}
                valueStyle={{ color: '#22C55E' }}
                prefix={<DollarSign size={20} />}
              />
              <div className="mt-2 text-green-400 text-sm flex items-center">
                <TrendingUp size={14} className="mr-1" />
                +23% from last month
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Pending Requests"
                value={3}
                valueStyle={{ color: '#F59E0B' }}
                prefix={<Calendar size={20} />}
              />
              <div className="mt-2 text-orange-400 text-sm">
                Respond within 2 hours for best results
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Total Clients"
                value={47}
                valueStyle={{ color: '#3B82F6' }}
                prefix={<Users size={20} />}
              />
              <div className="mt-2 text-blue-400 text-sm">
                +5 new clients this month
              </div>
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift glow-border">
              <Statistic
                title="Average Rating"
                value={4.9}
                precision={1}
                valueStyle={{ color: '#F59E0B' }}
                prefix={<Star size={20} />}
              />
              <div className="mt-2 text-yellow-400 text-sm">
                Based on 127 reviews
              </div>
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
                  Manage Customers
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

            {/* Performance Metrics */}
            <Card title="This Week's Performance" className="glow-border">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Response Rate</span>
                  <span className="text-green-400 font-semibold">96%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Booking Rate</span>
                  <span className="text-blue-400 font-semibold">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Avg Response Time</span>
                  <span className="text-orange-400 font-semibold">2.3 hrs</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Profile Views</span>
                  <span className="text-purple-400 font-semibold">234</span>
                </div>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </ProviderLayout>
  );
};

export default ProviderDashboard;