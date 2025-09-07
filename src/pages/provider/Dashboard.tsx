import React from 'react';
import { Layout, Card, Typography, Row, Col, Statistic, List, Button, Tag, Space, Avatar } from 'antd';
import { Calendar, DollarSign, Users, Star, Settings, Bell, ExternalLink } from 'lucide-react';
import ProviderLayout from '../../components/ProviderLayout';

const { Title, Paragraph } = Typography;

const ProviderDashboard: React.FC = () => {
  const upcomingBookings = [
    {
      id: 1,
      client: 'Sarah Johnson',
      service: 'Wedding DJ',
      date: '2025-01-15',
      time: '6:00 PM',
      status: 'confirmed',
      amount: '$1,200'
    },
    {
      id: 2,
      client: 'Mike Chen',
      service: 'Corporate Event',
      date: '2025-01-18',
      time: '2:00 PM',
      status: 'pending',
      amount: '$800'
    },
    {
      id: 3,
      client: 'Emily Davis',
      service: 'Birthday Party',
      date: '2025-01-22',
      time: '4:00 PM',
      status: 'confirmed',
      amount: '$600'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'green';
      case 'pending': return 'orange';
      case 'cancelled': return 'red';
      default: return 'blue';
    }
  };

  return (
    <ProviderLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="text-white mb-2">Dashboard</Title>
            <Paragraph className="text-gray-400">
              Welcome back! Here's what's happening with your bookings.
            </Paragraph>
          </div>
          <Space>
            <Button icon={<Bell size={16} />} className="border-gray-600">
              Notifications
            </Button>
            <Button 
              type="primary" 
              icon={<ExternalLink size={16} />}
              onClick={() => window.open('/provider/dj-master/book', '_blank')}
            >
              View Public Page
            </Button>
          </Space>
        </div>

        {/* Stats Cards */}
        <Row gutter={[24, 24]} className="mb-8">
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift">
              <Statistic
                title="This Month's Revenue"
                value={5280}
                precision={0}
                valueStyle={{ color: '#22C55E' }}
                prefix={<DollarSign size={20} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift">
              <Statistic
                title="Pending Requests"
                value={3}
                valueStyle={{ color: '#F59E0B' }}
                prefix={<Calendar size={20} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift">
              <Statistic
                title="Total Clients"
                value={47}
                valueStyle={{ color: '#3B82F6' }}
                prefix={<Users size={20} />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card className="hover-lift">
              <Statistic
                title="Average Rating"
                value={4.9}
                precision={1}
                valueStyle={{ color: '#F59E0B' }}
                prefix={<Star size={20} />}
              />
            </Card>
          </Col>
        </Row>

        <Row gutter={[24, 24]}>
          {/* Upcoming Bookings */}
          <Col xs={24} lg={16}>
            <Card 
              title="Upcoming Bookings" 
              className="h-full"
              extra={
                <Button type="link" onClick={() => {}}>
                  View All
                </Button>
              }
            >
              <List
                dataSource={upcomingBookings}
                renderItem={(booking) => (
                  <List.Item
                    actions={[
                      <Button key="view" type="link">View Details</Button>
                    ]}
                    className="hover:bg-gray-800/50 rounded-lg px-4 transition-colors"
                  >
                    <List.Item.Meta
                      avatar={
                        <Avatar style={{ backgroundColor: '#3B82F6' }}>
                          {booking.client.split(' ').map(n => n[0]).join('')}
                        </Avatar>
                      }
                      title={
                        <div className="flex items-center justify-between">
                          <span className="text-white">{booking.client}</span>
                          <Tag color={getStatusColor(booking.status)} className="ml-2">
                            {booking.status.toUpperCase()}
                          </Tag>
                        </div>
                      }
                      description={
                        <div className="text-gray-400">
                          <div>{booking.service}</div>
                          <div className="text-sm">
                            {booking.date} at {booking.time} • {booking.amount}
                          </div>
                        </div>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={8}>
            <Card title="Quick Actions" className="h-full">
              <Space direction="vertical" size="middle" className="w-full">
                <Button 
                  block 
                  size="large"
                  onClick={() => navigate('/provider/profile')}
                  icon={<Settings size={16} />}
                >
                  Update Profile
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={() => {}}
                  icon={<Calendar size={16} />}
                >
                  Manage Calendar
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={() => {}}
                  icon={<DollarSign size={16} />}
                >
                  View Earnings
                </Button>
                <Button 
                  block 
                  size="large"
                  onClick={() => navigate('/provider/subscription')}
                  icon={<Star size={16} />}
                >
                  Subscription
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </ProviderLayout>
  );
};

export default ProviderDashboard;