import React, { useState } from 'react';
import { Steps, Card, Typography, Form, Input, Select, Button, Row, Col, Slider, DatePicker, Space, List, Avatar, Tag, Rate } from 'antd';
import { Search, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ClientBooking: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  
  const categories = [
    'DJ & Music',
    'Photography',
    'Catering',
    'Event Planning',
    'Videography',
    'Entertainment',
    'Transportation',
    'Flowers & Decor'
  ];
  
  const providers = [
    {
      id: 1,
      name: 'DJ Master',
      category: 'DJ & Music',
      rating: 4.9,
      reviews: 127,
      price: 500,
      location: 'New York, NY',
      image: 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=300',
      verified: true
    },
    {
      id: 2,
      name: 'Sound Waves DJ',
      category: 'DJ & Music',
      rating: 4.7,
      reviews: 89,
      price: 450,
      location: 'Brooklyn, NY',
      image: 'https://images.pexels.com/photos/1684187/pexels-photo-1684187.jpeg?auto=compress&cs=tinysrgb&w=300',
      verified: true
    },
    {
      id: 3,
      name: 'Elite Events DJ',
      category: 'DJ & Music',
      rating: 4.8,
      reviews: 156,
      price: 650,
      location: 'Manhattan, NY',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=300',
      verified: true
    }
  ];
  
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const handleSearch = (values: any) => {
    console.log('Search values:', values);
    setSearchResults(providers);
    setCurrentStep(1);
  };
  
  const handleProviderSelect = (provider: any) => {
    console.log('Selected provider:', provider);
    navigate(`/provider/${provider.id}/book`);
  };

  const steps = [
    {
      title: 'Event Details',
      content: (
        <Card className="max-w-2xl mx-auto">
          <Title level={3} className="text-white text-center mb-8">
            Tell us about your event
          </Title>
          <Form layout="vertical" onFinish={handleSearch}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Form.Item
                  name="eventType"
                  label="Event Type"
                  rules={[{ required: true, message: 'Please select event type!' }]}
                >
                  <Select
                    size="large"
                    placeholder="Select event type"
                    popupMatchSelectWidth={false}   // prevent width issues
                    dropdownStyle={{ zIndex: 2000 }} // force it above modals/steps
                    options={[
                      { value: 'wedding', label: 'Wedding' },
                      { value: 'corporate', label: 'Corporate Event' },
                      { value: 'birthday', label: 'Birthday Party' },
                      { value: 'anniversary', label: 'Anniversary' },
                      { value: 'other', label: 'Other' }
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="category"
                  label="Service Category"
                  rules={[{ required: true, message: 'Please select category!' }]}
                >
                  <Select
                    size="large"
                    placeholder="What service do you need?"
                    getPopupContainer={(triggerNode) => document.body}
                    options={categories.map((cat) => ({
                      value: cat,
                      label: cat
                    }))}
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="location"
                  label="Event Location"
                  rules={[{ required: true, message: 'Please input location!' }]}
                >
                  <Input
                    size="large"
                    prefix={<MapPin size={16} className="text-gray-400" />}
                    placeholder="City, State or Zip Code"
                  />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
                <Form.Item
                  name="guests"
                  label="Number of Guests"
                  rules={[{ required: true, message: 'Please input guest count!' }]}
                >
                  <Select
                    size="large"
                    placeholder="Expected guests"
                    getPopupContainer={(triggerNode) => document.body}
                    options={[
                      { value: '1-25', label: '1-25 guests' },
                      { value: '26-50', label: '26-50 guests' },
                      { value: '51-100', label: '51-100 guests' },
                      { value: '101-200', label: '101-200 guests' },
                      { value: '200+', label: '200+ guests' }
                    ]}
                  />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item
                  name="dateRange"
                  label="Event Date"
                  rules={[{ required: true, message: 'Please select date!' }]}
                >
                  <RangePicker size="large" className="w-full" />
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="budget" label="Budget Range">
                  <div className="px-4">
                    <Slider
                      range
                      min={100}
                      max={5000}
                      defaultValue={[500, 1500]}
                      marks={{
                        100: '$100',
                        1000: '$1,000',
                        2500: '$2,500',
                        5000: '$5,000+'
                      }}
                      tooltip={{
                        formatter: (value) => `$${value}`
                      }}
                    />
                  </div>
                </Form.Item>
              </Col>

              <Col xs={24}>
                <Form.Item name="description" label="Event Description">
                  <TextArea
                    rows={4}
                    placeholder="Tell us more about your event, special requirements, or preferences..."
                  />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item className="text-center mt-8">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="px-12 h-12 text-lg font-medium"
                icon={<Search size={16} />}
              >
                Find Providers
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )
    },
    {
      title: 'Browse Providers',
      content: (
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <Title level={3} className="text-white">
              Available Providers
            </Title>
            <Paragraph className="text-gray-400">
              Found {searchResults.length} providers matching your criteria
            </Paragraph>
          </div>

          <List
            dataSource={searchResults}
            renderItem={(provider) => (
              <Card
                className="mb-6 hover-lift cursor-pointer"
                onClick={() => handleProviderSelect(provider)}
              >
                <Row gutter={[16, 16]} align="middle">
                  <Col xs={24} sm={6}>
                    <Avatar
                      src={provider.image}
                      size={80}
                      className="mx-auto block"
                    />
                  </Col>
                  <Col xs={24} sm={12}>
                    <div>
                      <div className="flex items-center mb-2">
                        <Title
                          level={4}
                          className="text-white mb-0 mr-2"
                        >
                          {provider.name}
                        </Title>
                        {provider.verified && <Tag color="green">VERIFIED</Tag>}
                      </div>
                      <div className="flex items-center mb-2">
                        <Rate disabled defaultValue={Math.round(provider.rating)} className="text-sm mr-2" />
                        <span className="text-gray-400">
                          ({provider.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <MapPin size={14} className="mr-1" />
                        {provider.location}
                      </div>
                    </div>
                  </Col>
                  <Col xs={24} sm={6} className="text-right">
                    <div className="mb-2">
                      <span className="text-2xl font-bold text-white">
                        ${provider.price}
                      </span>
                      <span className="text-gray-400 text-sm ml-1">
                        starting
                      </span>
                    </div>
                    <Button type="primary" size="large" block>
                      View Profile
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          />

          {searchResults.length > 0 && (
            <div className="text-center mt-8">
              <Button size="large" onClick={() => setCurrentStep(0)}>
                Refine Search
              </Button>
            </div>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="bestarz-logo cursor-pointer" onClick={() => navigate('/')}>
              Best<span className="text-green-400">★</span>rz
            </div>
            <Space>
              <Button type="text" onClick={() => navigate('/signin')}>
                Sign In
              </Button>
              <Button type="primary" onClick={() => navigate('/signup')}>
                Join as Provider
              </Button>
            </Space>
          </div>
        </div>
      </header>

      <div className="pt-8 pb-12 px-4">
        <div className="max-w-6xl mx-auto">
          <Steps
            current={currentStep}
            items={steps.map((step) => ({ title: step.title }))}
            className="mb-12"
          />

          {steps[currentStep].content}
        </div>
      </div>
    </div>
  );
};

export default ClientBooking;
