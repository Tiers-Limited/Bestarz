import React from 'react';
import { Button, Row, Col, Typography, Card, Space } from 'antd';
import { Star, Calendar, CreditCard, Users, Zap, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Calendar className="text-blue-400" size={32} />,
      title: 'Smart Scheduling',
      description: 'Seamless Google Calendar integration for automated booking management'
    },
    {
      icon: <CreditCard className="text-green-400" size={32} />,
      title: 'Secure Payments',
      description: 'Stripe-powered payment processing with instant payouts'
    },
    {
      icon: <Users className="text-purple-400" size={32} />,
      title: 'Client Management',
      description: 'Comprehensive client portal with review and communication tools'
    },
    {
      icon: <Zap className="text-yellow-400" size={32} />,
      title: 'Instant Matching',
      description: 'AI-powered matching system to connect clients with perfect providers'
    },
    {
      icon: <Shield className="text-cyan-400" size={32} />,
      title: 'Secure Platform',
      description: 'Enterprise-grade security with verified provider profiles'
    },
    {
      icon: <Star className="text-orange-400" size={32} />,
      title: 'Review System',
      description: 'Build your reputation with authentic client reviews and ratings'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 glass-card border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="bestarz-logo">
              Best<span className="text-green-400">★</span>rz
            </div>
            <Space>
              <Button type="text" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button type="primary" onClick={() => navigate('/signup')}>
                Get Started
              </Button>
            </Space>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <Title className="gradient-text" style={{ fontSize: '4rem', marginBottom: '1rem' }}>
            Your business. Your bookings.
          </Title>
          <Title level={1} className="gradient-text" style={{ fontSize: '4rem', marginBottom: '2rem' }}>
            Be the star.
          </Title>
          <Paragraph className="text-xl text-gray-300 max-w-3xl mx-auto mb-12">
            Connect service providers with clients through intelligent matching, 
            seamless payments, and automated scheduling. Transform how you manage bookings.
          </Paragraph>
          <Space size="large">
            <Button 
              type="primary" 
              size="large" 
              className="px-8 py-6 text-lg h-auto"
              onClick={() => navigate('/signup')}
            >
              Start Your Journey
            </Button>
            <Button 
              size="large" 
              className="px-8 py-6 text-lg h-auto"
              onClick={() => navigate('/client/booking')}
            >
              Find Services
            </Button>
          </Space>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <Title level={2} className="text-center mb-16 text-white">
            Everything you need to succeed
          </Title>
          <Row gutter={[32, 32]}>
            {features.map((feature, index) => (
              <Col xs={24} md={12} lg={8} key={index}>
                <Card 
                  className="hover-lift h-full text-center"
                  style={{ 
                    background: 'rgba(26, 26, 26, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <div className="mb-4">{feature.icon}</div>
                  <Title level={4} className="text-white mb-2">
                    {feature.title}
                  </Title>
                  <Paragraph className="text-gray-400">
                    {feature.description}
                  </Paragraph>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <Card 
            className="glass-card"
            style={{ 
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(34, 197, 94, 0.1))',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}
          >
            <Title level={2} className="text-white mb-4">
              Ready to become a star?
            </Title>
            <Paragraph className="text-xl text-gray-300 mb-8">
              Join thousands of service providers who have transformed their business with Bestarz.
            </Paragraph>
            <Button 
              type="primary" 
              size="large" 
              className="px-12 py-6 text-lg h-auto"
              onClick={() => navigate('/signup')}
            >
              Start Free Trial
            </Button>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <div className="bestarz-logo mb-4">
            Best<span className="text-green-400">★</span>rz
          </div>
          <Paragraph className="text-gray-500">
            © 2025 Bestarz. All rights reserved.
          </Paragraph>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;