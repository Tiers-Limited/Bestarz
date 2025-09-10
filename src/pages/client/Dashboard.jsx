import React, { useState } from "react";
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
} from "antd";
import {
  Calendar,
  CreditCard,
  MessageCircle,
  HelpCircle,
  Settings,
  Star,
} from "lucide-react";
import ClientLayout from "../../components/ClientLayout"; // or create ClientLayout if needed
import { useNavigate } from "react-router-dom";

const { Title, Paragraph } = Typography;

const ClientDashboard = () => {
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventDrawerVisible, setEventDrawerVisible] = useState(false);
  const navigate = useNavigate();

  // Stats for client
  const clientStats = [
    { title: "Total Bookings", value: 12, color: "#3B82F6" },
    { title: "Upcoming Events", value: 3, color: "#22C55E" },
    { title: "Completed Events", value: 9, color: "#F59E0B" },
    { title: "Pending Payments", value: 1, color: "#EF4444" },
  ];

  // Client’s booked events
  const bookedEvents = [
    {
      key: "1",
      title: "Wedding Ceremony",
      provider: "Perfect Photos",
      date: "2025-09-20",
      status: "upcoming",
      category: "Photography",
    },
    {
      key: "2",
      title: "Corporate Gala Dinner",
      provider: "Elite Catering",
      date: "2025-08-15",
      status: "completed",
      category: "Catering",
    },
    {
      key: "3",
      title: "Birthday DJ Party",
      provider: "DJ Master",
      date: "2025-07-12",
      status: "completed",
      category: "Music/DJ",
    },
  ];

  const columns = [
    {
      title: "Event",
      dataIndex: "title",
      key: "title",
      render: (text, record) => (
        <div>
          <div className="text-white">{text}</div>
          <div className="text-gray-400 text-sm">By {record.provider}</div>
        </div>
      ),
    },
    {
      title: "Category",
      dataIndex: "category",
      key: "category",
      render: (category) => <span className="text-gray-300">{category}</span>,
    },
    {
      title: "Date",
      dataIndex: "date",
      key: "date",
      render: (date) => (
        <span className="text-gray-300 whitespace-nowrap">{date}</span>
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
        };
        const { color, label } = config[status] || {};
        return <Tag color={color}>{label}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button
            size="small"
            onClick={() => {
              setSelectedEvent(record);
              setEventDrawerVisible(true);
            }}
          >
            View
          </Button>
          {record.status === "completed" && (
            <Button
              size="small"
              type="primary"
              icon={<Star size={14} />}
              onClick={() => message.success("Thanks for your feedback!")}
            >
              Review
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
                onClick={() => navigate('/client/docs')}
              >
                Help
              </Button>
              <Button
                icon={<Settings size={16} />}
                className="border-gray-600 hover-lift"
                onClick={() => navigate('/client/settings')}
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
            {/* Booked Events */}
            <Col xs={24} lg={16}>
              <Card
                title="My Events"
                className="glow-border"
                extra={<Button type="link">View All</Button>}
              >
                <Table
                  dataSource={bookedEvents}
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
                  <Button onClick={()=>{navigate('/client/booking')}} block size="large" icon={<Calendar size={16} />}>
                    Book New Event
                  </Button>
                  <Button onClick={()=>{navigate('/client/payments')}} block size="large" icon={<CreditCard size={16} />}>
                    Payments & Invoices
                  </Button>
                  <Button onClick={()=>{navigate('/client/support')}} block size="large" icon={<MessageCircle size={16} />}>
                    Contact Support
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Event Details Drawer */}
        <Drawer
          title={`Event Details - ${selectedEvent?.title}`}
          placement="right"
          size="large"
          onClose={() => setEventDrawerVisible(false)}
          open={eventDrawerVisible}
          className="bg-black"
        >
          {selectedEvent ? (
            <div>
              <Paragraph className="text-gray-300">
                <strong>Provider:</strong> {selectedEvent.provider}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Category:</strong> {selectedEvent.category}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Date:</strong> {selectedEvent.date}
              </Paragraph>
              <Paragraph className="text-gray-300">
                <strong>Status:</strong>{" "}
                <Tag color="blue">{selectedEvent.status}</Tag>
              </Paragraph>
            </div>
          ) : (
            <Paragraph className="text-gray-400">No event selected</Paragraph>
          )}
        </Drawer>
      </div>
    </ClientLayout>
  );
};

export default ClientDashboard;
