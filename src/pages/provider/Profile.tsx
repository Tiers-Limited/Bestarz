import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Upload, Select, Row, Col, InputNumber, Space, Tag, Divider } from 'antd';
import { Camera, MapPin, Phone, Mail, Globe, Copy, Check } from 'lucide-react';
import ProviderLayout from '../../components/ProviderLayout';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProviderProfile: React.FC = () => {
  const [form] = Form.useForm();
  const [copied, setCopied] = useState(false);
  
  const publicUrl = 'https://bestarz.com/provider/dj-master/book';

  const categories = [
    'DJ & Music', 'Photography', 'Catering', 'Event Planning', 
    'Videography', 'Entertainment', 'Transportation', 'Flowers & Decor'
  ];

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const onFinish = (values: any) => {
    console.log('Profile values:', values);
  };

  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-2">Provider Profile</Title>
        <Paragraph className="text-gray-400 mb-8">
          Manage your business profile and service offerings
        </Paragraph>

        {/* Public Link Card */}
        <Card className="mb-8" style={{ border: '1px solid #22C55E' }}>
          <div className="flex items-center justify-between">
            <div>
              <Title level={5} className="text-white mb-1">Your Public Booking Page</Title>
              <Paragraph className="text-gray-400 mb-0">
                Share this link with clients to receive bookings
              </Paragraph>
            </div>
            <Space>
              <code className="bg-gray-800 px-3 py-2 rounded text-blue-400 text-sm">
                {publicUrl}
              </code>
              <Button 
                type="primary" 
                icon={copied ? <Check size={16} /> : <Copy size={16} />}
                onClick={handleCopyUrl}
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Space>
          </div>
        </Card>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{
            businessName: 'DJ Master',
            category: 'DJ & Music',
            description: 'Professional DJ services for weddings, corporate events, and private parties.',
            basePrice: 500,
            location: 'New York, NY',
            phone: '+1 (555) 123-4567',
            email: 'djmaster@example.com',
            website: 'www.djmaster.com'
          }}
        >
          <Row gutter={[24, 24]}>
            {/* Basic Information */}
            <Col xs={24} lg={12}>
              <Card title="Basic Information" className="h-full">
                <Form.Item
                  name="businessName"
                  label="Business Name"
                  rules={[{ required: true, message: 'Please input your business name!' }]}
                >
                  <Input size="large" placeholder="Your Business Name" />
                </Form.Item>

                <Form.Item
                  name="category"
                  label="Service Category"
                  rules={[{ required: true, message: 'Please select a category!' }]}
                >
                  <Select size="large" placeholder="Select your primary service">
                    {categories.map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label="Business Description"
                  rules={[{ required: true, message: 'Please provide a description!' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Describe your services and what makes you unique..."
                  />
                </Form.Item>

                <Form.Item
                  name="basePrice"
                  label="Starting Price"
                  rules={[{ required: true, message: 'Please set your starting price!' }]}
                >
                  <InputNumber
                    size="large"
                    style={{ width: '100%' }}
                    prefix="$"
                    placeholder="Starting price for your services"
                    min={0}
                  />
                </Form.Item>
              </Card>
            </Col>

            {/* Contact & Media */}
            <Col xs={24} lg={12}>
              <Card title="Contact Information" className="h-full">
                <Form.Item
                  name="location"
                  label="Service Area"
                  rules={[{ required: true, message: 'Please input your service area!' }]}
                >
                  <Input 
                    size="large" 
                    prefix={<MapPin size={16} className="text-gray-400" />}
                    placeholder="City, State" 
                  />
                </Form.Item>

                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please input your phone!' }]}
                >
                  <Input 
                    size="large" 
                    prefix={<Phone size={16} className="text-gray-400" />}
                    placeholder="+1 (555) 123-4567" 
                  />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Business Email"
                  rules={[
                    { required: true, message: 'Please input your email!' },
                    { type: 'email', message: 'Please enter a valid email!' }
                  ]}
                >
                  <Input 
                    size="large" 
                    prefix={<Mail size={16} className="text-gray-400" />}
                    placeholder="business@example.com" 
                  />
                </Form.Item>

                <Form.Item
                  name="website"
                  label="Website (Optional)"
                >
                  <Input 
                    size="large" 
                    prefix={<Globe size={16} className="text-gray-400" />}
                    placeholder="www.yourbusiness.com" 
                  />
                </Form.Item>

                <Form.Item
                  name="profileImage"
                  label="Profile Image"
                >
                  <Upload.Dragger className="bg-gray-800 border-gray-600">
                    <p className="ant-upload-drag-icon">
                      <Camera size={32} className="text-gray-400 mx-auto" />
                    </p>
                    <p className="ant-upload-text text-white">Upload your business logo or photo</p>
                    <p className="ant-upload-hint text-gray-400">
                      Drag & drop or click to browse
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              </Card>
            </Col>

            {/* Services & Availability */}
            <Col xs={24}>
              <Card title="Service Details">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="services"
                      label="Services Offered"
                    >
                      <Select
                        mode="tags"
                        size="large"
                        placeholder="Add your services"
                        defaultValue={['Wedding DJ', 'Corporate Events', 'Private Parties']}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="availability"
                      label="Availability"
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="Select available days"
                        defaultValue={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(day => (
                          <Option key={day} value={day}>{day}</Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="portfolio"
                  label="Portfolio Images"
                >
                  <Upload.Dragger 
                    multiple 
                    className="bg-gray-800 border-gray-600"
                    accept="image/*"
                  >
                    <p className="ant-upload-drag-icon">
                      <Camera size={32} className="text-gray-400 mx-auto" />
                    </p>
                    <p className="ant-upload-text text-white">Upload portfolio images</p>
                    <p className="ant-upload-hint text-gray-400">
                      Show off your best work (max 10 images)
                    </p>
                  </Upload.Dragger>
                </Form.Item>
              </Card>
            </Col>
          </Row>

          <div className="mt-8 text-center">
            <Space size="large">
              <Button size="large">Cancel</Button>
              <Button type="primary" htmlType="submit" size="large" className="px-8">
                Save Profile
              </Button>
            </Space>
          </div>
        </Form>
      </div>
    </ProviderLayout>
  );
};

export default ProviderProfile;