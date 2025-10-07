import React, { useState, useEffect } from "react";
import {
  Layout,
  Card,
  Typography,
  Row,
  Col,
  Statistic,
  Table,
  Tag,
  Button,
  Space,
  Avatar,
  Modal,
  message,
  Spin,
  Divider,
} from "antd";
import {
  DollarSign,
  Users,
  TrendingUp,
  Activity,
  Settings,
  Bell,
  Shield,
  Eye,
  Ban,
  CheckCircle,
  AlertTriangle,
  HelpCircle,
} from "lucide-react";

import AdminLayout from "../../components/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../../context/admin/AdminContext";

const { Title, Paragraph } = Typography;

const AdminDashboard = () => {
  const navigate = useNavigate();
  const {
    loading,
    stats,
    providers,
    bookings,
    payments,
    fetchStats,
    fetchProviders,
    fetchBookings,
    fetchPayments,
  } = useAdmin();

  const [selectedProvider, setSelectedProvider] = useState(null);

  useEffect(() => {
    // Fetch all necessary data when component mounts
    const fetchDashboardData = async () => {
      try {
        await Promise.all([
          fetchStats(),
          fetchProviders({ limit: 5, page: 1 }), // Get recent providers
          fetchBookings({ limit: 5, page: 1 }), // Get recent bookings
          fetchPayments({ limit: 5, page: 1 }), // Get recent payments
        ]);
      } catch (error) {
        message.error("Failed to load dashboard data");
      }
    };

    fetchDashboardData();
  }, []);

  // Format platform stats from API data
  const getPlatformStats = () => {
    if (!stats) {
      return [
        { title: "Total Revenue", value: 0, prefix: "$", color: "#22C55E" },
        { title: "Active Providers", value: 0, color: "#3B82F6" },
        { title: "Total Bookings", value: 0, color: "#F59E0B" },
        { title: "Growth Rate", value: 0, suffix: "%", color: "#8B5CF6" },
      ];
    }

    return [
      {
        title: "Total Revenue",
        value: stats.totalRevenue || 0,
        prefix: "$",
        color: "#22C55E",
      },
      {
        title: "Active Providers",
        value: stats.activeProviders || 0,
        color: "#3B82F6",
      },
      {
        title: "Total Bookings",
        value: stats.totalBookings || 0,
        color: "#F59E0B",
      },
      {
        title: "Growth Rate",
        value: stats.growthRate || 0,
        suffix: "%",
        color: "#8B5CF6",
      },
    ];
  };

  // Format providers data for table
  const getFormattedProviders = () => {
    if (!providers || !Array.isArray(providers)) return [];

    return providers.map((provider, index) => ({
      key: provider._id || index,
      name:
        provider.businessName ||
        provider.user?.firstName + " " + provider.user?.lastName,
      email: provider.user?.email || "No email",
      category: provider.category || "Uncategorized",
      joinDate: new Date(provider.createdAt).toLocaleDateString() || "Unknown",
      status: getProviderStatus(provider),
      subscription: provider?.user?.subscriptionPlan,
      lastActive: provider.user?.lastLogin
        ? new Date(provider.user.lastLogin).toLocaleDateString()
        : "Unknown",
      provider: provider, // Store full provider object for actions
    }));
  };

  const getProviderStatus = (provider) => {
    if (!provider.user.isActive) return "disabled";
    return "active";
  };

  const getActionButtons = (record) => {
    const provider = record.provider;

    if (record.status === "active") {
      return (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => navigate(`/admin/providers/${provider._id}`)}
          >
            View
          </Button>
        </Space>
      );
    } else if (record.status === "disabled" || record.status === "blocked") {
      return (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => navigate(`/admin/providers/${provider._id}`)}
          >
            View
          </Button>
        </Space>
      );
    } else {
      return (
        <Space>
          <Button
            size="small"
            icon={<Eye size={14} />}
            onClick={() => navigate(`/admin/providers/${provider._id}`)}
          >
            View
          </Button>
        </Space>
      );
    }
  };

  const columns = [
    {
      title: "Provider",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar style={{ backgroundColor: "#3B82F6", marginRight: 12 }}>
            {text
              .split(" ")
              .map((n) => n[0])
              .join("")}
          </Avatar>
          <div>
            <div className="text-white">{text}</div>
            <div className="text-gray-400 text-sm">{record.email}</div>
            <div className="text-gray-500 text-xs">
              Last active: {record.lastActive}
            </div>
          </div>
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
      title: "Join Date",
      dataIndex: "joinDate",
      key: "joinDate",
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
          active: { color: "green", icon: <CheckCircle size={14} /> },
          pending: { color: "orange", icon: <AlertTriangle size={14} /> },
          disabled: { color: "red", icon: <Ban size={14} /> },
          blocked: { color: "volcano", icon: <Shield size={14} /> },
        };
        const { color, icon } = config[status] || config.pending;

        return (
          <Tag color={color} className="flex items-center gap-1">
            {icon}
            <span>{status.toUpperCase()}</span>
          </Tag>
        );
      },
    },
    {
      title: "Subscription",
      dataIndex: "subscription",
      key: "subscription",
      render: (sub) => <span className="text-gray-300">{sub}</span>,
    },
  ];

  const platformStats = getPlatformStats();
  const formattedProviders = getFormattedProviders();

  if (loading && !stats) {
    return (
      <AdminLayout>
        <div className="min-h-screen bg-black flex items-center justify-center">
          <Spin size="large" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="min-h-screen bg-black">
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <div>
              <Title level={2} className="text-white mb-2">
                Admin Dashboard
              </Title>
              <Paragraph className="text-gray-400">
                Platform overview and account management
              </Paragraph>
            </div>
            <Space>
              <Button
                icon={<HelpCircle size={16} />}
                className="border-gray-600 hover-lift"
                onClick={() => navigate("/admin/docs")}
              >
                Help Center
              </Button>
              <Button
                icon={<Shield size={16} />}
                className="border-gray-600 hover-lift"
                onClick={() => navigate("/admin/security")}
              >
                Security Center
              </Button>
              <Button
                icon={<Bell size={16} />}
                className="border-gray-600 hover-lift"
                onClick={() => {
                  navigate("/admin/notifications");
                }}
              >
                Notifications
              </Button>
              <Button
                type="primary"
                icon={<Settings size={16} />}
                className="glow-button"
                onClick={() => {
                  navigate("/admin/platform-settings");
                }}
              >
                Platform Settings
              </Button>
            </Space>
          </div>
          {/* Platform Stats */}
          <Row gutter={[24, 24]} className="mb-8">
            {platformStats.map((stat, index) => (
              <Col xs={24} sm={12} lg={6} key={index}>
                <Card className="hover-lift glow-border">
                  <Statistic
                    title={stat.title}
                    value={stat.value}
                    prefix={stat.prefix}
                    suffix={stat.suffix}
                    valueStyle={{ color: stat.color }}
                    loading={loading}
                  />
                </Card>
              </Col>
            ))}
          </Row>
          <Row gutter={[24, 24]}>
            {/* Recent Providers with Enhanced Controls */}
            <Col xs={24} lg={16}>
              <Card
                title="Provider Account Management"
                className="glow-border"
                extra={
                  <Button
                    type="link"
                    onClick={() => navigate("/admin/providers")}
                  >
                    View All Providers
                  </Button>
                }
              >
                <Table
                  dataSource={formattedProviders}
                  columns={columns}
                  pagination={false}
                  className="bg-transparent"
                  scroll={{ x: 800 }}
                  loading={loading}
                  locale={{
                    emptyText: loading ? "Loading..." : "No providers found",
                  }}
                />
              </Card>
            </Col>

            {/* Quick Actions */}
            <Col xs={24} lg={8}>
              <Card title="Quick Actions" className="h-full glow-border">
                <Space direction="vertical" size="middle" className="w-full">
                  <Button
                    block
                    size="large"
                    icon={<Users size={16} />}
                    className="hover-lift"
                    onClick={() => {
                      navigate("/admin/providers");
                    }}
                  >
                    Manage Providers ({stats?.activeProviders || 0})
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<DollarSign size={16} />}
                    className="hover-lift"
                    onClick={() => {
                      navigate("/admin/payments");
                    }}
                  >
                    Payment Reports (${stats?.totalRevenue || 0})
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<TrendingUp size={16} />}
                    className="hover-lift"
                    onClick={() => {
                      navigate("/admin/analytics");
                    }}
                  >
                    Analytics
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<Settings size={16} />}
                    className="hover-lift"
                    onClick={() => {
                      navigate("/admin/platform-settings");
                    }}
                  >
                    Platform Settings
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<Shield size={16} />}
                    className="hover-lift"
                    onClick={() => navigate("/admin/security")}
                  >
                    Security Center
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
          {/* Recent Activity Section */}
          {bookings && bookings.length > 0 && (
            <Row gutter={[24, 24]} className="mt-8">
              <Col xs={24}>
                <Card
                  title={
                    <Title level={4} className="text-white">
                      Recent Activity
                    </Title>
                  }
                  className="bg-gray-800 border-gray-700 shadow-lg"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Recent Bookings */}
                      <div>
                        <Title level={5} className="text-white mb-4">
                          Recent Bookings
                        </Title>
                        {bookings
                          .filter(booking => booking && typeof booking === 'object')
                          .slice(0, 3)
                          .map((booking, index) => (
                            <div
                              key={index}
                              className="mb-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm"
                            >
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-white font-semibold text-md">
                                  {booking.client?.firstName || "Unknown"}{" "}
                                  {booking.client?.lastName || "Client"}
                                </span>
                                <Tag
                                  color="blue"
                                  className="uppercase text-xs font-medium"
                                >
                                  {booking.serviceCategory || "General"}
                                </Tag>
                              </div>
                              <div className="text-gray-400 text-sm mb-1">
                                Amount:{" "}
                                <span className="text-green-400 font-medium">
                                  ${booking.amount}
                                </span>
                              </div>
                              <div className="text-gray-500 text-xs">
                                {new Date(booking.createdAt).toLocaleDateString()}
                              </div>
                            </div>
                          ))}
                    </div>

                    {/* Recent Payments */}
                    <div>
                      <Title level={5} className="text-white mb-4">
                        Recent Payments
                      </Title>
                      {stats.recentPayments
                        ?.slice(0, 3)
                        .map((payment, index) => (
                          <div
                            key={index}
                            className="mb-4 p-4 bg-gray-900 rounded-lg hover:bg-gray-800 transition-all duration-300 shadow-sm"
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-white font-semibold text-md">
                                ${payment.platformFee || payment.amount}
                              </span>
                              <Tag
                                color={
                                  payment.status === "Completed"
                                    ? "green"
                                    : "red"
                                }
                                className="uppercase text-xs font-medium"
                              >
                                {payment.status}
                              </Tag>
                            </div>
                            <div className="text-gray-400 text-sm mb-1">
                              {payment.client.firstName}{" "}
                              {payment.client.lastName}
                            </div>
                            <div className="text-gray-500 text-xs">
                              {new Date(payment.createdAt).toLocaleDateString()}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
