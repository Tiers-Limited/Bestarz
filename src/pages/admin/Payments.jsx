import React, { useEffect, useState } from "react";
import { Card, Table, Tag, Typography, Space, Button, Spin, message, Row, Col, Select } from "antd";
import { Download, Eye } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";
import { useAdmin } from "../../context/admin/AdminContext";

const { Title, Paragraph } = Typography;
const { Option } = Select;

const AdminPayments = () => {
  const { payments, fetchPayments, loading, clients, providers, fetchClients, fetchProviders } = useAdmin();

  const [stats, setStats] = useState({});
  const [filters, setFilters] = useState({ status: "", provider: "", client: "" });

  // Load clients and providers for filter selects
  useEffect(() => {
    fetchClients();
    fetchProviders();
  }, []);

  // Load payments whenever filters change
  useEffect(() => {
    loadPayments();
  }, [filters]);

  const loadPayments = async () => {
    // Only include filters that have a value
    const activeFilters = Object.fromEntries(
      Object.entries(filters).filter(([_, value]) => value)
    );

    const res = await fetchPayments({ page: 1, limit: 20, ...activeFilters });
    if (!res.success) {
      message.error(res.error || "Failed to fetch payments");
    } else {
      setStats(res.data.stats || {});
    }
  };

  const columns = [
    { title: "Transaction ID", dataIndex: "_id", key: "id" },
    {
      title: "Client",
      dataIndex: "client",
      key: "client",
      render: (client) => `${client?.firstName || ""} ${client?.lastName || ""}`,
    },
    {
      title: "Provider",
      dataIndex: "provider",
      key: "provider",
      render: (provider) => provider?.businessName || "-",
    },
    {
      title: "Service",
      dataIndex: "booking",
      key: "service",
      render: (booking) => booking?.serviceCategory || "-",
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      key: "date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amt, record) => `${record.currency} ${amt}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = { completed: "green", complete: "green", pending: "orange", failed: "red" };
        return <Tag color={colors[status] || "blue"}>{status.toUpperCase()}</Tag>;
      },
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: (_, record) => (
    //     <Space>
    //       <Button size="small" icon={<Eye size={14} />}>View</Button>
    //       <Button size="small" icon={<Download size={14} />}>Invoice</Button>
    //     </Space>
    //   ),
    // },
  ];

  // Generic handler for filter selects
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value || "" }));
  };

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white">Payments</Title>
        <Paragraph className="text-gray-400 mb-4">
          View and manage all platform transactions.
        </Paragraph>

        {/* --- Beautiful Stats Cards --- */}
        <Row gutter={[16, 16]} className="mb-6">
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-green-500">{stats.completed?.count || 0}</div>
              <div className="text-gray-400">Completed Payments</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-orange-500">{stats.pending?.count || 0}</div>
              <div className="text-gray-400">Pending Payments</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-red-500">{stats.failed?.count || 0}</div>
              <div className="text-gray-400">Failed Payments</div>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="text-center">
              <div className="text-2xl font-bold text-blue-500">{payments.length}</div>
              <div className="text-gray-400">Total Payments</div>
            </Card>
          </Col>
        </Row>

        {/* --- Filters --- */}
        <Space className="mb-4" wrap>
          <Select
            placeholder="Filter by Status"
            value={filters.status || undefined}
            onChange={(val) => handleFilterChange("status", val)}
            style={{ width: 180 }}
            allowClear
          >
            <Option value="completed">Completed</Option>
            <Option value="pending">Pending</Option>
            <Option value="failed">Failed</Option>
          </Select>

          <Select
            placeholder="Filter by Provider"
            value={filters.provider || undefined}
            onChange={(val) => handleFilterChange("provider", val)}
            style={{ width: 200 }}
            allowClear
          >
            {providers.map((p) => (
              <Option key={p._id} value={p._id}>{p.businessName}</Option>
            ))}
          </Select>

          <Select
            placeholder="Filter by Client"
            value={filters.client || undefined}
            onChange={(val) => handleFilterChange("client", val)}
            style={{ width: 200 }}
            allowClear
          >
            {clients.map((c) => (
              <Option key={c._id} value={c._id}>{c.firstName} {c.lastName}</Option>
            ))}
          </Select>
        </Space>

        {/* --- Payments Table --- */}
        <Card className="glow-border">
          {loading ? (
            <div className="flex justify-center items-center p-6">
              <Spin size="large" />
            </div>
          ) : (
            <Table
              dataSource={payments.map((p) => ({ ...p, key: p._id }))}
              columns={columns}
              pagination={false}
            />
          )}
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
