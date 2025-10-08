import React, { useEffect, useState } from "react";
import {
  Card,
  Typography,
  Button,
  Row,
  Col,
  Rate,
  Tag,
  Form,
  Input,
  DatePicker,
  TimePicker,
  InputNumber,
  Space,
  Avatar,
  Divider,
  Image,
  message,
  Spin,
  Slider,
  Select
} from "antd";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Star
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useBooking } from "../../context/booking/BookingContext";
import { useAuth } from "../../context/AuthContext";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const PublicProviderPage = () => {
  const { id } = useParams();
  const { createAnonymousBooking, loading: bookingLoading } = useBooking();
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [budgetRange, setBudgetRange] = useState([0, 1500]);

  const {user}=useAuth();

  const baseUrl = import.meta.env.VITE_BASE_URL;

  useEffect(() => {
    const fetchProvider = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${baseUrl}/providers/provider/${id}`);
        const data = await res.json();
        if (res.ok) {
          setProvider(data.provider);
        } else {
          message.error(data.message || "Failed to fetch provider");
        }
      } catch (err) {
        console.error(err);
        message.error("Network error. Try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchProvider();
  }, [id, baseUrl]);

  const onFinish = async (values) => {
    if (!provider) return;

    // Format the booking payload to match backend expectations
    const bookingPayload = {
      providerId: provider.id || provider._id,
      serviceCategory: provider.category, // Use provider's category
      eventType: values.eventType, // Selected service from dropdown
      location: values.location,
      guests: values.guests || 50,
      dateStart: values.eventDate ? values.eventDate.format("YYYY-MM-DD") : null,
      dateEnd: values.eventDate ? values.eventDate.format("YYYY-MM-DD") : null,
      eventTime: values.eventTime ? values.eventTime.format("HH:mm") : "",
      duration: values.duration || 4,
      budgetMin: budgetRange[0],
      budgetMax: budgetRange[1],
      description: values.message || "",
      contactInfo: {
        phone: values.phone || "",
        email: values.email || "",
      },
    };

    const result = await createAnonymousBooking(bookingPayload);

    if (result.success) {
      message.success("Booking request sent successfully!");
    } else {
      message.error(result.error || "Booking failed.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black">
        <Spin size="large" />
      </div>
    );
  }

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Provider not found.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900/50 backdrop-blur border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="bestarz-logo">
              Best<span className="bestarz-star">★</span>rz
            </div>
         

            {
              !user && <Link to="/signup">
                <Button type="primary">Join Bestarz</Button>
              </Link>
            }

           
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        <Row gutter={[24, 24]}>
          {/* Provider Info */}
          <Col xs={24} lg={8}>
            <Card className="mb-6">
              <div className="text-center mb-6">
                <Avatar src={provider.user?.profileImage || provider.image} size={120} className="mb-4" />
                <div className="flex items-center justify-center mb-2">
                  <Title level={3} className="text-white mb-0 mr-2">{provider.businessName}</Title>
                  {provider.user?.isActive && <Tag color="green">VERIFIED</Tag>}
                </div>
                <Paragraph className="text-gray-400 mb-4">{provider.category}</Paragraph>
                <div className="flex items-center justify-center mb-4">
                  <Rate disabled defaultValue={Math.round(provider.rating)} className="text-sm mr-2" />
                  <span className="text-gray-400">({provider.reviews} reviews)</span>
                </div>
                <div className="text-center">
                  <span className="text-2xl font-bold text-white">${provider.basePrice}</span>
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
                  {provider.user?.phone || "N/A"}
                </div>
                <div className="flex items-center text-gray-300">
                  <Mail size={16} className="mr-2 text-gray-400" />
                  {provider.user?.email || "N/A"}
                </div>
                <div className="flex items-center text-gray-300">
                  <Globe size={16} className="mr-2 text-gray-400" />
                  {provider?.website || "N/A"}
                </div>
              </Space>
            </Card>

            {/* Services */}
            <Card title="Services Offered">
              <Space wrap>
                {provider.services?.map((service) => (
                  <Tag key={service} color="blue">{service}</Tag>
                ))}
              </Space>
            </Card>
          </Col>

          {/* Main Content */}
          <Col xs={24} lg={16}>
            {/* About */}
            <Card className="mb-6" title="About">
              <Paragraph className="text-gray-300">{provider.description}</Paragraph>
            </Card>

            {/* Portfolio */}
            {provider.portfolio?.length > 0 && (
              <Card className="mb-6" title="Portfolio">
                <Row gutter={[16, 16]}>
                  {provider.portfolio.map((image, index) => (
                    <Col xs={24} sm={8} key={index}>
                      <Image
                        src={image}
                        alt={`Portfolio ${index + 1}`}
                        className="rounded-lg"
                        style={{ width: "100%", height: "200px", objectFit: "cover" }}
                      />
                    </Col>
                  ))}
                </Row>
              </Card>
            )}

            {/* Booking Form */}
            <Card title="Request a Booking">
              <Form layout="vertical" onFinish={onFinish}>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Form.Item 
                      name="eventType" 
                      label="Select Service" 
                      rules={[{ required: true, message: "Please select a service!" }]}
                    >
                      <Select size="large" placeholder="Choose a service">
                        {provider.services?.map((service) => (
                          <Option key={service} value={service}>
                            {service}
                          </Option>
                        ))}
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="guests" label="Number of Guests">
                      <InputNumber size="large" className="w-full" min={1} placeholder="50" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="eventDate" label="Event Date" rules={[{ required: true, message: "Please select date!" }]}>
                      <DatePicker size="large" className="w-full" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="eventTime" label="Event Time" rules={[{ required: true, message: "Please select time!" }]}>
                      <TimePicker size="large" className="w-full" format="HH:mm" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="duration" label="Event Duration (hours)" rules={[{ required: true, message: "Please input duration!" }]}>
                      <InputNumber size="large" className="w-full" min={1} max={24} />
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item label={<span className="text-white">Budget Range</span>}>
                      <div className="px-4">
                        <Slider
                          range
                          min={0}
                          max={5000}
                          value={budgetRange}
                          onChange={setBudgetRange}
                          marks={{
                            0: { label: "$0", style: { color: "#9CA3AF" } },
                            1000: { label: "$1,000", style: { color: "#9CA3AF" } },
                            2500: { label: "$2,500", style: { color: "#9CA3AF" } },
                            5000: { label: "$5,000+", style: { color: "#9CA3AF" } },
                          }}
                          tooltip={{
                            formatter: (value) => `$${value}`,
                          }}
                        />
                      </div>
                      <div className="text-center mt-2 text-gray-400">
                        ${budgetRange[0]} - ${budgetRange[1]}
                      </div>
                    </Form.Item>
                  </Col>
                  <Col xs={24}>
                    <Form.Item name="location" label="Event Address">
                      <Input size="large" placeholder="Event Address" />
                    </Form.Item>
                  </Col>
             
                  <Col xs={24}>
                    <Form.Item name="message" label="Additional Details">
                      <TextArea rows={4} placeholder="Any special requests or info..." />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="phone" label="Phone" rules={[{ required: true, message: "Please provide your phone!" }]}>
                      <Input size="large" placeholder="Phone" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email', message: "Please provide valid email!" }]}>
                      <Input size="large" placeholder="Email" />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item className="text-center">
                  <Button type="primary" htmlType="submit" size="large" loading={bookingLoading}>
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