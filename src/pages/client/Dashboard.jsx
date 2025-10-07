import React, { useState, useEffect } from "react";
import {
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Drawer,
  message,
  Modal,
  Form,
  Input,
  Spin,
  Rate,
} from "antd";
import {
  Calendar,
  CreditCard,
  MessageCircle,
  HelpCircle,
  Settings,
  Star,
  Send,
} from "lucide-react";
import ClientLayout from "../../components/ClientLayout";
import { useNavigate } from "react-router-dom";
import { useClient } from "../../context/client/ClientContext";
import ClientReviewModal from "../../components/ClientReviewModal";
import PaymentButton from "../../components/PaymentButton";
import { useCreateConversation } from "../../hooks/useCreateConversation";

const { Title, Paragraph } = Typography;
const { TextArea } = Input;

const ClientDashboard = () => {
  const navigate = useNavigate();
  const {
    dashboardData,
    loading,
    fetchDashboard,
    createReview,
    sendSupportRequest,
  } = useClient();


  const { createAndNavigateToAdminConversation } = useCreateConversation();

  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDrawerVisible, setEventDrawerVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const [supportForm] = Form.useForm();
  const [reviewForm] = Form.useForm();

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Handle support request submission
  const handleSupportSubmit = async (values) => {
    const result = await sendSupportRequest({
      name: values.name,
      email: values.email,
      message: values.message,
    });

    if (result.success) {
      message.success("Support request sent successfully!");
      setSupportModalVisible(false);
      supportForm.resetFields();
    } else {
      message.error(result.error || "Failed to send support request");
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (values) => {
    if (!selectedBooking) return;

    const result = await createReview({
      bookingId: selectedBooking._id,
      rating: values.rating,
      comment: values.comment,
    });

    if (result.success) {
      message.success("Review submitted successfully!");
      setReviewModalVisible(false);
      setSelectedBooking(null);
      reviewForm.resetFields();
      // Refresh dashboard to update booking status
      fetchDashboard();
    } else {
      message.error(result.error || "Failed to submit review");
    }
  };

  // Open review modal
  const openReviewModal = (booking) => {
    setSelectedBooking(booking);
    setReviewModalVisible(true);
    reviewForm.setFieldsValue({
      rating: 5,
      comment: "",
    });
  };

  if (loading && !dashboardData) {
    return (
      <ClientLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Spin size="large" />
        </div>
      </ClientLayout>
    );
  }

  const stats = dashboardData?.stats;
  const recentBookings = dashboardData?.recentBookings || [];
  const upcomingEvents = dashboardData?.upcomingEvents || [];

  // Stats for dashboard
  const clientStats = [
    {
      title: "Total Bookings",
      value: stats?.totalBookings || 0,
      color: "#3B82F6",
    },
    {
      title: "Upcoming Events",
      value: stats?.upcomingBookings || 0,
      color: "#22C55E",
    },
    {
      title: "Completed Events",
      value: stats?.completedBookings || 0,
      color: "#F59E0B",
    },
    {
      title: "Pending Payments",
      value: stats?.pendingPayments || 0,
      color: "#EF4444",
    },
  ];

  const columns = [
    {
      title: "Event",
      dataIndex: "eventType",
      key: "eventType",
      render: (text, record) => (
        <div>
          <div className="text-white">{text}</div>
          <div className="text-gray-400 text-sm">
            By {record.provider?.businessName || "N/A"}
          </div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "serviceCategory",
      key: "serviceCategory",
      render: (category) => <span className="text-gray-300">{category}</span>,
    },
    {
      title: "Date",
      dataIndex: "dateStart",
      key: "dateStart",
      render: (date) => (
        <span className="text-gray-300 whitespace-nowrap">
          {new Date(date).toLocaleDateString()}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          upcoming: { color: "blue", label: "Upcoming" },
          completed: { color: "green", label: "Completed" },
          cancelled: { color: "red", label: "Cancelled" },
          pending: { color: "orange", label: "Pending" },
        };
        const { color, label } = config[status] || {
          color: "default",
          label: status,
        };
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space wrap>
          <Button
            size="small"
            onClick={() => {
              setSelectedEvent(record);
              setEventDrawerVisible(true);
            }}
          >
            View
          </Button>
          {/* Payment buttons for advance and final payments */}
          {record.status === "ACCEPTED" && record.paymentStatus === "advance_pending" && (
            <PaymentButton 
              booking={record} 
              paymentType="advance" 
              size="small" 
            />
          )}
          {record.paymentStatus === "final_pending" && (
            <PaymentButton 
              booking={record} 
              paymentType="final" 
              size="small" 
            />
          )}
          {record.status === "COMPLETED" && !record.hasReview && (
            <Button
              size="small"
              type="primary"
              icon={<Star size={14} />}
              onClick={() => openReviewModal(record)}
            >
              Review
            </Button>
          )}
          {record.hasReview && (
            <Button
              size="small"
              disabled
              icon={<Star size={14} />}
            >
              Reviewed
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <ClientLayout>
      <div className="min-h-screen bg-black">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <div>
              <Title level={2} className="text-white mb-2">
                My Dashboard
              </Title>
              <Paragraph className="text-gray-400">
                Track your bookings and manage your events
              </Paragraph>
            </div>
            <Space>
              <Button
                icon={<HelpCircle size={16} />}
                className="border-gray-600 hover-lift"
                onClick={() => navigate("/client/docs")}
              >
                Help
              </Button>
              <Button
                icon={<Settings size={16} />}
                className="border-gray-600 hover-lift"
                onClick={() => navigate("/client/settings")}
              >
                Account Settings
              </Button>
            </Space>
          </div>

          {/* Stats */}
          <Row gutter={[24, 24]} className="mb-8">
            {clientStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="hover-lift glow-border">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    valueStyle={{ color: stat.color }}
                  />
                </Card>
              </Col>
            ))}
          </Row>

          <Row gutter={[24, 24]}>
            {/* Recent Bookings */}
            <Col xs={24} lg={16}>
              <Card
                title="My Recent Bookings"
                className="glow-border"
                extra={<Button type="link">View All</Button>}
              >
                <Table
                  dataSource={recentBookings}
                  columns={columns}
                  pagination={false}
                  className="bg-transparent"
                  scroll={{ x: 800 }}
                />
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24} lg={8}>
              <Card title="Quick Actions" className="h-full glow-border">
                <Space direction="vertical" size="middle" className="w-full">
                  <Button
                    onClick={() => navigate("/client/booking")}
                    block
                    size="large"
                    icon={<Calendar size={16} />}
                  >
                    Book New Event
                  </Button>
                  <Button
                    onClick={() => navigate("/client/payments")}
                    block
                    size="large"
                    icon={<CreditCard size={16} />}
                  >
                    Payments & Invoices
                  </Button>
                  <Button
                    onClick={() => setSupportModalVisible(true)}
                    block
                    size="large"
                    icon={<MessageCircle size={16} />}
                  >
                    Contact Support
                  </Button>

                  <Button
                   
                    block
                    size="large"
                    icon={<MessageCircle size={16} />}

                    onClick={() => createAndNavigateToAdminConversation()}
                  >
                    Contact Admin
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Event Details Drawer */}
        <Drawer
          title={`Event Details - ${selectedEvent?.eventType}`}
          placement="right"
          size="large"
          onClose={() => setEventDrawerVisible(false)}
          open={eventDrawerVisible}
          className="bg-black"
        >
          {selectedEvent ? (
            <div>
              <Paragraph className="text-gray-300">
                <strong>Provider:</strong>{" "}
                {selectedEvent.provider?.businessName || "N/A"}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Category:</strong> {selectedEvent.serviceCategory}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Date:</strong>{" "}
                {new Date(selectedEvent.dateStart).toLocaleDateString()}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Guests:</strong> {selectedEvent.guests}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Amount:</strong> ${selectedEvent.amount}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Status:</strong>{" "}
                <Tag color="blue">{selectedEvent.status}</Tag>
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Description:</strong> {selectedEvent.description}
              </Paragraph>
            </div>
          ) : (
            <Paragraph className="text-gray-400">No event selected</Paragraph>
          )}
        </Drawer>

        {/* Support Modal */}
        <Modal
          title={
            <span className="flex items-center gap-2">
              <MessageCircle size={20} />
              Contact Support
            </span>
          }
          open={supportModalVisible}
          onCancel={() => setSupportModalVisible(false)}
          footer={null}
          width={600}
        >
          <Form
            form={supportForm}
            layout="vertical"
            onFinish={handleSupportSubmit}
          >
            <Form.Item
              label="Your Name"
              name="name"
              rules={[{ required: true, message: "Please enter your name" }]}
            >
              <Input placeholder="Enter your full name" />
            </Form.Item>

            <Form.Item
              label="Email Address"
              name="email"
              rules={[
                { required: true, message: "Please enter your email" },
                { type: "email", message: "Please enter a valid email" },
              ]}
            >
              <Input placeholder="Enter your email address" />
            </Form.Item>

            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: "Please enter your message" }]}
            >
              <TextArea
                rows={6}
                placeholder="Describe your issue or question in detail..."
              />
            </Form.Item>

            <div className="flex justify-end gap-2">
              <Button onClick={() => setSupportModalVisible(false)}>
                Cancel
              </Button>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<Send size={16} />}
              >
                Send Request
              </Button>
            </div>
          </Form>
        </Modal>

        {/* Review Modal */}
        <ClientReviewModal
          visible={reviewModalVisible}
          onClose={() => {
            setReviewModalVisible(false);
            setSelectedBooking(null);
          }}
          booking={selectedBooking}
          loading={loading}
          onSubmit={handleReviewSubmit}
        />
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
