import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, Upload, Select, Row, Col, InputNumber, Space, Tag, Divider, Table, Modal } from 'antd';
import { Camera, MapPin, Phone, Mail, Globe, Copy, Check, Plus, Edit, Trash2 } from 'lucide-react';
import ProviderLayout from '../../components/ProviderLayout';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const ProviderProfile = () => {
  const [form] = Form.useForm();
  const [copied, setCopied] = useState(false);
  const [rateCardVisible, setRateCardVisible] = useState(false);
  const [rateCards, setRateCards] = useState([
    {
      key: '1',
      service: 'Wedding DJ',
      basePrice: 1200,
      duration: '6 hours',
      includes: ['Sound system', 'Microphones', 'Basic lighting', 'Music library access'],
      addOns: [
        { name: 'Extra hour', price: 150 },
        { name: 'Premium lighting', price: 300 },
        { name: 'Photo booth', price: 400 }
      ]
    },
    {
      key: '2',
      service: 'Corporate Event',
      basePrice: 800,
      duration: '4 hours',
      includes: ['Sound system', 'Microphones', 'Background music'],
      addOns: [
        { name: 'Extra hour', price: 100 },
        { name: 'Live mixing', price: 200 }
      ]
    },
    {
      key: '3',
      service: 'Private Party',
      basePrice: 600,
      duration: '4 hours',
      includes: ['Sound system', 'Basic setup'],
      addOns: [
        { name: 'Extra hour', price: 120 },
        { name: 'Karaoke setup', price: 250 }
      ]
    }
  ]);
  
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

  const onFinish = (values) => {
    console.log('Profile values:', values);
  };

  const rateCardColumns = [
    {
      title: 'Service Type',
      dataIndex: 'service',
      key: 'service',
      render: (text) => <span className="text-white font-semibold">{text}</span>
    },
    {
      title: 'Base Price',
      dataIndex: 'basePrice',
      key: 'basePrice',
      render: (price) => <span className="text-green-400 font-bold">${price}</span>
    },
    {
      title: 'Duration',
      dataIndex: 'duration',
      key: 'duration',
      render: (duration) => <span className="text-gray-300">{duration}</span>
    },
    {
      title: 'Includes',
      dataIndex: 'includes',
      key: 'includes',
      render: (includes) => (
        <div>
          {includes.slice(0, 2).map((item, index) => (
            <Tag key={index} color="blue" className="mb-1 text-xs">
              {item}
            </Tag>
          ))}
          {includes.length > 2 && (
            <Tag color="default" className="text-xs">
              +{includes.length - 2} more
            </Tag>
          )}
        </div>
      )
    },
    {
      title: 'Add-ons',
      dataIndex: 'addOns',
      key: 'addOns',
      render: (addOns) => (
        <div>
          {addOns.slice(0, 2).map((addon, index) => (
            <div key={index} className="text-xs text-gray-400">
              {addon.name}: +${addon.price}
            </div>
          ))}
          {addOns.length > 2 && (
            <div className="text-xs text-gray-500">
              +{addOns.length - 2} more add-ons
            </div>
          )}
        </div>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <Space size="small">
          <Button size="small" icon={<Edit size={14} />} className="hover-lift">
            Edit
          </Button>
          <Button size="small" danger icon={<Trash2 size={14} />}>
            Delete
          </Button>
        </Space>
      )
    }
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <Title level={2} className="text-white mb-2">Provider Profile</Title>
        <Paragraph className="text-gray-400 mb-8">
          Manage your business profile, services, and pricing structure
        </Paragraph>

        {/* Public Link Card */}
        <Card className="mb-8 vibrant-card">
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
                className="glow-button"
              >
                {copied ? 'Copied!' : 'Copy'}
              </Button>
            </Space>
          </div>
        </Card>

        {/* Rate Card Management */}
        <Card 
          title="Service Rate Cards" 
          className="mb-8 glow-border"
          extra={
            <Button 
              type="primary" 
              icon={<Plus size={16} />}
              onClick={() => setRateCardVisible(true)}
              className="glow-button"
            >
              Add Rate Card
            </Button>
          }
        >
          <Paragraph className="text-gray-400 mb-6">
            Set different pricing for different types of events. This helps clients understand 
            your pricing structure and makes booking decisions easier.
          </Paragraph>
          
          <Table
            dataSource={rateCards}
            columns={rateCardColumns}
            pagination={false}
            className="mb-4"
            scroll={{ x: 800 }}
          />
          
          <div className="mt-4 p-4 bg-gray-800 rounded-lg">
            <Title level={5} className="text-white mb-2">Rate Card Benefits</Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <div className="trust-badge">
                  ✨ Clear pricing for clients
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="trust-badge">
                  💰 Higher booking conversion
                </div>
              </Col>
              <Col xs={24} sm={8}>
                <div className="trust-badge">
                  🎯 Targeted service offerings
                </div>
              </Col>
            </Row>
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
              <Card title="Basic Information" className="h-full glow-border">
                <Form.Item
                  name="businessName"
                  label={<span className="text-white">Business Name</span>}
                  rules={[{ required: true, message: 'Please input your business name!' }]}
                >
                  <Input size="large" placeholder="Your Business Name" />
                </Form.Item>

                <Form.Item
                  name="category"
                  label={<span className="text-white">Service Category</span>}
                  rules={[{ required: true, message: 'Please select a category!' }]}
                >
                  <Select 
                    size="large" 
                    placeholder="Select your primary service"
                    getPopupContainer={(triggerNode) => triggerNode.parentNode}
                  >
                    {categories.map(cat => (
                      <Option key={cat} value={cat}>{cat}</Option>
                    ))}
                  </Select>
                </Form.Item>

                <Form.Item
                  name="description"
                  label={<span className="text-white">Business Description</span>}
                  rules={[{ required: true, message: 'Please provide a description!' }]}
                >
                  <TextArea 
                    rows={4} 
                    placeholder="Describe your services and what makes you unique..."
                  />
                </Form.Item>

                <Form.Item
                  name="basePrice"
                  label={<span className="text-white">Starting Price (for basic listings)</span>}
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
              <Card title="Contact Information" className="h-full glow-border">
                <Form.Item
                  name="location"
                  label={<span className="text-white">Service Area</span>}
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
                  label={<span className="text-white">Phone Number</span>}
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
                  label={<span className="text-white">Business Email</span>}
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
                  label={<span className="text-white">Website (Optional)</span>}
                >
                  <Input 
                    size="large" 
                    prefix={<Globe size={16} className="text-gray-400" />}
                    placeholder="www.yourbusiness.com" 
                  />
                </Form.Item>

                <Form.Item
                  name="profileImage"
                  label={<span className="text-white">Profile Image</span>}
                >
                  <Upload.Dragger className="bg-gray-800 border-gray-600 hover:border-blue-400">
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
              <Card title="Service Details" className="glow-border">
                <Row gutter={[24, 24]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="services"
                      label={<span className="text-white">Services Offered</span>}
                    >
                      <Select
                        mode="tags"
                        size="large"
                        placeholder="Add your services"
                        defaultValue={['Wedding DJ', 'Corporate Events', 'Private Parties']}
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="availability"
                      label={<span className="text-white">Availability</span>}
                    >
                      <Select
                        mode="multiple"
                        size="large"
                        placeholder="Select available days"
                        defaultValue={['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']}
                        getPopupContainer={(triggerNode) => triggerNode.parentNode}
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
                  label={<span className="text-white">Portfolio Images</span>}
                >
                  <Upload.Dragger 
                    multiple 
                    className="bg-gray-800 border-gray-600 hover:border-blue-400"
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
              <Button size="large" className="hover-lift">
                Cancel
              </Button>
              <Button 
                type="primary" 
                htmlType="submit" 
                size="large" 
                className="glow-button px-8"
              >
                Save Profile
              </Button>
            </Space>
          </div>
        </Form>

        {/* Rate Card Modal */}
        <Modal
          title="Create Rate Card"
          open={rateCardVisible}
          onCancel={() => setRateCardVisible(false)}
          footer={null}
          width={600}
        >
          <Form layout="vertical">
            <Form.Item name="service" label="Service Type" required>
              <Input size="large" placeholder="e.g., Wedding DJ" />
            </Form.Item>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item name="basePrice" label="Base Price" required>
                  <InputNumber 
                    size="large" 
                    style={{ width: '100%' }}
                    prefix="$"
                    placeholder="Base price"
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={12}>
                <Form.Item name="duration" label="Duration" required>
                  <Input size="large" placeholder="e.g., 6 hours" />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item name="includes" label="What's Included">
              <Select
                mode="tags"
                size="large"
                placeholder="Add what's included in base price"
                getPopupContainer={(triggerNode) => triggerNode.parentNode}
              />
            </Form.Item>
            <div className="text-center mt-6">
              <Space>
                <Button onClick={() => setRateCardVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" className="glow-button">
                  Create Rate Card
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </div>
    </ProviderLayout>
  );
};

export default ProviderProfile;