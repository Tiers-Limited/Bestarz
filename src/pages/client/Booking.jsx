import React, { useState } from "react";
import {
  Steps,
  Card,
  Typography,
  Form,
  Input,
  Select,
  Button,
  Row,
  Col,
  Slider,
  DatePicker,
  Space,
  List,
  Avatar,
  Tag,
  Rate,
  Spin,
} from "antd";
import { Search, MapPin, Zap, Filter, Star, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ClientLayout from "../../components/ClientLayout";
import { useClient } from "../../context/client/ClientContext";
import { useCreateConversation } from "../../hooks/useCreateConversation";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ClientBooking = () => {
  const navigate = useNavigate();
  const { fetchProviders, providers, loading } = useClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [autoMatching, setAutoMatching] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});

  const { createAndNavigateToConversation } = useCreateConversation();

  const categories = [
    "DJ & Music",
    "Photography",
    "Catering",
    "Event Planning",
    "Videography",
    "Entertainment",
    "Transportation",
    "Flowers & Decor",
    "Uncategorized",
  ];

  const handleSearch = async (values) => {
    console.log("Search values:", values);
    setSearchFilters(values);

    // Construct searchParams, excluding undefined or empty values
    const searchParams = {};
    // if (values.serviceType) searchParams.q = values.serviceType;
    if (values.category) searchParams.category = values.category;
    if (values.location) searchParams.location = values.location;
    if (values.budget && Array.isArray(values.budget)) {
      searchParams.minPrice = values.budget[0];
      searchParams.maxPrice = values.budget[1];
    }
    if (values.rating) searchParams.rating = values.rating;
    searchParams.sortBy = "rating";
    searchParams.page = 1;
    searchParams.limit = 20;

    // Fetch providers from API
    const result = await fetchProviders(searchParams);
    if (result.success) {
      setCurrentStep(1);
    } else {
      console.error("Error fetching providers:", result.error);
    }
  };

  const handleAutoMatch = async (values) => {
    console.log("Auto-match values:", values);
    setAutoMatching(true);
    setSearchFilters(values);

    // Construct searchParams, excluding undefined or empty values
    const searchParams = {};
    if (values.serviceType) searchParams.q = values.serviceType;
    if (values.category) searchParams.category = values.category;
    if (values.location) searchParams.location = values.location;
    if (values.budget && Array.isArray(values.budget)) {
      searchParams.minPrice = values.budget[0];
      searchParams.maxPrice = values.budget[1];
    }
    searchParams.rating = values.rating || 4; // Default to high-rated for AI match
    searchParams.sortBy = "rating";
    searchParams.page = 1;
    searchParams.limit = 1; // Fetch only one provider for AI match

    // Fetch providers from API
    const result = await fetchProviders(searchParams);
    setAutoMatching(false);
    if (result.success) {
      setCurrentStep(1);
    } else {
      console.error("Error fetching AI-matched provider:", result.error);
    }
  };

  const handleProviderSelect = (provider) => {
    console.log("Selected provider:", provider);
    navigate(`/provider/${provider._id || provider.id}`);
  };

  const steps = [
    {
      title: "Event Details",
      content: (
        <div className="max-w-4xl mx-auto">
          <Card className="vibrant-card">
            <Title level={3} className="text-white text-center mb-8">
              Tell us about your event
            </Title>
            <Form layout="vertical" onFinish={handleSearch}>
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12}>
                  <Form.Item
                    name="serviceType"
                    label={<span className="text-white">Service Type</span>}
                    rules={[
                      { required: true, message: "Please select event type!" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Select Service type"
                      getPopupContainer={() => document.body}
                      options={[
                        { value: "wedding", label: "Wedding" },
                        { value: "corporate", label: "Corporate Event" },
                        { value: "birthday", label: "Birthday Party" },
                        { value: "anniversary", label: "Anniversary" },
                        { value: "other", label: "Other" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="category"
                    label={<span className="text-white">Service Category</span>}
                    rules={[
                      { required: true, message: "Please select category!" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="What service do you need?"
                      getPopupContainer={() => document.body}
                      options={categories.map((cat) => ({
                        value: cat,
                        label: cat,
                      }))}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24} md={12}>
                  <Form.Item
                    name="location"
                    label={<span className="text-white">Event Location</span>}
                    rules={[
                      { required: true, message: "Please input location!" },
                    ]}
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
                    rules={[
                      { required: true, message: "Please input guest count!" },
                    ]}
                  >
                    <Select
                      size="large"
                      placeholder="Expected guests"
                      getPopupContainer={() => document.body}
                      options={[
                        { value: "1-25", label: "1-25 guests" },
                        { value: "26-50", label: "26-50 guests" },
                        { value: "51-100", label: "51-100 guests" },
                        { value: "101-200", label: "101-200 guests" },
                        { value: "200+", label: "200+ guests" },
                      ]}
                    />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="dateRange"
                    label={<span className="text-white">Event Date</span>}
                    rules={[{ required: true, message: "Please select date!" }]}
                  >
                    <RangePicker size="large" className="w-full" />
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="budget"
                    label={<span className="text-white">Budget Range</span>}
                  >
                    <div className="px-4">
                      <Slider
                        range
                        min={0} // start from 0
                        max={5000}
                        defaultValue={[0, 1500]} // default range starting from 0
                        marks={{
                          0: { label: "$0", style: { color: "#9CA3AF" } },
                          1000: {
                            label: "$1,000",
                            style: { color: "#9CA3AF" },
                          },
                          2500: {
                            label: "$2,500",
                            style: { color: "#9CA3AF" },
                          },
                          5000: {
                            label: "$5,000+",
                            style: { color: "#9CA3AF" },
                          },
                        }}
                        tooltip={{
                          formatter: (value) => `$${value}`,
                        }}
                      />
                    </div>
                  </Form.Item>
                </Col>

                <Col xs={24}>
                  <Form.Item
                    name="description"
                    label={
                      <span className="text-white">Event Description</span>
                    }
                  >
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
                      loading={loading}
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
                      icon={
                        autoMatching || loading ? (
                          <Spin size="small" />
                        ) : (
                          <Zap size={16} />
                        )
                      }
                      onClick={() => handleAutoMatch(searchFilters)}
                      loading={autoMatching || loading}
                    >
                      {autoMatching || loading
                        ? "Finding Perfect Match..."
                        : "AI Auto-Match"}
                    </Button>
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Card>
        </div>
      ),
    },
    {
      title: "Browse Providers",
      content: (
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <Title level={3} className="text-white">
              {autoMatching ? "Your Perfect Match" : "Available Providers"}
            </Title>
            <Paragraph className="text-gray-400">
              {loading
                ? "Loading providers..."
                : autoMatching
                ? "Our AI found the best provider based on your requirements"
                : `Found ${providers.length} providers matching your criteria`}
            </Paragraph>
          </div>

          {!autoMatching && (
            <Card className="mb-6 glow-border">
              <Row gutter={[16, 16]} align="middle">
                <Col xs={24} sm={6}>
                  <Select
                    size="large"
                    placeholder="Sort by"
                    className="w-full"
                    getPopupContainer={() => document.body}
                    defaultValue="rating"
                    onChange={(value) =>
                      handleSearch({ ...searchFilters, sortBy: value })
                    }
                    options={[
                      { value: "rating", label: "Highest Rated" },
                      { value: "price-low", label: "Lowest Price" },
                      { value: "price-high", label: "Highest Price" },
                      { value: "reviews", label: "Most Reviews" },
                    ]}
                  />
                </Col>
                <Col xs={24} sm={6}>
                  <Select
                    size="large"
                    placeholder="Rating"
                    className="w-full"
                    getPopupContainer={() => document.body}
                    value={searchFilters.rating || undefined} // controlled value
                    onChange={(value) =>
                      handleSearch({ ...searchFilters, rating: value || null })
                    }
                    allowClear
                    options={[
                      { value: "5", label: "5 Stars Only" },
                      { value: "4", label: "4+ Stars" },
                      { value: "3", label: "3+ Stars" },
                    ]}
                  />
                </Col>
              </Row>
            </Card>
          )}

          {loading ? (
            <div className="text-center">
              <Spin size="large" />
            </div>
          ) : (
            <List
              dataSource={providers}
              renderItem={(provider) => (
                <Card
                  className="mb-6 hover-lift cursor-pointer glow-border"
                  onClick={() => handleProviderSelect(provider)}
                >
                  <Row gutter={[24, 24]} align="middle">
                    <Col xs={24} sm={6} md={4}>
                      <div className="text-center">
                        <Avatar
                          src={
                            provider.user?.profileImage ||
                            "https://via.placeholder.com/80"
                          }
                          size={80}
                          className="mx-auto block mb-2"
                        />
                        {provider.user?.isActive && (
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
                            {provider.businessName}
                          </Title>
                          {autoMatching && (
                            <Tag color="gold" icon={<Star size={12} />}>
                              PERFECT MATCH
                            </Tag>
                          )}
                        </div>

                        <div className="rating-glow flex items-center mb-3">
                          <Rate
                            disabled
                            defaultValue={Math.round(provider.rating)}
                            className="text-sm mr-2"
                          />
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
                      </div>
                    </Col>

                    <Col xs={24} sm={6} md={8} className="text-right">
                      <div className="mb-4">
                        <span className="text-3xl font-bold text-green-400">
                          ${provider.basePrice}
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
                        onClick={() => createAndNavigateToConversation(provider?.user?._id)}
                      >
                        Quick Message
                      </Button>
                    </Col>
                  </Row>
                </Card>
              )}
            />
          )}

          <Button
            size="large"
            onClick={() => setCurrentStep(0)}
            className="border-gray-600 text-gray-300 hover:border-blue-400 hover:text-blue-400"
            icon={<ArrowLeft size={16} />}
          >
            Back
          </Button>
          {providers.length > 0 && (
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
      ),
    },
  ];

  return (
    <ClientLayout>
      <div className="min-h-screen bg-black">
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
    </ClientLayout>
  );
};

export default ClientBooking;
