import React from 'react';
import { Card, Typography, Button, Row, Col, List, Tag, Space, Divider } from 'antd';
import { Check, Star, Zap, Crown, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ProviderLayout from '../../components/ProviderLayout';

const { Title, Paragraph } = Typography;

const ProviderSubscription= () => {
  const navigate = useNavigate();

  const plans = [
    {
      name: 'Starter',
      price: 29,
      period: 'month',
      popular: false,
      features: [
        'Up to 10 bookings per month',
        'Basic profile customization',
        'Email notifications',
        'Standard support',
        '5% transaction fee'
      ],
      icon: <Star size={24} className="text-blue-400" />
    },
    {
      name: 'Professional',
      price: 69,
      period: 'month',
      popular: true,
      features: [
        'Unlimited bookings',
        'Advanced profile features',
        'Google Calendar sync',
        'Priority support',
        '3% transaction fee',
        'Custom booking forms',
        'Analytics dashboard'
      ],
      icon: <Zap size={24} className="text-green-400" />
    },
    {
      name: 'Enterprise',
      price: 149,
      period: 'month',
      popular: false,
      features: [
        'Everything in Professional',
        'Multi-location management',
        'Team collaboration tools',
        'White-label options',
        '2% transaction fee',
        'Advanced analytics',
        'Dedicated account manager'
      ],
      icon: <Crown size={24} className="text-purple-400" />
    }
  ];

  const currentPlan = {
    name: 'Professional',
    renewalDate: '2025-02-15',
    status: 'active'
  };

  return (

    <ProviderLayout >
    <div className="min-h-screen bg-black p-4">
      <div className="max-w-6xl mx-auto">
        <Button 
          type="text" 
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/provider/dashboard')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          Back to Dashboard
        </Button>

        <div className="text-center mb-12">
          <div className="bestarz-logo text-4xl mb-4">
            Best<span className="bestarz-star">★</span>rz
          </div>
          <Title level={1} className="text-white mb-4">Choose Your Plan</Title>
          <Paragraph className="text-xl text-gray-400 max-w-2xl mx-auto">
            Select the perfect plan to grow your business and manage bookings effortlessly
          </Paragraph>
        </div>

        {/* Current Subscription Status */}
        {currentPlan.status === 'active' && (
          <Card className="mb-8 glass-card" style={{ border: '1px solid #22C55E' }}>
            <div className="flex items-center justify-between">
              <div>
                <Title level={4} className="text-white mb-1">Current Subscription</Title>
                <Paragraph className="text-gray-400 mb-0">
                  <Tag color="green">ACTIVE</Tag>
                  {currentPlan.name} Plan • Renews on {currentPlan.renewalDate}
                </Paragraph>
              </div>
              <Space>
                <Button>Manage Billing</Button>
                <Button type="primary">Upgrade Plan</Button>
              </Space>
            </div>
          </Card>
        )}

        {/* Pricing Plans */}
        <Row gutter={[24, 24]} className="mb-12">
          {plans.map((plan, index) => (
            <Col xs={24} lg={8} key={index}>
              <Card 
                className={`h-full text-center hover-lift ${plan.popular ? 'border-blue-400' : ''}`}
                style={{ 
                  background: plan.popular ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.05))' : undefined,
                  border: plan.popular ? '2px solid #3B82F6' : '1px solid #333333'
                }}
              >
                {plan.popular && (
                  <Tag color="blue" className="absolute top-4 right-4">
                    MOST POPULAR
                  </Tag>
                )}
                
                <div className="mb-6">
                  {plan.icon}
                  <Title level={3} className="text-white mt-4 mb-2">{plan.name}</Title>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-white">${plan.price}</span>
                    <span className="text-gray-400">/{plan.period}</span>
                  </div>
                </div>

                <List
                  dataSource={plan.features}
                  renderItem={(feature) => (
                    <List.Item className="border-none px-0 py-2">
                      <div className="flex items-center">
                        <Check size={16} className="text-green-400 mr-3" />
                        <span className="text-gray-300">{feature}</span>
                      </div>
                    </List.Item>
                  )}
                  className="mb-6"
                />

                <Button 
                  type={plan.popular ? "primary" : "default"}
                  size="large" 
                  block
                  className="h-12 text-lg font-medium"
                  disabled={currentPlan.name === plan.name}
                >
                  {currentPlan.name === plan.name ? 'Current Plan' : 'Select Plan'}
                </Button>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Billing Information */}
        <Card title="Billing Information">
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="middle" className="w-full">
                <div>
                  <Paragraph className="text-gray-400 mb-1">Payment Method</Paragraph>
                  <div className="flex items-center">
                    <div className="w-8 h-6 bg-blue-600 rounded mr-3 flex items-center justify-center text-xs text-white font-bold">
                      VISA
                    </div>
                    <span className="text-white">•••• 4242</span>
                  </div>
                </div>
                <div>
                  <Paragraph className="text-gray-400 mb-1">Next Billing Date</Paragraph>
                  <span className="text-white">February 15, 2025</span>
                </div>
              </Space>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="middle" className="w-full">
                <Button block>Update Payment Method</Button>
                <Button block>Download Invoices</Button>
                <Button danger block>Cancel Subscription</Button>
              </Space>
            </Col>
          </Row>
        </Card>
      </div>
    </div>

    </ProviderLayout>
  );
};

export default ProviderSubscription;