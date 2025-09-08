import React from 'react';
import { Form, Input, Button, Card, Typography, Space, Divider, Checkbox } from 'antd';
import { Mail, Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph, Link } = Typography;

const SignIn= () => {
  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log('Login values:', values);
    // Simulate login based on email
    if (values.email.includes('admin')) {
      navigate('/admin/dashboard');
    } else if (values.email.includes('provider')) {
      navigate('/provider/dashboard');
    } else {
      navigate('/client/booking');
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Button 
          type="text" 
          icon={<ArrowLeft size={16} />}
          onClick={() => navigate('/')}
          className="mb-6 text-gray-400 hover:text-white"
        >
          Back to Home
        </Button>
        
        <Card className="glass-card" style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}>
          <div className="text-center mb-8">
            <div className="bestarz-logo text-3xl mb-2">
              Best<span className="text-green-400">★</span>rz
            </div>
            <Title level={3} className="text-white mb-2">Welcome back</Title>
            <Paragraph className="text-gray-400">Sign in to your account</Paragraph>
          </div>

          <Form
            name="signin"
            layout="vertical"
            onFinish={onFinish}
            autoComplete="off"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: 'Please input your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<Mail size={16} className="text-gray-400" />}
                placeholder="Email address"
                size="large"
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                prefix={<Lock size={16} className="text-gray-400" />}
                placeholder="Password"
                size="large"
              />
            </Form.Item>

            <Form.Item>
              <div className="flex justify-between items-center">
                <Checkbox className="text-gray-400">Remember me</Checkbox>
                <Link className="text-blue-400 hover:text-blue-300">
                  Forgot password?
                </Link>
              </div>
            </Form.Item>

            <Form.Item>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                block
                className="h-12 text-lg font-medium"
              >
                Sign In
              </Button>
            </Form.Item>
          </Form>

          <Divider className="border-gray-600">
            <span className="text-gray-500">or</span>
          </Divider>

          <div className="text-center">
            <Paragraph className="text-gray-400">
              Don't have an account?{' '}
              <Link onClick={() => navigate('/signup')} className="text-blue-400 hover:text-blue-300">
                Sign up now
              </Link>
            </Paragraph>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SignIn;