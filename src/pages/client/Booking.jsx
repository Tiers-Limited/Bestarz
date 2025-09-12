import React, { useState } from 'react';
import { Steps, Card, Typography, Form, Input, Select, Button, Row, Col, Slider, DatePicker, Space, List, Avatar, Tag, Rate, Spin } from 'antd';
import { Search, MapPin, Zap, Filter, Star } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ClientLayout from '../../components/ClientLayout';

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ClientBooking = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [autoMatching, setAutoMatching] = useState(false);
  
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
      verified: true,
      responseTime: '2 hours',
      bookingRate: '95%'
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
      verified: true,
      responseTime: '4 hours',
      bookingRate: '92%'
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
      verified: true,
      responseTime: '1 hour',
      bookingRate: '98%'
    }
  ];
  
  const [searchResults, setSearchResults] = useState([]);
  const [searchFilters, setSearchFilters] = useState({});

  const handleSearch = (values) => {
    console.log('Search values:', values);
    setSearchFilters(values);
    setSearchResults(providers);
    setCurrentStep(1);
  };

  const handleAutoMatch = (values) => {
    console.log('Auto-match values:', values);
    setAutoMatching(true);
    setSearchFilters(values);
    
    // Simulate AI matching
    setTimeout(() => {
      const bestMatch = providers.sort((a, b) => b.rating - a.rating)[0];
      setSearchResults([bestMatch]);
      setAutoMatching(false);
      setCurrentStep(1);
    }, 2000);
  };
  
  const handleProviderSelect = (provider) => {
    console.log('Selected provider:', provider);
    navigate(`/provider/${provider.id}/book`);
  };

  const steps = [
    {
      title: 'Event Details',
      content: (
        <div className="max-w-4xl mx-auto">
          {/* Search Filters at Top */}
          <Card className="glow-border mb-8">
            <Title level={4} className="text-white mb-6 text-center">
              Quick Filters
            </Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={8}>
                <Select
                  size="large"
                  placeholder="Budget Range"
                  className="w-full"
                  options={[
                    { value: '100-500', label: '$100 - $500' },
                    { value: '500-1000', label: '$500 - $1,000' },
                    { value: '1000-2500', label: '$1,000 - $2,500' },
                    { value: '2500+', label: '$2,500+' }
                  ]}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Select
                  size="large"
                  placeholder="Service Type"
                  className="w-full"
                  getPopupContainer={() => document.body}
                  options={categories.map((cat) => ({
                    value: cat,
                    label: cat
                  }))}
                />
              </Col>
              <Col xs={24} sm={8}>
                <Select
                  size="large"
                  placeholder="Location"
                  className="w-full"
                  getPopupContainer={() => document.body}
                  options={[
                    { value: 'new-york', label: 'New York, NY' },
                    { value: 'brooklyn', label: 'Brooklyn, NY' },
                    { value: 'manhattan', label: 'Manhattan, NY' },
                    { value: 'queens', label: 'Queens, NY' }
                  ]}
                />
              </Col>
            </Row>
          </Card>

          <Card className="vibrant-card">
            <Title level={3} className="text-white text-center mb-8">
              Tell us about your event
            </Title>
            <Form layout="vertical" onFinish={handleSearch}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="eventType"
                    label={<span className="text-white">Event Type</span>}
                    rules={[{ required: true, message: 'Please select event type!' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Select event type"
                      getPopupContainer={() => document.body}
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
                    label={<span className="text-white">Service Category</span>}
                    rules={[{ required: true, message: 'Please select category!' }]}
                  >
                    <Select
                      size="large"
                      placeholder="What service do you need?"
                      getPopupContainer={() => document.body}
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
                    label={<span className="text-white">Event Location</span>}
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
                    label={<span className="text-white">Number of Guests</span>}
                    rules={[{ required: true, message: 'Please input guest count!' }]}
                  >
                    <Select
                      size="large"
                      placeholder="Expected guests"
                      getPopupContainer={() => document.body}
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
                    label={<span className="text-white">Event Date</span>}
                    rules={[{ required: true, message: 'Please select date!' }]}
                  >
                    <RangePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="budget" label={<span className="text-white">Budget Range</span>}>
                    <div className="px-4">
                      <Slider
                        range
                        min={100}
                        max={5000}
                        defaultValue={[500, 1500]}
                        marks={{
                          100: { label: '$100', style: { color: '#9CA3AF' } },
                          1000: { label: '$1,000', style: { color: '#9CA3AF' } },
                          2500: { label: '$2,500', style: { color: '#9CA3AF' } },
                          5000: { label: '$5,000+', style: { color: '#9CA3AF' } }
                        }}
                        tooltip={{
                          formatter: (value) => `$${value}`
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item name="description" label={<span className="text-white">Event Description</span>}>
                    <TextArea
                      rows={4}
                      placeholder="Tell us more about your event, special requirements, or preferences..."
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[16, 16]} className="mt-8">
                <Col xs={24} sm={12}>
                  <Form.Item className="text-center">
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      block
                      className="h-12 text-lg font-medium"
                      icon={<Search size={16} />}
                    >
                      Browse All Providers
                    </Button>
                  </Form.Item>
                </Col>
                <Col xs={24} sm={12}>
                  <Form.Item className="text-center">
                    <Button
                      className="auto-match-button h-12 text-lg font-medium"
                      size="large"
                      block
                      icon={autoMatching ? <Spin size="small" /> : <Zap size={16} />}
                      onClick={() => handleAutoMatch()}
                      loading={autoMatching}
                    >
                      {autoMatching ? 'Finding Perfect Match...' : 'AI Auto-Match'}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      )
    },
    {
      title: 'Browse Providers',
      content: (
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Title level={3} className="text-white">
              {autoMatching ? 'Your Perfect Match' : 'Available Providers'}
            </Title>
            <Paragraph className="text-gray-400">
              {autoMatching 
                ? 'Our AI found the best provider based on your requirements'
                : `Found ${searchResults.length} providers matching your criteria`
              }
            </Paragraph>
          </div>

          {/* Advanced Filters */}
          {!autoMatching && searchResults.length > 0 && (
            <Card className="mb-6 glow-border">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={6}>
                  <Select
                    size="large"
                    placeholder="Sort by"
                    className="w-full"
                    getPopupContainer={() => document.body}
                    defaultValue="rating"
                    options={[
                      { value: 'rating', label: 'Highest Rated' },
                      { value: 'price-low', label: 'Lowest Price' },
                      { value: 'price-high', label: 'Highest Price' },
                      { value: 'reviews', label: 'Most Reviews' },
                      { value: 'response', label: 'Fastest Response' }
                    ]}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Select
                    size="large"
                    placeholder="Rating"
                    className="w-full"
                    getPopupContainer={() => document.body}
                    options={[
                      { value: '5', label: '5 Stars Only' },
                      { value: '4+', label: '4+ Stars' },
                      { value: '3+', label: '3+ Stars' }
                    ]}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Select
                    size="large"
                    placeholder="Response Time"
                    className="w-full"
                    getPopupContainer={() => document.body}
                    options={[
                      { value: '1hour', label: 'Within 1 hour' },
                      { value: '4hours', label: 'Within 4 hours' },
                      { value: '1day', label: 'Within 1 day' }
                    ]}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Button 
                    size="large" 
                    icon={<Filter size={16} />}
                    block
                    className="border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400"
                  >
                    More Filters
                  </Button>
                </Col>
              </Row>
            </Card>
          )}

          <List
            dataSource={searchResults}
            renderItem={(provider) => (
              <Card
                className="mb-6 hover-lift cursor-pointer glow-border"
                onClick={() => handleProviderSelect(provider)}
              >
                <Row gutter={[24, 24]} align="middle">
                  <Col xs={24} sm={6} md={4}>
                    <div className="text-center">
                      <Avatar
                        src={provider.image}
                        size={80}
                        className="mx-auto block mb-2"
                      />
                      {provider.verified && (
                        <Tag color="green" className="text-xs">
                          VERIFIED
                        </Tag>
                      )}
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={12} md={12}>
                    <div>
                      <div className="flex items-center mb-2">
                        <Title level={4} className="text-white mb-0 mr-2">
                          {provider.name}
                        </Title>
                        {autoMatching && (
                          <Tag color="gold" icon={<Star size={12} />}>
                            PERFECT MATCH
                          </Tag>
                        )}
                      </div>
                      
                      <div className="rating-glow flex items-center mb-3">
                        <Rate disabled defaultValue={Math.round(provider.rating)} className="text-sm mr-2" />
                        <span className="text-yellow-400 font-semibold mr-2">
                          {provider.rating}
                        </span>
                        <span className="text-gray-400">
                          ({provider.reviews} reviews)
                        </span>
                      </div>
                      
                      <div className="flex items-center text-gray-400 mb-2">
                        <MapPin size={14} className="mr-1" />
                        {provider.location}
                      </div>
                      
                      <Space wrap>
                        <div className="trust-badge text-xs">
                          ⚡ {provider.responseTime} avg response
                        </div>
                        <div className="trust-badge text-xs">
                          📅 {provider.bookingRate} booking rate
                        </div>
                      </Space>
                    </div>
                  </Col>
                  
                  <Col xs={24} sm={6} md={8} className="text-right">
                    <div className="mb-4">
                      <span className="text-3xl font-bold text-green-400">
                        ${provider.price}
                      </span>
                      <span className="text-gray-400 text-sm ml-1 block">
                        starting price
                      </span>
                    </div>
                    <Button 
                      type="primary" 
                      size="large" 
                      block 
                      className="glow-button mb-2"
                    >
                      View Profile & Book
                    </Button>
                    <Button 
                      size="large" 
                      block
                      className="border-gray-600 text-gray-300 hover:border-green-400 hover:text-green-400"
                    >
                      Quick Message
                    </Button>
                  </Col>
                </Row>
              </Card>
            )}
          />

          {searchResults.length > 0 && (
            <div className="text-center mt-8">
              <Space size="large">
                <Button 
                  size="large" 
                  onClick={() => setCurrentStep(0)}
                  className="border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400"
                >
                  Refine Search
                </Button>
                {!autoMatching && (
                  <Button 
                    className="auto-match-button"
                    size="large"
                    icon={<Zap size={16} />}
                    onClick={() => handleAutoMatch(searchFilters)}
                  >
                    Try AI Auto-Match
                  </Button>
                )}
              </Space>
            </div>
          )}
        </div>
      )
    }
  ];

  return (


    // <ClientLayout >
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black/90 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="bestarz-logo cursor-pointer" onClick={() => navigate('/')}>
              Best<span className="text-green-400">★</span>rz
            </div>
            <Space>
              <Button type="text" onClick={() => navigate('/signin')} className="text-white">
                Sign In
              </Button>
              <Button type="primary" onClick={() => navigate('/signup')} className="glow-button">
                Join as Provider
              </Button>
            </Space>
          </div>
        </div>
      </header>

      <div className="pt-8 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <Steps
            current={currentStep}
            items={steps.map((step) => ({ title: step.title }))}
            className="mb-12"
          />

          {steps[currentStep].content}
        </div>
      </div>
    </div>

    // </ClientLayout>
  );
};

export default ClientBooking;