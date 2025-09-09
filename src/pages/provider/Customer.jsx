import React, { useState } from "react";
import {
  Card,
  Typography,
  Table,
  Button,
  Input,
  Space,
  Avatar,
  Tag,
  Tabs,
  Timeline,
  Modal,
  Form,
  Rate,
} from "antd";
import {
  Search,
  MessageCircle,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  Star,
  Plus,
  Eye,
} from "lucide-react";
import ProviderLayout from "../../components/ProviderLayout";

const { Title, Paragraph } = Typography;

const ProviderCustomers = () => {
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [noteModalVisible, setNoteModalVisible] = useState(false);

  const customers = [
    {
      key: "1",
      name: "Sarah Johnson",
      email: "sarah.johnson@email.com",
      phone: "+1 (555) 234-5678",
      totalBookings: 3,
      totalSpent: 3200,
      lastBooking: "2025-01-15",
      status: "active",
      rating: 5,
      joinDate: "2024-08-15",
      timeline: [
        {
          date: "2025-01-15",
          event: "Wedding DJ Service",
          amount: "$1,200",
          status: "completed",
          notes: "Amazing service, very professional!",
        },
        {
          date: "2024-12-10",
          event: "Anniversary Party",
          amount: "$900",
          status: "completed",
          notes: "Great music selection, guests loved it",
        },
        {
          date: "2024-08-20",
          event: "Birthday Party",
          amount: "$650",
          status: "completed",
          notes: "First booking, exceeded expectations",
        },
      ],
      notes: [
        {
          date: "2025-01-16",
          note: "Client mentioned they have another wedding coming up in June",
          type: "business",
        },
        {
          date: "2025-01-10",
          note: "Prefers classic rock and 80s music for events",
          type: "preference",
        },
      ],
    },
    {
      key: "2",
      name: "Mike Chen",
      email: "mike.chen@company.com",
      phone: "+1 (555) 987-6543",
      totalBookings: 2,
      totalSpent: 1600,
      lastBooking: "2025-01-18",
      status: "active",
      rating: 4.5,
      joinDate: "2024-11-20",
      timeline: [
        {
          date: "2025-01-18",
          event: "Corporate Event",
          amount: "$800",
          status: "pending",
          notes: "Looking forward to professional background music",
        },
        {
          date: "2024-12-05",
          event: "Office Holiday Party",
          amount: "$800",
          status: "completed",
          notes: "Great job on the holiday playlist",
        },
      ],
      notes: [
        {
          date: "2024-12-06",
          note: "Works for tech company, books annual events",
          type: "business",
        },
      ],
    },
    {
      key: "3",
      name: "Emily Davis",
      email: "emily.davis@email.com",
      phone: "+1 (555) 345-6789",
      totalBookings: 1,
      totalSpent: 600,
      lastBooking: "2025-01-22",
      status: "new",
      rating: null,
      joinDate: "2025-01-20",
      timeline: [
        {
          date: "2025-01-22",
          event: "Birthday Party",
          amount: "$600",
          status: "confirmed",
          notes: "Looking for pop and hip-hop music",
        },
      ],
      notes: [],
    },
  ];

  const columns = [
    {
      title: "Customer",
      key: "customer",
      render: (_, record) => (
        <div className="flex items-center">
          <Avatar style={{ backgroundColor: "#3B82F6", marginRight: 12 }}>
            {record.name
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div className="text-white font-semibold">{record.name}</div>
            <div className="text-gray-400 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, record) => (
        <div>
          <div className="text-gray-300 text-sm">{record.phone}</div>
          <div className="text-gray-400 text-xs">
            Customer since {new Date(record.joinDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      title: "Bookings",
      dataIndex: "totalBookings",
      key: "bookings",
      render: (bookings) => (
        <div className="text-center">
          <div className="text-white font-semibold">{bookings}</div>
          <div className="text-gray-400 text-xs">total</div>
        </div>
      ),
    },
    {
      title: "Revenue",
      dataIndex: "totalSpent",
      key: "revenue",
      render: (amount) => (
        <div className="text-center">
          <div className="text-green-400 font-bold">${amount}</div>
          <div className="text-gray-400 text-xs">lifetime</div>
        </div>
      ),
    },
    {
      title: "Rating",
      dataIndex: "rating",
      key: "rating",
      render: (rating) => (
        <div className="text-center">
          {rating ? (
            <>
              <Rate
                disabled
                defaultValue={rating}
                className="rating-glow text-sm"
              />
              <div className="text-yellow-400 text-xs">{rating}/5</div>
            </>
          ) : (
            <div className="text-gray-400 text-sm">No rating yet</div>
          )}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const config = {
          active: { color: "green", text: "Active" },
          new: { color: "blue", text: "New Customer" },
          inactive: { color: "gray", text: "Inactive" },
        };
        const { color, text } = config[status] || config.active;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="small">
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => setSelectedCustomer(record)}
            className="hover-lift"
          >
            View
          </Button>
          <Button
            size="small"
            icon={<MessageCircle size={14} />}
            className="hover-lift"
          >
            Message
          </Button>
        </Space>
      ),
    },
  ];

  const tabItems = [
    {
      key: "all",
      label: `All Customers (${customers.length})`,
      children: (
        <Table
          dataSource={customers}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      ),
    },
    {
      key: "active",
      label: `Active (${
        customers.filter((c) => c.status === "active").length
      })`,
      children: (
        <Table
          dataSource={customers.filter((c) => c.status === "active")}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      ),
    },
    {
      key: "new",
      label: `New (${customers.filter((c) => c.status === "new").length})`,
      children: (
        <Table
          dataSource={customers.filter((c) => c.status === "new")}
          columns={columns}
          pagination={{ pageSize: 10 }}
          scroll={{ x: 800 }}
        />
      ),
    },
  ];

  return (
    <ProviderLayout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <Title level={2} className="text-white mb-2">
              Customer Management
            </Title>
            <Paragraph className="text-gray-400">
              Manage your client relationships, track booking history, and build
              lasting connections
            </Paragraph>
          </div>
          <Space>
            <Button
              icon={<Plus size={16} />}
              className="border-gray-600 hover:border-blue-400 hover:text-blue-400"
            >
              Add Customer
            </Button>
          </Space>
        </div>

        {/* Search and Filters */}
        <Card className="mb-6 glow-border">
          <div className="flex items-center justify-between">
            <Input
              size="large"
              prefix={<Search size={16} />}
              placeholder="Search customers by name, email, or phone..."
              className="max-w-md"
            />
            <Space>
              <Button className="hover-lift">Export List</Button>
              
            </Space>
          </div>
        </Card>

        {/* Customer List */}
        <Card title="Customer Database" className="glow-border">
          <Tabs items={tabItems} />
        </Card>

        {/* Customer Detail Modal */}
        <Modal
          title={
            selectedCustomer
              ? `${selectedCustomer.name} - Customer Details`
              : ""
          }
          open={!!selectedCustomer}
          onCancel={() => setSelectedCustomer(null)}
          footer={null}
          width={800}
        >
          {selectedCustomer && (
            <div>
              <div className="flex items-center mb-6">
                <Avatar
                  size={64}
                  style={{ backgroundColor: "#3B82F6", marginRight: 16 }}
                >
                  {selectedCustomer.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </Avatar>
                <div className="flex-1">
                  <Title level={4} className="text-white mb-1">
                    {selectedCustomer.name}
                  </Title>
                  <Space size="large" className="mb-2">
                    <span className="text-gray-400 flex items-center">
                      <Mail size={14} className="mr-1" />
                      {selectedCustomer.email}
                    </span>
                    <span className="text-gray-400 flex items-center">
                      <Phone size={14} className="mr-1" />
                      {selectedCustomer.phone}
                    </span>
                  </Space>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-4">
                      <div className="trust-badge flex items-center gap-1">
                        <DollarSign size={14} />
                        <span>${selectedCustomer.totalSpent} total</span>
                      </div>
                      <div className="trust-badge flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{selectedCustomer.totalBookings} bookings</span>
                      </div>
                    </div>

                    {selectedCustomer.rating && (
                      <div className="trust-badge">
                        <Star size={14} className="mr-1" />
                        {selectedCustomer.rating}/5 rating
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <Tabs
                items={[
                  {
                    key: "timeline",
                    label: "Booking History",
                    children: (
                      <Timeline
                        items={selectedCustomer.timeline.map((item, index) => ({
                          dot:
                            item.status === "completed" ? (
                              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                            ) : item.status === "pending" ? (
                              <div className="w-3 h-3 bg-orange-400 rounded-full"></div>
                            ) : (
                              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                            ),
                          children: (
                            <div key={index}>
                              <div className="flex justify-between items-start mb-2">
                                <div>
                                  <Title level={5} className="text-white mb-1">
                                    {item.event}
                                  </Title>
                                  <div className="text-gray-400 text-sm mb-2">
                                    {item.date}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-green-400 font-bold">
                                    {item.amount}
                                  </div>
                                  <Tag
                                    color={
                                      item.status === "completed"
                                        ? "green"
                                        : item.status === "pending"
                                        ? "orange"
                                        : "blue"
                                    }
                                  >
                                    {item.status}
                                  </Tag>
                                </div>
                              </div>
                              {item.notes && (
                                <div className="bg-gray-800 p-3 rounded text-gray-300 text-sm">
                                  "{item.notes}"
                                </div>
                              )}
                            </div>
                          ),
                        }))}
                      />
                    ),
                  },
                  {
                    key: "notes",
                    label: "Notes & Preferences",
                    children: (
                      <div>
                        <div className="flex justify-between items-center mb-4">
                          <Title level={5} className="text-white">
                            Customer Notes
                          </Title>
                          <Button
                            type="primary"
                            icon={<Plus size={16} />}
                            onClick={() => setNoteModalVisible(true)}
                            className="glow-button"
                          >
                            Add Note
                          </Button>
                        </div>

                        {selectedCustomer.notes.length > 0 ? (
                          <div className="space-y-4">
                            {selectedCustomer.notes.map((note, index) => (
                              <Card
                                key={index}
                                size="small"
                                className="bg-gray-800 border-gray-600"
                              >
                                <div className="flex justify-between items-start">
                                  <div className="flex-1">
                                    <Paragraph className="text-gray-300 mb-1">
                                      {note.note}
                                    </Paragraph>
                                    <div className="flex items-center space-x-2">
                                      <span className="text-gray-500 text-xs">
                                        {note.date}
                                      </span>
                                      <Tag
                                        color={
                                          note.type === "business"
                                            ? "blue"
                                            : "purple"
                                        }
                                        size="small"
                                      >
                                        {note.type}
                                      </Tag>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-8">
                            <Paragraph className="text-gray-400">
                              No notes yet. Add notes to track customer
                              preferences and important information.
                            </Paragraph>
                          </div>
                        )}
                      </div>
                    ),
                  },
                ]}
              />
            </div>
          )}
        </Modal>

        {/* Add Note Modal */}
        <Modal
          title="Add Customer Note"
          open={noteModalVisible}
          onCancel={() => setNoteModalVisible(false)}
          footer={null}
        >
          <Form layout="vertical">
            <Form.Item name="note" label="Note" required>
              <Input
                rows={4}
                placeholder="Enter customer preferences, special requirements, or important information..."
              />
            </Form.Item>
            <Form.Item name="type" label="Note Type" required>
              <Space>
                <Button>Business</Button>
                <Button>Preference</Button>
                <Button>Personal</Button>
              </Space>
            </Form.Item>
            <div className="text-center">
              <Space>
                <Button onClick={() => setNoteModalVisible(false)}>
                  Cancel
                </Button>
                <Button type="primary" className="glow-button">
                  Save Note
                </Button>
              </Space>
            </div>
          </Form>
        </Modal>
      </div>
    </ProviderLayout>
  );
};

export default ProviderCustomers;
