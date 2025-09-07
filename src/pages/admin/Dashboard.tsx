import React from 'react';
import { Layout, Card, Typography, Row, Col, Statistic, Table, Tag, Button, Space, Avatar } from 'antd';
import { DollarSign, Users, TrendingUp, Activity, Settings, Bell } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';

const { Title, Paragraph } = Typography;

const AdminDashboard: React.FC = () => {
  const platformStats = [
    { title: 'Total Revenue', value: 125680, prefix: '$', color: '#22C55E' },
    { title: 'Active Providers', value: 1247, color: '#3B82F6' },
    { title: 'Total Bookings', value: 5832, color: '#F59E0B' },
    { title: 'Growth Rate', value: 23.5, suffix: '%', color: '#8B5CF6' }
  ];

  const recentProviders = [
    {
      key: '1',
      name: 'DJ Master',
      email: 'djmaster@example.com',
      category: 'DJ & Music',
      joinDate: '2025-01-10',
      status: 'active',
      subscription: 'Professional'
    },
    {
      key: '2',
      name: 'Elite Catering',
      email: 'info@elitecatering.com',
      category: 'Catering',
      joinDate: '2025-01-08',
      status: 'pending',
      subscription: 'Starter'
    },
    {
      key: '3',
      name: 'Perfect Photos',
      email: 'contact@perfectphotos.com',
      category: 'Photography',
      joinDate: '2025-01-05',
      status: 'active',
      subscription: 'Enterprise'
    }
  ];

  const columns = [
    {
      title: 'Provider',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record: any) => (
        <div className="flex items-center">
          <Avatar style={{ backgroundColor: '#3B82F6', marginRight: 12 }}>
            {text.split(' ').map((n: string) => n[0]).join('')}
          </Avatar>
          <div>
            <div className="text-white">{text}</div>
            <div className="text-gray-400 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => <span className="text-gray-300">{category}</span>,
    },
    {
      title: 'Join Date',
      dataIndex: 'joinDate',
      key: 'joinDate',
      render: (date: string) => <span className="text-gray-300">{date}</span>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'active' ? 'green' : 'orange'}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: 'Subscription',
      dataIndex: 'subscription',
      key: 'subscription',
      render: (sub: string) => <span className="text-gray-300">{sub}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: () => (
        <Button type="link" size="small">
          View Details
        </Button>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="text-white mb-2">Admin Dashboard</Title>
            <Paragraph className="text-gray-400">
              Platform overview and management
            </Paragraph>
          </div>
          <Space>
            <Button icon={<Bell size={16} />} className="border-gray-600">
              Notifications
            </Button>
            <Button type="primary" icon={<Settings size={16} />}>
              Platform Settings
            </Button>
          </Space>
        </div>

        {/* Platform Stats */}
        <Row gutter={[24, 24]} className="mb-8">
          {platformStats.map((stat, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card className="hover-lift">
                <Statistic
                  title={stat.title}
                  value={stat.value}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  valueStyle={{ color: stat.color }}
                />
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]}>
          {/* Recent Providers */}
          <Col xs={24} lg={16}>
            <Card 
              title="Recent Provider Registrations"
              extra={<Button type="link">View All Providers</Button>}
            >
              <Table
                dataSource={recentProviders}
                columns={columns}
                pagination={false}
                className="bg-transparent"
              />
            </Card>
          </Col>

          {/* Quick Actions */}
          <Col xs={24} lg={8}>
            <Card title="Quick Actions" className="h-full">
              <Space direction="vertical" size="middle" className="w-full">
                <Button block size="large" icon={<Users size={16} />}>
                  Manage Providers
                </Button>
                <Button block size="large" icon={<DollarSign size={16} />}>
                  Payment Reports
                </Button>
                <Button block size="large" icon={<TrendingUp size={16} />}>
                  Analytics
                </Button>
                <Button block size="large" icon={<Settings size={16} />}>
                  Platform Settings
                </Button>
                <Button block size="large" icon={<Activity size={16} />}>
                  System Health
                </Button>
              </Space>
            </Card>
          </Col>
        </Row>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;