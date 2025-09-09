import React, { useState } from "react";
import { Card, Table, Tag, Typography, Space, Button } from "antd";
import { DollarSign, Download, Eye } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

const { Title, Paragraph } = Typography;

const AdminPayments = () => {
  const [payments] = useState([
    {
      key: "1",
      id: "TXN12345",
      client: "John Doe",
      provider: "Elite Catering",
      amount: 250,
      status: "completed",
      date: "2025-09-01",
    },
    {
      key: "2",
      id: "TXN67890",
      client: "Sarah Lee",
      provider: "Perfect Photos",
      amount: 500,
      status: "pending",
      date: "2025-09-05",
    },
    {
      key: "3",
      id: "TXN54321",
      client: "Mike Ross",
      provider: "DJ Master",
      amount: 300,
      status: "failed",
      date: "2025-09-08",
    },
  ]);

  const columns = [
    { title: "Transaction ID", dataIndex: "id", key: "id" },
    { title: "Client", dataIndex: "client", key: "client" },
    { title: "Provider", dataIndex: "provider", key: "provider" },
    { title: "Date", dataIndex: "date", key: "date" },
    {
      title: "Amount",
      dataIndex: "amount",
      key: "amount",
      render: (amt) => `$${amt}`,
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        const colors = {
          completed: "green",
          pending: "orange",
          failed: "red",
        };
        return <Tag color={colors[status]}>{status.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<Eye size={14} />}>
            View
          </Button>
          <Button size="small" icon={<Download size={14} />}>
            Invoice
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white">Payments</Title>
        <Paragraph className="text-gray-400 mb-4">
          View and manage all platform transactions.
        </Paragraph>
        <Card className="glow-border">
          <Table dataSource={payments} columns={columns} pagination={false} />
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminPayments;
