import React, { useState } from "react";
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
  Drawer,
  List,
  Timeline,
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

const { Title, Paragraph } = Typography;

const AdminDashboard = () => {
  const [auditLogVisible, setAuditLogVisible] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState(null);

  const platformStats = [
    { title: "Total Revenue", value: 125680, prefix: "$", color: "#22C55E" },
    { title: "Active Providers", value: 1247, color: "#3B82F6" },
    { title: "Total Bookings", value: 5832, color: "#F59E0B" },
    { title: "Growth Rate", value: 23.5, suffix: "%", color: "#8B5CF6" },
  ];

  const [recentProviders, setRecentProviders] = useState([
    {
      key: "1",
      name: "DJ Master",
      email: "djmaster@example.com",
      category: "DJ & Music",
      joinDate: "2025-01-10",
      status: "active",
      subscription: "Professional",
      lastActive: "2 hours ago",
    },
    {
      key: "2",
      name: "Elite Catering",
      email: "info@elitecatering.com",
      category: "Catering",
      joinDate: "2025-01-08",
      status: "pending",
      subscription: "Starter",
      lastActive: "1 day ago",
    },
    {
      key: "3",
      name: "Perfect Photos",
      email: "contact@perfectphotos.com",
      category: "Photography",
      joinDate: "2025-01-05",
      status: "disabled",
      subscription: "Enterprise",
      lastActive: "3 days ago",
    },
  ]);

  const auditLogs = [
    {
      id: 1,
      action: "Account Disabled",
      target: "Perfect Photos",
      reason: "Customer complaint - unprofessional behavior",
      admin: "Admin",
      timestamp: "2025-01-08 14:30",
      type: "disable",
    },
    {
      id: 2,
      action: "Account Restored",
      target: "Sound Waves DJ",
      reason: "Issue resolved after provider training",
      admin: "Admin",
      timestamp: "2025-01-07 09:15",
      type: "restore",
    },
    {
      id: 3,
      action: "Account Blocked",
      target: "Fake Photography Co",
      reason: "Security threat - fraudulent documents",
      admin: "Admin",
      timestamp: "2025-01-06 16:45",
      type: "block",
    },
  ];

  const handleBlockAccount = (provider) => {
    Modal.confirm({
      title: `Block ${provider.name}?`,
      content: `This will immediately block ${provider.name} from accessing their account and receiving new bookings. This action is for security threats.`,
      okText: "Block Account",
      okType: "danger",
      onOk() {
        const updatedProviders = recentProviders.map((p) =>
          p.key === provider.key ? { ...p, status: "blocked" } : p
        );
        setRecentProviders(updatedProviders);
        message.success(`${provider.name} has been blocked`);

        // Add to audit log
        const newLog = {
          id: Date.now(),
          action: "Account Blocked",
          target: provider.name,
          reason: "Manual block by admin",
          admin: "Admin",
          timestamp: new Date().toLocaleString(),
          type: "block",
        };
        auditLogs.unshift(newLog);
      },
    });
  };

  const handleDisableAccount = (provider) => {
    Modal.confirm({
      title: <span className="text-white">{`Disable ${provider.name}?`}</span>,
      content: (
        <span className="text-white">{`This will disable ${provider.name}'s account for customer service or policy violations. They can potentially be restored later.`}</span>
      ),
      okText: "Disable Account",
      okType: "danger",
      onOk() {
        const updatedProviders = recentProviders.map((p) =>
          p.key === provider.key ? { ...p, status: "disabled" } : p
        );
        setRecentProviders(updatedProviders);
        message.success(`${provider.name} has been disabled`);

        // Add to audit log
        const newLog = {
          id: Date.now(),
          action: "Account Disabled",
          target: provider.name,
          reason: "Customer service action",
          admin: "Admin",
          timestamp: new Date().toLocaleString(),
          type: "disable",
        };
        auditLogs.unshift(newLog);
      },
    });
  };

  const handleRestoreAccount = (provider) => {
    Modal.confirm({
      title: <span className="text-white">{`Restore ${provider.name}?`}</span>,
      content: (
        <span className="text-white">{`This will restore ${provider.name}'s account and allow them to receive bookings again.`}</span>
      ),
      okText: "Restore Account",
      onOk() {
        const updatedProviders = recentProviders.map((p) =>
          p.key === provider.key ? { ...p, status: "active" } : p
        );
        setRecentProviders(updatedProviders);
        message.success(`${provider.name} has been restored`);

        // Add to audit log
        const newLog = {
          id: Date.now(),
          action: "Account Restored",
          target: provider.name,
          reason: "Issue resolved",
          admin: "Admin",
          timestamp: new Date().toLocaleString(),
          type: "restore",
        };
        auditLogs.unshift(newLog);
      },
    });
  };

  const getActionButtons = (provider) => {
    if (provider.status === "active") {
      return (
        <Space>
          <Button size="small" icon={<Eye size={14} />}>
            View
          </Button>
          <Button size="small" onClick={() => handleDisableAccount(provider)}>
            Disable
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleBlockAccount(provider)}
          >
            Block
          </Button>
        </Space>
      );
    } else if (
      provider.status === "disabled" ||
      provider.status === "blocked"
    ) {
      return (
        <Space>
          <Button size="small" icon={<Eye size={14} />}>
            View
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleRestoreAccount(provider)}
          >
            Restore
          </Button>
        </Space>
      );
    } else {
      return (
        <Space>
          <Button size="small" icon={<Eye size={14} />}>
            View
          </Button>
          <Button size="small" type="primary">
            Approve
          </Button>
          <Button
            size="small"
            danger
            onClick={() => handleDisableAccount(provider)}
          >
            Reject
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
    {
      title: "Action",
      key: "action",
      render: (_, record) => getActionButtons(record),
    },
  ];

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
              >
                Help Center
              </Button>
              <Button
                icon={<Shield size={16} />}
                className="border-gray-600 hover-lift"
                onClick={() => setAuditLogVisible(true)}
              >
                Audit Log
              </Button>
              <Button
                icon={<Bell size={16} />}
                className="border-gray-600 hover-lift"
              >
                Notifications
              </Button>
              <Button
                type="primary"
                icon={<Settings size={16} />}
                className="glow-button"
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
                extra={<Button type="link">View All Providers</Button>}
              >
                <Table
                  dataSource={recentProviders}
                  columns={columns}
                  pagination={false}
                  className="bg-transparent"
                  scroll={{ x: 800 }}
                />

                {/* <div className="mt-4 p-4 bg-gray-900 rounded-lg">
                  <Title level={5} className="text-white mb-2">
                    Account Status Legend
                  </Title>
                  <Space wrap>
                    <Tag color="green" className="flex items-center gap-1">
                      <CheckCircle size={14} />
                      <span>Active - Full access</span>
                    </Tag>
                    <Tag color="orange" className="flex items-center gap-1">
                      <AlertTriangle size={14} />
                      <span>Pending - Awaiting approval</span>
                    </Tag>
                    <Tag color="red" className="flex items-center gap-1">
                      <Ban size={14} />
                      <span>Disabled - Customer service action</span>
                    </Tag>
                    <Tag color="volcano" className="flex items-center gap-1">
                      <Shield size={14} />
                      <span>Blocked - Security threat</span>
                    </Tag>
                  </Space>
                </div> */}
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
                  >
                    Manage Providers
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<DollarSign size={16} />}
                    className="hover-lift"
                  >
                    Payment Reports
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<TrendingUp size={16} />}
                    className="hover-lift"
                  >
                    Analytics
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<Settings size={16} />}
                    className="hover-lift"
                  >
                    Platform Settings
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<Activity size={16} />}
                    className="hover-lift"
                  >
                    System Health
                  </Button>
                  <Button
                    block
                    size="large"
                    icon={<Shield size={16} />}
                    className="hover-lift"
                    onClick={() => setAuditLogVisible(true)}
                  >
                    Security Center
                  </Button>
                </Space>
              </Card>
            </Col>
          </Row>
        </div>

        {/* Audit Log Drawer */}
        <Drawer
          title="Audit Log - Account Actions"
          placement="right"
          size="large"
          onClose={() => setAuditLogVisible(false)}
          open={auditLogVisible}
          className="bg-black"
        >
          <Paragraph className="text-gray-400 mb-6">
            Track all account management actions for transparency and
            compliance.
          </Paragraph>

          <Timeline
            items={auditLogs.map((log) => ({
              dot:
                log.type === "block" ? (
                  <Shield size={16} className="text-red-500" />
                ) : log.type === "disable" ? (
                  <Ban size={16} className="text-orange-500" />
                ) : (
                  <CheckCircle size={16} className="text-green-500" />
                ),
              children: (
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <Title level={5} className="text-white mb-1">
                      {log.action}
                    </Title>
                    <span className="text-gray-500 text-sm">
                      {log.timestamp}
                    </span>
                  </div>
                  <Paragraph className="text-gray-300 mb-1">
                    <strong>Target:</strong> {log.target}
                  </Paragraph>
                  <Paragraph className="text-gray-300 mb-1">
                    <strong>Reason:</strong> {log.reason}
                  </Paragraph>
                  <Paragraph className="text-gray-400 text-sm">
                    Action by: {log.admin}
                  </Paragraph>
                </div>
              ),
            }))}
          />
        </Drawer>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
