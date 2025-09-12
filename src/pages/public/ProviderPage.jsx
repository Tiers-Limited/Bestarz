import React from 'react';
import { Card, Typography, Button, Row, Col, Rate, Tag, Form, Input, DatePicker, TimePicker, InputNumber, Space, Avatar, Divider, Image } from 'antd';
import { MapPin, Phone, Mail, Globe, Calendar, Clock, DollarSign, Star, Check } from 'lucide-react';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const PublicProviderPage = () => {
  const provider = {
    name: 'DJ Master',
    category: 'DJ & Music',
    rating: 4.9,
    reviews: 127,
    startingPrice: 500,
    location: 'New York, NY',
    phone: '+1 (555) 123-4567',
    email: 'djmaster@example.com',
    website: 'www.djmaster.com',
    image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=400',
    verified: true,
    description: 'Professional DJ services for weddings, corporate events, and private parties. With over 10 years of experience, I specialize in creating unforgettable musical experiences tailored to your unique event.',
    services: ['Wedding DJ', 'Corporate Events', 'Private Parties', 'Club Events'],
    portfolio: [
      'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
      'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=300',
      'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300'
    ]
  };

  const onFinish = (values) => {
    console.log('Booking request:', values);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="bestarz-logo">
              Best<span className="bestarz-star">★</span>rz
            </div>
            <Button type="primary">
              Join Bestarz
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <Row gutter={[24, 24]}>
          {/* Provider Info */}
          <Col xs={24} lg={8}>
            <Card className="mb-6">
              <div className="text-center mb-6">
                <Avatar src={provider.image} size={120} className="mb-4" />
                <div className="flex items-center justify-center mb-2">
                  <Title level={3} className="text-white mb-0 mr-2">{provider.name}</Title>
                  {provider.verified && <Tag color="green">VERIFIED</Tag>}
                </div>
                <Paragraph className="text-gray-400 mb-4">{provider.category}</Paragraph>
                <div className="flex items-center justify-center mb-4">
                  <Rate disabled defaultValue={provider.rating} className="text-sm mr-2" />
                  <span className="text-gray-400">({provider.reviews} reviews)</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${provider.startingPrice}</span>
                  <span className="text-gray-400 ml-1">starting price</span>
                </div>
              </div>

              <Divider className="border-gray-600" />

              <Space direction="vertical" size="middle" className="w-full">
                <div className="flex items-center text-gray-300">
                  <MapPin size={16} className="mr-2 text-gray-400" />
                  {provider.location}
                </div>
                <div className="flex items-center text-gray-300">
                  <Phone size={16} className="mr-2 text-gray-400" />
                  {provider.phone}
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={16} className="mr-2 text-gray-400" />
                  {provider.email}
                </div>
                <div className="flex items-center text-gray-300">
                  <Globe size={16} className="mr-2 text-gray-400" />
                  {provider.website}
                </div>
              </Space>
            </Card>

            {/* Services */}
            <Card title="Services Offered">
              <Space wrap>
                {provider.services.map((service) => (
                  <Tag key={service} color="blue">{service}</Tag>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* About */}
            <Card className="mb-6" title="About">
              <Paragraph className="text-gray-300">
                {provider.description}
              </Paragraph>
            </Card>

            {/* Portfolio */}
            <Card className="mb-6" title="Portfolio">
              <Row gutter={[16, 16]}>
                {provider.portfolio.map((image, index) => (
                  <Col xs={24} sm={8} key={index}>
                    <Image
                      src={image}
                      alt={`Portfolio ${index + 1}`}
                      className="rounded-lg"
                      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
                    />
                  </Col>
                ))}
              </Row>
            </Card>

            {/* Booking Form */}
            <Card title="Request a Booking">
              <Form layout="vertical" onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="eventDate"
                      label="Event Date"
                      rules={[{ required: true, message: 'Please select date!' }]}
                    >
                      <DatePicker size="large" className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="eventTime"
                      label="Event Time"
                      rules={[{ required: true, message: 'Please select time!' }]}
                    >
                      <TimePicker size="large" className="w-full" format="HH:mm" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="duration"
                      label="Event Duration (hours)"
                      rules={[{ required: true, message: 'Please input duration!' }]}
                    >
                      <InputNumber size="large" className="w-full" min={1} max={24} />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="budget"
                      label="Your Budget"
                      rules={[{ required: true, message: 'Please input budget!' }]}
                    >
                      <InputNumber
                        size="large"
                        className="w-full"
                        prefix="$"
                        min={0}
                        placeholder="Your budget for this service"
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="message"
                      label="Additional Details"
                    >
                      <TextArea 
                        rows={4}
                        placeholder="Tell us more about your event, special requests, or any questions..."
                      />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item
                      name="contactInfo"
                      label="Your Contact Information"
                      rules={[{ required: true, message: 'Please provide contact info!' }]}
                    >
                      <Input 
                        size="large"
                        placeholder="Your name and phone number"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <div className="bg-gray-800 p-4 rounded-lg mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-300">Estimated Total:</span>
                    <span className="text-2xl font-bold text-green-400">$750</span>
                  </div>
                  <Paragraph className="text-xs text-gray-500 mt-2 mb-0">
                    Final price will be confirmed by the provider based on your specific requirements
                  </Paragraph>
                </div>

                <Form.Item className="text-center">
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    size="large"
                    className="px-12 h-12 text-lg font-medium"
                  >
                    Send Booking Request
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default PublicProviderPage;