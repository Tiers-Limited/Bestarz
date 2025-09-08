import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, Select, Steps, Row, Col } from 'antd';
import { Mail, Lock, User, ArrowLeft, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Link } = Typography;
const { Option } = Select;

const SignUp = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [userType, setUserType] = useState('');

  const onFinish = (values) => {
    console.log('Signup values:', values);
    if (values.userType === 'provider') {
      navigate('/provider/subscription');
    } else {
      navigate('/client/booking');
    }
  };

  const steps = [
    {
      title: 'Account Type',
      content: (
        <Space direction="vertical" size="large" className="w-full">
          <div className="text-center mb-6">
            <Title level={4} className="text-white">Choose your account type</Title>
            <Paragraph className="text-gray-400">
              Select how you'll be using Bestarz
            </Paragraph>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card 
              className={`cursor-pointer transition-all ${userType === 'provider' ? 'border-blue-400 bg-blue-500/10' : 'hover:border-gray-500'}`}
              onClick={() => {
                setUserType('provider');
                setCurrentStep(1);
              }}
            >
              <div className="text-center">
                <Building size={32} className="text-blue-400 mx-auto mb-4" />
                <Title level={5} className="text-white">Service Provider</Title>
                <Paragraph className="text-gray-400 text-sm">
                  Offer your services and manage bookings
                </Paragraph>
              </div>
            </Card>
            
            <Card 
              className={`cursor-pointer transition-all ${userType === 'client' ? 'border-green-400 bg-green-500/10' : 'hover:border-gray-500'}`}
              onClick={() => {
                setUserType('client');
                setCurrentStep(1);
              }}
            >
              <div className="text-center">
                <User size={32} className="text-green-400 mx-auto mb-4" />
                <Title level={5} className="text-white">Client</Title>
                <Paragraph className="text-gray-400 text-sm">
                  Find and book amazing services
                </Paragraph>
              </div>
            </Card>
          </div>
        </Space>
      )
    },
    {
      title: 'Account Details',
      content: (
        <Form
          name="signup"
          layout="vertical"
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item name="userType" initialValue={userType} style={{ display: 'none' }}>
            <Input />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please input your first name!' }]}
              >
                <Input 
                  prefix={<User size={16} className="text-gray-400" />}
                  placeholder="John"
                  size="large"
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please input your last name!' }]}
              >
                <Input 
                  prefix={<User size={16} className="text-gray-400" />}
                  placeholder="Doe"
                  size="large"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please input your email!' },
              { type: 'email', message: 'Please enter a valid email!' }
            ]}
          >
            <Input 
              prefix={<Mail size={16} className="text-gray-400" />}
              placeholder="john@example.com"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please input your password!' },
              { min: 8, message: 'Password must be at least 8 characters!' }
            ]}
          >
            <Input.Password
              prefix={<Lock size={16} className="text-gray-400" />}
              placeholder="Create a strong password"
              size="large"
            />
          </Form.Item>

          {userType === 'provider' && (
            <Form.Item
              name="businessName"
              label="Business Name"
              rules={[{ required: true, message: 'Please input your business name!' }]}
            >
              <Input 
                prefix={<Building size={16} className="text-gray-400" />}
                placeholder="Your Business Name"
                size="large"
              />
            </Form.Item>
          )}

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              size="large" 
              block
              className="h-12 text-lg font-medium"
            >
              Create Account
            </Button>
          </Form.Item>
        </Form>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <Button 
          type="text" 
          icon={<ArrowLeft size={16} />}
          onClick={() => currentStep > 0 ? setCurrentStep(0) : navigate('/')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          Back
        </Button>
        
        <Card className="glass-card" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="text-center mb-8">
            <div className="bestarz-logo text-3xl mb-4">
              Best<span className="text-green-400">★</span>rz
            </div>
            <Title level={3} className="text-white mb-2">Join Bestarz</Title>
            <Paragraph className="text-gray-400">Create your account to get started</Paragraph>
          </div>

          <Steps
            current={currentStep}
            items={steps.map(step => ({ title: step.title }))}
            className="mb-8"
          />

          {steps[currentStep].content}

          {currentStep === 0 && (
            <>
              <Divider className="border-gray-600">
                <span className="text-gray-500">or</span>
              </Divider>

              <div className="text-center">
                <Paragraph className="text-gray-400">
                  Already have an account?{' '}
                  <Link onClick={() => navigate('/signin')} className="text-blue-400 hover:text-blue-300">
                    Sign in here
                  </Link>
                </Paragraph>
              </div>
            </>
          )}
        </Card>
      </div>
    </div>
  );
};

export default SignUp;