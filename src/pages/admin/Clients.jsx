import React, { useState } from "react";
import { Table, Button, Space, Avatar, Typography, message, Modal, Tag } from "antd";
import { Eye, Ban, CheckCircle } from "lucide-react";
import AdminLayout from "../../components/AdminLayout";

const { Title, Paragraph } = Typography;

const AdminClients = () => {
  const [clients, setClients] = useState([
    {
      key: "1",
      name: "John Doe",
      email: "john@example.com",
      joinDate: "2025-01-01",
      status: "active",
    },
    {
      key: "2",
      name: "Jane Smith",
      email: "jane@example.com",
      joinDate: "2025-01-05",
      status: "disabled",
    },
  ]);

  const handleDisable = (record) => {
    Modal.confirm({
      title: `Disable ${record.name}?`,
      content: "This client will be disabled temporarily.",
      okType: "danger",
      onOk: () => {
        setClients(clients.map((c) =>
          c.key === record.key ? { ...c, status: "disabled" } : c
        ));
        message.success(`${record.name} disabled successfully`);
      }
    });
  };

  const columns = [
    {
      title: "Client",
      dataIndex: "name",
      key: "name",
      render: (text, record) => (
        <div className="flex items-center">
          <Avatar style={{ backgroundColor: "#F59E0B", marginRight: 12 }}>
            {text[0]}
          </Avatar>
          <div>
            <div className="text-white">{text}</div>
            <div className="text-gray-400 text-sm">{record.email}</div>
          </div>
        </div>
      ),
    },
    { title: "Join Date", dataIndex: "joinDate", key: "joinDate" },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status.toUpperCase()}
        </Tag>
      ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space>
          <Button size="small" icon={<Eye size={14} />}>View</Button>
          {record.status === "active" && (
            <Button size="small" danger onClick={() => handleDisable(record)}>
              Disable
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <AdminLayout>
      <div className="p-6">
        <Title level={2} className="text-white">Clients</Title>
        <Paragraph className="text-gray-400">
          Manage all clients on the platform.
        </Paragraph>
        <Table
          dataSource={clients}
          columns={columns}
          rowKey="key"
          pagination={{ pageSize: 5 }}
          className="bg-transparent mt-4"
        />
      </div>
    </AdminLayout>
  );
};

export default AdminClients;
